// Shared by the browser and Node API: no React, storage or network dependencies.
const FEEDBACK_VERSION = 2;
const STAGE_KEYS = ['opening', 'exploration', 'closing'];
const LEGACY_SECTIONS = ['caseUnderstanding', 'dataGaps', 'nextSession', 'openQuestions', 'supervision', 'humanReview'];
const object = (properties) => ({ type: 'object', additionalProperties: false, required: Object.keys(properties), properties });
const array = (items, minItems, maxItems) => ({ type: 'array', items,
  ...(minItems === undefined ? {} : { minItems, maxItems }) });
const text = { type: 'string' };
const shortText = { type: 'string', minLength: 1, maxLength: 480 };
const sources = array(text, 1, 7);
const entry = object({ title: { ...shortText, maxLength: 100 }, detail: shortText, sourceRefs: sources });
const legacyEntry = object({ title: text, detail: text, sourceRefs: array(text) });
const legacyFeedbackSchema = object(Object.fromEntries([
  ...LEGACY_SECTIONS.map((key) => [key, array(legacyEntry)]), ['limitations', array(text)],
]));
const stage = object({
  aim: { ...shortText, maxLength: 180 }, question: { ...shortText, maxLength: 360 }, rationale: shortText,
  followUps: array(object({ when: { ...shortText, maxLength: 180 }, question: { ...shortText, maxLength: 360 } }), 0, 2),
  sourceRefs: sources,
});
const feedbackSchema = object({
  priorities: array(entry, 1, 3),
  sessionRoute: object(Object.fromEntries(STAGE_KEYS.map((key) => [key, stage]))),
  reasoning: object({ facts: array(entry, 0, 3), hypotheses: array(entry, 0, 3), missingInfo: array(entry, 0, 3) }),
  supervision: array(entry, 0, 3), humanReview: array(entry, 0, 3), limitations: array(shortText, 1, 3),
});

function matches(value, schema, allowedRefs) {
  if (schema.type === 'string') {
    if (typeof value !== 'string') return false;
    const length = Array.from(value).length;
    return (schema.minLength === undefined || (value.trim().length > 0 && length >= schema.minLength))
      && (schema.maxLength === undefined || length <= schema.maxLength);
  }
  if (schema.type === 'array') return Array.isArray(value)
    && (schema.minItems === undefined || value.length >= schema.minItems)
    && (schema.maxItems === undefined || value.length <= schema.maxItems)
    && value.every((item) => matches(item, schema.items, allowedRefs));
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  if (schema.required.some((key) => !Object.prototype.hasOwnProperty.call(value, key))) return false;
  return Object.keys(value).every((key) => Object.prototype.hasOwnProperty.call(schema.properties, key)
    && matches(value[key], schema.properties[key], allowedRefs)
    && (key !== 'sourceRefs' || !allowedRefs || value[key].every((ref) => allowedRefs.has(ref))));
}
function validFeedbackResult(result, version, sourceRefs) {
  const schema = version === 1 ? legacyFeedbackSchema : version === 2 ? feedbackSchema : null;
  return Boolean(schema && matches(result, schema, sourceRefs ? new Set(sourceRefs) : null));
}
module.exports = { FEEDBACK_VERSION, STAGE_KEYS, LEGACY_SECTIONS, legacyFeedbackSchema, feedbackSchema, validFeedbackResult };
