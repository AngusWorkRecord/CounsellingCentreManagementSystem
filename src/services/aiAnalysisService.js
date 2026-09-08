import i18n from '../locales/i18n';
import { tr } from '../locales/translate';

async function postAnalysis(path, payload, { signal } = {}) {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, language: payload.language || i18n.resolvedLanguage || 'cn' }),
    signal,
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.success) {
    const error = new Error(tr(result?.error?.code || 'AI_REQUEST_FAILED'));
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

export function getCaseAdvice(sessionId, options = {}) {
  return postAnalysis('/api/ai/case-advice', { sessionId, language: options.language, action: 'latest' }, options);
}

export function generateCaseAdvice(sessionId, options = {}) {
  return postAnalysis('/api/ai/case-advice', { sessionId, language: options.language, action: 'generate' }, options);
}
