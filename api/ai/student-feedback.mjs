import { readFileSync } from 'node:fs';
import { assertWriteOrigin } from '../_lib/auth.mjs';
import { analysisLanguage, apiError, assertAiAvailable, commonSafetyPrompt, languageInstruction, requestStructuredAnalysis, writeApiError } from '../_lib/ai.mjs';

const fields = JSON.parse(readFileSync(new URL('../../src/sections/counselling-practice/fields.json', import.meta.url), 'utf8'));
const categories = ['精神', '情感与婚姻', '家庭', '亲子教养', '成瘾', '人际关系', '职业生涯', '学业', '身体健康', '其他', '咨询'];
const item = {
  type: 'object', additionalProperties: false, required: ['title', 'detail', 'sourceRefs'],
  properties: { title: { type: 'string' }, detail: { type: 'string' }, sourceRefs: { type: 'array', items: { type: 'string' } } },
};
export const feedbackSections = ['caseUnderstanding', 'dataGaps', 'nextSession', 'openQuestions', 'supervision', 'humanReview'];
export const studentFeedbackSchema = {
  type: 'object', additionalProperties: false,
  required: [...feedbackSections, 'limitations'],
  properties: Object.fromEntries([...feedbackSections.map((key) => [key, { type: 'array', items: item }]), ['limitations', { type: 'array', items: { type: 'string' } }]]),
};

export function validateStudentInput(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)
    || Object.keys(body).some((key) => ![...Object.keys(fields), 'language', 'confirmed'].includes(key))
    || body.confirmed !== true) throw apiError('INVALID_REQUEST', 400);
  const language = analysisLanguage(body.language);
  const record = {};
  for (const [key, { limit }] of Object.entries(fields)) {
    const value = body[key] ?? '';
    if (typeof value !== 'string' || value.length > limit) throw apiError('INVALID_REQUEST', 400);
    record[key] = value.trim();
  }
  if (!record.summary || (record.caseCategory && !categories.includes(record.caseCategory))) throw apiError('INVALID_REQUEST', 400);
  return { record, language };
}

export function createStudentFeedbackHandler(overrides = {}) {
  const dependencies = { assertWriteOrigin, assertAiAvailable, requestStructuredAnalysis, ...overrides };
  return async (request, response) => {
    response.setHeader('Cache-Control', 'no-store');
    if (request.method !== 'POST') {
      response.setHeader('Allow', 'POST');
      return response.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED' } });
    }
    try {
      if (process.env.STUDENT_AI_FEATURE_ENABLED !== 'true') throw apiError('AI_NOT_AVAILABLE', 503);
      dependencies.assertWriteOrigin(request);
      const { record, language } = validateStudentInput(request.body);
      dependencies.assertAiAvailable();
      // No database calls or application logging: anonymous practice remains ephemeral.
      const records = Object.entries(record).filter(([, content]) => content).map(([key, content]) => ({ sourceRef: `field:${key}`, content }));
      const result = await dependencies.requestStructuredAnalysis({
        instructions: `${commonSafetyPrompt}\n${languageInstruction(language)}\nSupport a novice counselling student's reflection using only this fictional or de-identified session. Do not grade the student or diagnose the client. Separate documented facts from cautious interpretations. Give practical next-session preparation, example open-ended questions, and points to discuss with a human supervisor. If information is missing, acknowledge it rather than inventing it. Put potential concerns requiring human attention in humanReview, with supporting sources and advice to consult a supervisor. Do not treat an empty humanReview as a declaration of safety. Cite the supplied field sources for suggestions; these are input references, not external research citations.`,
        input: { records }, schema: studentFeedbackSchema, schemaName: 'student_feedback', sourceRefs: records.map((entry) => entry.sourceRef),
      });
      return response.status(200).json({ success: true, data: { generatedAt: new Date().toISOString(), language, result } });
    } catch (error) {
      if (['FORBIDDEN', 'AUTH_NOT_CONFIGURED'].includes(error.code)) return response.status(error.status || 503).json({ success: false, error: { code: error.code } });
      return writeApiError(response, error);
    }
  };
}

export default createStudentFeedbackHandler();
