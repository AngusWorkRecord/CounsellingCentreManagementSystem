import assert from 'node:assert/strict';
import test from 'node:test';

import { apiError } from '../_lib/ai.mjs';
import { createCaseAdviceHandler } from './case-advice.mjs';
import { createManagementInsightsHandler } from './management-insights.mjs';

function responseMock() {
  return {
    statusCode: 200,
    body: null,
    headers: {},
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

function caseResult() {
  return {
    riskLevel: 'no_immediate_signal', riskSignals: [], dataGaps: [], recommendedActions: [],
    followUpPriority: 'routine', limitations: [], safetyNotice: 'Human review required.',
  };
}

test('case endpoint rejects empty allowed fields without calling the model', async () => {
  let modelCalls = 0;
  const handler = createCaseAdviceHandler({
    assertAiAvailable() {},
    getSql: () => async () => [{ id: 1, client_summary: ' ', volunteer_actions: null, updated_at: '2026-01-01' }],
    requestStructuredAnalysis: async () => { modelCalls += 1; return caseResult(); },
  });
  const response = responseMock();
  await handler({ method: 'POST', body: { sessionId: 1, action: 'generate' } }, response);
  assert.equal(response.statusCode, 422);
  assert.equal(response.body.error.code, 'INVALID_REQUEST');
  assert.equal(modelCalls, 0);
});

test('case endpoint sends only the two allowed text fields to analysis', async () => {
  let modelInput;
  const handler = createCaseAdviceHandler({
    assertAiAvailable() {},
    getSql: () => async () => [{
      id: 7, client_summary: 'Summary', volunteer_actions: 'Follow up tomorrow', updated_at: '2026-01-01',
      client_phone: 'must-not-leak', client_initials: 'XX',
    }],
    startAnalysis: async () => ({ id: 'analysis-1', created_at: '2026-01-01' }),
    requestStructuredAnalysis: async ({ input }) => { modelInput = input; return caseResult(); },
    completeAnalysis: async () => {},
  });
  const response = responseMock();
  await handler({ method: 'POST', body: { sessionId: 7, action: 'generate' } }, response);
  assert.equal(response.statusCode, 201);
  assert.match(JSON.stringify(modelInput), /Summary/);
  assert.doesNotMatch(JSON.stringify(modelInput), /must-not-leak|client_phone|client_initials|XX/);
});

test('management endpoint anonymizes workload and suppresses small groups', async () => {
  let modelInput;
  const rows = Array.from({ length: 6 }, (_, index) => ({
    counselling_date: '2026-01-01', counsellor: index < 5 ? 'Private Name' : 'Small Group Name',
    session_mode: 'online', case_category: 'general', duration_minutes: 60,
    report_completed: true, notification_sent: true, amount_received_rm: 10,
  }));
  const handler = createManagementInsightsHandler({
    assertAiAvailable() {}, getSql: () => async () => rows,
    startAnalysis: async () => ({ id: 'analysis-2', created_at: '2026-01-01' }),
    requestStructuredAnalysis: async ({ input }) => {
      modelInput = input;
      return { status: 'stable', overview: [], trends: [], pendingItems: [], resourceRecommendations: [], limitations: [], safetyNotice: 'Review.' };
    },
    completeAnalysis: async () => {},
  });
  const response = responseMock();
  await handler({ method: 'POST', body: { dateFrom: '2026-01-01', dateTo: '2026-01-31', action: 'generate' } }, response);
  assert.equal(response.statusCode, 201);
  assert.deepEqual(modelInput.anonymizedWorkload, [{ sourceRef: 'metric:workload:1', label: 'staff-1', count: 5 }]);
  assert.doesNotMatch(JSON.stringify(modelInput), /Private Name|Small Group Name/);
});

test('database errors fail safely and do not invoke the model', async () => {
  let modelCalls = 0;
  const handler = createManagementInsightsHandler({
    assertAiAvailable() {},
    getSql: () => async () => { throw new Error('database unavailable with secret details'); },
    requestStructuredAnalysis: async () => { modelCalls += 1; },
  });
  const response = responseMock();
  await handler({ method: 'POST', body: { dateFrom: '2026-01-01', dateTo: '2026-01-31', action: 'generate' } }, response);
  assert.equal(response.statusCode, 500);
  assert.equal(response.body.error.code, 'INTERNAL_ERROR');
  assert.doesNotMatch(response.body.error.message, /secret details/);
  assert.equal(modelCalls, 0);
});

test('availability failure happens before database access', async () => {
  let databaseCalls = 0;
  const handler = createCaseAdviceHandler({
    assertAiAvailable() { throw apiError('AI_NOT_AVAILABLE', 503); },
    getSql() { databaseCalls += 1; return async () => []; },
  });
  const response = responseMock();
  await handler({ method: 'POST', body: { sessionId: 1, action: 'generate' } }, response);
  assert.equal(response.statusCode, 503);
  assert.equal(databaseCalls, 0);
});
