import fields from './fields.json';
import { FEEDBACK_VERSION, STAGE_KEYS, validFeedbackResult } from './feedbackContract.mjs';

export { FEEDBACK_VERSION, STAGE_KEYS, validFeedbackResult };
export const stageTitles = { opening: 'First, connect and confirm', exploration: 'Then, explore further', closing: 'Reflect and close together' };
export const reasoningTitles = { facts: 'What the record says', hypotheses: 'Possible understandings to check', missingInfo: 'Information still to explore' };

export const emptyRecord = () => Object.fromEntries(Object.keys(fields).map((key) => [key, '']));
export const recordKey = (record, language) => JSON.stringify([FEEDBACK_VERSION, language, ...Object.keys(fields).map((key) => record[key])]);
export function validateRecord(record) {
  return Object.fromEntries(Object.entries(fields).flatMap(([key, { limit }]) => {
    if (record[key].length > limit) return [[key, 'Practice field is too long.']];
    if (key === 'summary' && !record[key].trim()) return [[key, 'Please enter a session summary.']];
    return [];
  }));
}
export const examples = {
  cn: {
    caseCode: 'PRACTICE-01', caseCategory: '学业',
    background: '虚构个案：一名大学生因课程作业和小组合作感到压力。所有情节均为虚构。',
    summary: '学生表示过去两周作业集中，担心无法达到自己的期望。小组成员回复较慢时，会反复查看消息，难以专注。学生希望改善时间安排，也提到不太敢向组员表达需要。尚未探索睡眠、支持资源及压力对日常生活的影响。',
    actions: '运用开放式提问和情绪反映，协助学生整理压力来源，并邀请学生记录本周最困难的时刻。尚未共同订立具体目标。',
    understanding: '我初步理解学业期望和表达需要的困难可能互相影响，但需要进一步确认。',
    questions: '下次会谈可以怎样探索学生的需要，并与学生一起订立可行目标？',
  },
  en: {
    caseCode: 'PRACTICE-01', caseCategory: '学业',
    background: 'Fictional case: a university student feels stressed about assignments and group work. All details are invented.',
    summary: 'The student described overlapping deadlines over the past two weeks and worries about meeting their own expectations. When group members reply slowly, the student repeatedly checks messages and finds it hard to concentrate. They want to manage time better and find it difficult to express their needs to the group. Sleep, support resources, and the impact on daily life have not yet been explored.',
    actions: 'Used open-ended questions and reflection of feelings to explore sources of stress. Invited the student to note difficult moments this week. Specific goals have not yet been agreed together.',
    understanding: 'Academic expectations and difficulty expressing needs may interact, but this needs further exploration.',
    questions: 'How could I explore the student’s needs and collaboratively set achievable goals next session?',
  },
};

export async function requestFeedback(record, language, signal) {
  const response = await fetch('/api/ai/student-feedback', {
    method: 'POST', credentials: 'omit', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...record, language, confirmed: true, feedbackVersion: FEEDBACK_VERSION }), signal,
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.success || !payload.data?.result || payload.data.language !== language) {
    const code = payload?.error?.code === 'AUTH_NOT_CONFIGURED' ? 'Practice AI origin is not configured. Please contact an administrator.' : payload?.error?.code;
    throw Object.assign(new Error('Feedback request failed'), { code: code || 'AI_REQUEST_FAILED' });
  }
  const sourceRefs = Object.keys(fields).filter((key) => record[key]?.trim()).map((key) => `field:${key}`);
  if (payload.data.feedbackVersion !== FEEDBACK_VERSION || !validFeedbackResult(payload.data.result, sourceRefs)) {
    throw Object.assign(new Error('Invalid feedback result'), { code: 'AI_INVALID_OUTPUT' });
  }
  return payload.data;
}
