import {
  analysisDto,
  apiError,
  assertAiAvailable,
  caseAdviceSchema,
  commonSafetyPrompt,
  completeAnalysis,
  createScopeKey,
  failAnalysis,
  getLatestAnalysis,
  getSql,
  requestStructuredAnalysis,
  startAnalysis,
  writeApiError,
} from '../_lib/ai.mjs';

function cleanText(value, limit) {
  return typeof value === 'string' ? value.trim().slice(0, limit) : '';
}

export function createCaseAdviceHandler(overrides = {}) {
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
    const sessionId = String(body.sessionId || '');
    const action = body.action === 'latest' ? 'latest' : body.action === 'generate' ? 'generate' : null;
    if (!/^[1-9]\d*$/.test(sessionId) || !action) throw apiError('INVALID_REQUEST', 400);
    sql = dependencies.getSql();
    const rows = await sql`
      SELECT id, client_summary, volunteer_actions, updated_at
      FROM public.counselling_sessions WHERE id = ${sessionId}::bigint
    `;
    if (!rows.length) throw apiError('ANALYSIS_NOT_FOUND', 404);
    const row = rows[0];
    const summary = cleanText(row.client_summary, 12000);
    const actions = cleanText(row.volunteer_actions, 8000);
    if (!summary && !actions) throw apiError('INVALID_REQUEST', 422);
    const sourceRefs = ['field:client_summary', 'field:volunteer_actions'];
    const input = {
      dataCoverage: {
        clientSummary: Boolean(summary), volunteerActions: Boolean(actions), updatedAt: row.updated_at,
      },
      records: [
        { sourceRef: 'field:client_summary', type: 'client_summary', content: summary || '[missing]' },
        { sourceRef: 'field:volunteer_actions', type: 'volunteer_actions', content: actions || '[missing]' },
      ],
    };
    const scopeKey = createScopeKey('case_advice', { sessionId, updatedAt: row.updated_at });

    if (action === 'latest') {
      const latest = await dependencies.getLatestAnalysis(sql, 'case_advice', scopeKey);
      return response.status(200).json({ success: true, data: latest ? analysisDto(latest) : null });
    }

    analysis = await dependencies.startAnalysis(sql, {
      analysisType: 'case_advice', sessionId, scopeKey,
      filterSnapshot: { sessionId }, sourceManifest: sourceRefs,
    });
    const result = await dependencies.requestStructuredAnalysis({
      instructions: `${commonSafetyPrompt}\nAnalyse the single case record only. Identify documented signals, gaps, and practical counsellor next steps. The risk level is workflow triage, not diagnosis.`,
      input,
      schema: caseAdviceSchema,
      schemaName: 'case_advice',
      sourceRefs,
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

export default createCaseAdviceHandler();
