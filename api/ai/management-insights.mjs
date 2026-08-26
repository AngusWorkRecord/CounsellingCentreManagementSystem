import {
  analysisDto,
  assertAiAvailable,
  commonSafetyPrompt,
  completeAnalysis,
  createScopeKey,
  failAnalysis,
  getLatestAnalysis,
  getSql,
  managementSchema,
  requestStructuredAnalysis,
  startAnalysis,
  writeApiError,
  apiError,
} from '../_lib/ai.mjs';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MIN_GROUP_SIZE = 5;

function normalizeFilters(body) {
  const { dateFrom, dateTo } = body;
  if (!DATE_PATTERN.test(dateFrom || '') || !DATE_PATTERN.test(dateTo || '') || dateFrom > dateTo) {
    throw apiError('INVALID_REQUEST', 400);
  }
  const categories = Array.isArray(body.categories)
    ? body.categories.filter((item) => typeof item === 'string' && item.length <= 80).slice(0, 20).sort()
    : [];
  const counsellors = Array.isArray(body.counsellors)
    ? body.counsellors.filter((item) => typeof item === 'string' && item.length <= 100).slice(0, 50).sort()
    : [];
  return { dateFrom, dateTo, categories, counsellors };
}

function countBy(rows, field) {
  const counts = new Map();
  rows.forEach((row) => {
    const key = row[field] || '未分类';
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return Array.from(counts, ([label, count]) => ({ label, count }));
}

function buildAggregate(rows, filters) {
  const filtered = rows.filter((row) => {
    if (filters.categories.length && !filters.categories.includes(row.case_category)) return false;
    if (filters.counsellors.length && !filters.counsellors.includes(row.counsellor)) return false;
    return true;
  });
  const total = filtered.length;
  const totalMinutes = filtered.reduce((sum, row) => sum + Number(row.duration_minutes || 0), 0);
  const reportsCompleted = filtered.filter((row) => row.report_completed).length;
  const notificationsPending = filtered.filter((row) => !row.notification_sent).length;
  const zeroCollection = filtered.filter((row) => Number(row.amount_received_rm || 0) === 0).length;
  const sourceRefs = [
    'metric:total', 'metric:duration', 'metric:report_completion',
    'metric:notification_pending', 'metric:zero_collection',
  ];
  const visibleGroups = (field, prefix) => countBy(filtered, field)
    .filter((item) => item.count >= MIN_GROUP_SIZE)
    .map((item, index) => {
      const sourceRef = `metric:${prefix}:${index + 1}`;
      sourceRefs.push(sourceRef);
      return { sourceRef, label: field === 'counsellor' ? `staff-${index + 1}` : item.label, count: item.count };
    });

  return {
    sourceRefs,
    payload: {
      period: { from: filters.dateFrom, to: filters.dateTo },
      metrics: {
        total: { sourceRef: 'metric:total', value: total },
        durationMinutes: { sourceRef: 'metric:duration', value: totalMinutes },
        reportCompletion: { sourceRef: 'metric:report_completion', completed: reportsCompleted, total },
        notificationsPending: { sourceRef: 'metric:notification_pending', value: notificationsPending, total },
        zeroCollection: { sourceRef: 'metric:zero_collection', value: zeroCollection, total },
      },
      categories: visibleGroups('case_category', 'category'),
      sessionModes: visibleGroups('session_mode', 'mode'),
      anonymizedWorkload: visibleGroups('counsellor', 'workload'),
      smallSampleRule: `Groups below ${MIN_GROUP_SIZE} records are omitted.`,
    },
  };
}

export function createManagementInsightsHandler(overrides = {}) {
  const dependencies = {
    assertAiAvailable, getSql, getLatestAnalysis, startAnalysis, requestStructuredAnalysis,
    completeAnalysis, failAnalysis, ...overrides,
  };

  return async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'POST') return response.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED' } });

  let analysis;
  let sql;
  try {
    dependencies.assertAiAvailable();
    const body = request.body || {};
    const filters = normalizeFilters(body);
    const action = body.action === 'latest' ? 'latest' : body.action === 'generate' ? 'generate' : null;
    if (!action) throw apiError('INVALID_REQUEST', 400);
    sql = dependencies.getSql();
    const rows = await sql`
      SELECT counselling_date, counsellor, session_mode, case_category, duration_minutes,
             report_completed, notification_sent, amount_received_rm
      FROM public.counselling_sessions
      WHERE counselling_date BETWEEN ${filters.dateFrom}::date AND ${filters.dateTo}::date
    `;
    const aggregate = buildAggregate(rows, filters);
    const scopeKey = createScopeKey('management_insights', { filters, aggregate: aggregate.payload });

    if (action === 'latest') {
      const latest = await dependencies.getLatestAnalysis(sql, 'management_insights', scopeKey);
      return response.status(200).json({ success: true, data: latest ? analysisDto(latest) : null });
    }

    analysis = await dependencies.startAnalysis(sql, {
      analysisType: 'management_insights', scopeKey, filterSnapshot: filters,
      sourceManifest: aggregate.sourceRefs,
    });
    const result = await dependencies.requestStructuredAnalysis({
      instructions: `${commonSafetyPrompt}\nAnalyse only de-identified operational aggregates. Never infer an individual or reconstruct omitted groups.`,
      input: aggregate.payload,
      schema: managementSchema,
      schemaName: 'management_insights',
      sourceRefs: aggregate.sourceRefs,
    });
    await dependencies.completeAnalysis(sql, analysis.id, result);
    return response.status(201).json({ success: true, data: { analysisId: analysis.id, generatedAt: analysis.created_at, result } });
  } catch (error) {
    if (analysis && sql) {
      const status = error.code === 'AI_TIMEOUT' ? 'timeout'
        : error.code === 'AI_REFUSED' ? 'refused'
          : error.code === 'AI_INVALID_OUTPUT' ? 'invalid_output' : 'upstream_error';
      await dependencies.failAnalysis(sql, analysis.id, status, error.code || 'INTERNAL_ERROR').catch(() => {});
    }
    return writeApiError(response, error);
  }
  };
}

export default createManagementInsightsHandler();
