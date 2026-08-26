async function postAnalysis(path, payload, { signal } = {}) {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.success) {
    const error = new Error(result?.error?.message || '无法完成 AI 分析');
    error.code = result?.error?.code || 'AI_REQUEST_FAILED';
    error.status = response.status;
    throw error;
  }
  return result.data;
}

export function getManagementInsights(payload, options) {
  return postAnalysis('/api/ai/management-insights', { ...payload, action: 'latest' }, options);
}

export function generateManagementInsights(payload, options) {
  return postAnalysis('/api/ai/management-insights', { ...payload, action: 'generate' }, options);
}

export function getCaseAdvice(sessionId, options) {
  return postAnalysis('/api/ai/case-advice', { sessionId, action: 'latest' }, options);
}

export function generateCaseAdvice(sessionId, options) {
  return postAnalysis('/api/ai/case-advice', { sessionId, action: 'generate' }, options);
}
