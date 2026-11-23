import { readFileSync } from 'node:fs';
import { assertWriteOrigin } from './auth.mjs';
import { analysisLanguage, apiError, assertAiAvailable, commonSafetyPrompt, languageInstruction, requestStructuredAnalysis, writeApiError } from './ai.mjs';
import * as contract from '../../src/sections/counselling-practice/feedbackContract.mjs';

const fields = JSON.parse(readFileSync(new URL('../../src/sections/counselling-practice/fields.json', import.meta.url), 'utf8'));
const categories = ['精神', '情感与婚姻', '家庭', '亲子教养', '成瘾', '人际关系', '职业生涯', '学业', '身体健康', '其他', '咨询'];
// Keep the provider schema within the basic subset already used by this app.
// Length/count constraints vary by model; enforce the full contract locally.
function modelSchema({ minLength, maxLength, minItems, maxItems, properties, items, ...schema }) {
  return { ...schema,
    ...(properties ? { properties: Object.fromEntries(Object.entries(properties).map(([key, value]) => [key, modelSchema(value)])) } : {}),
    ...(items ? { items: modelSchema(items) } : {}),
    ...(maxLength === undefined ? {} : { description: `Use ${minLength} to ${maxLength} characters.` }),
    ...(maxItems === undefined ? {} : { description: `Return ${minItems} to ${maxItems} items.` }),
  };
}
export const studentFeedbackSchemaV2 = modelSchema(contract.feedbackSchema);
const preparationInstructions = `Support a student with placement experience or a counsellor preparing their next session.
Use a warm, collaborative and integrative perspective. Do not impose a counselling modality or diagnose, grade, or assume a client's response.
Give 1 to 3 record-specific priorities, then an opening, exploration and closing route. Each stage needs one natural, non-leading main question,
a concise aim and rationale grounded in the submitted record, and at most two conditional follow-up questions.
Use followUps.when for hypothetical client responses, never describe them as observed facts. These are adaptable options, not a compulsory script.
Keep every value brief (one or two sentences). Avoid generic advice such as "explore feelings" without a concrete question and purpose.
Separate documented observations in reasoning.facts from tentative interpretations in reasoning.hypotheses and unassessed areas in reasoning.missingInfo.
When the record is sparse, identify what is missing and offer clarifying questions; do not invent events, quotes, resources, diagnoses or client answers.
Use only supplied field sourceRefs for every priority, stage, reasoning item, supervision question and humanReview concern.
Put specific concerns requiring human attention in humanReview with grounded context and supervisor review; use an empty array when none is supported.
An empty humanReview is not evidence of safety. Supervision and limitations must acknowledge the boundaries of the submitted information.`;

export function validateStudentInput(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)
    || Object.keys(body).some((key) => ![...Object.keys(fields), 'language', 'confirmed', 'feedbackVersion'].includes(key))
    || body.confirmed !== true) throw apiError('INVALID_REQUEST', 400);
  const language = analysisLanguage(body.language);
  const feedbackVersion = body.feedbackVersion === undefined ? contract.FEEDBACK_VERSION : body.feedbackVersion;
  if (feedbackVersion !== contract.FEEDBACK_VERSION) throw apiError('INVALID_REQUEST', 400);
  const record = {};
  for (const [key, { limit }] of Object.entries(fields)) {
    const value = body[key] ?? '';
    if (typeof value !== 'string' || value.length > limit) throw apiError('INVALID_REQUEST', 400);
    record[key] = value.trim();
  }
  if (!record.summary || (record.caseCategory && !categories.includes(record.caseCategory))) throw apiError('INVALID_REQUEST', 400);
  return { record, language, feedbackVersion };
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
      const { record, language, feedbackVersion } = validateStudentInput(request.body);
      dependencies.assertAiAvailable();
      // No database calls or application logging: anonymous practice remains ephemeral.
      const records = Object.entries(record).filter(([, content]) => content).map(([key, content]) => ({ sourceRef: `field:${key}`, content }));
      const result = await dependencies.requestStructuredAnalysis({
        instructions: `${commonSafetyPrompt}\n${languageInstruction(language)}\n${preparationInstructions}`,
        input: { records }, schema: studentFeedbackSchemaV2,
        schemaName: 'student_feedback_v2', sourceRefs: records.map((entry) => entry.sourceRef),
      });
      if (!contract.validFeedbackResult(result, records.map((entry) => entry.sourceRef))) throw apiError('AI_INVALID_OUTPUT', 502);
      return response.status(200).json({ success: true, data: { generatedAt: new Date().toISOString(), language,
        feedbackVersion, result } });
    } catch (error) {
      if (['FORBIDDEN', 'AUTH_NOT_CONFIGURED'].includes(error.code)) return response.status(error.status || 503).json({ success: false, error: { code: error.code } });
      return writeApiError(response, error);
    }
  };
}

export default createStudentFeedbackHandler();
