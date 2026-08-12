export const WORKFLOW_STATUS = {
  INTAKE_PENDING: '接案未完成',
  BRIEF_PENDING: '待简要报告',
  DETAILED_PENDING: '待详细报告',
  COMPLETED: '全部完成',
};

export const REMINDER_STAGE = {
  FIRST: '首次提醒',
  SECOND: '第二次提醒',
  FINAL: '最后提醒',
};

export function getSessionEndedAt(date, endTime) {
  const dateKey = String(date || '').slice(0, 10);
  const timeMatch = String(endTime || '').match(/^(\d{1,2}):(\d{2})/);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey) || !timeMatch) return null;

  const [year, month, day] = dateKey.split('-').map(Number);
  const hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);
  if (hours > 23 || minutes > 59) return null;

  const value = new Date(year, month - 1, day, hours, minutes);
  return Number.isNaN(value.getTime()) ? null : value;
}

export function getWorkflowStatus({ sessionEndedAt, caseNumber, reportUrl }, now = new Date()) {
  if (!sessionEndedAt || now < sessionEndedAt) return WORKFLOW_STATUS.INTAKE_PENDING;
  if (!String(caseNumber || '').trim()) return WORKFLOW_STATUS.BRIEF_PENDING;
  if (!String(reportUrl || '').trim()) return WORKFLOW_STATUS.DETAILED_PENDING;
  return WORKFLOW_STATUS.COMPLETED;
}

export function getReminderDetails(sessionEndedAt, now = new Date()) {
  if (!sessionEndedAt) return null;
  const elapsedMs = now.getTime() - sessionEndedAt.getTime();
  const elapsedHours = elapsedMs / (60 * 60 * 1000);
  if (elapsedHours < 24) return null;

  let stage = REMINDER_STAGE.FIRST;
  if (elapsedHours >= 24 * 7) stage = REMINDER_STAGE.FINAL;
  else if (elapsedHours >= 48) stage = REMINDER_STAGE.SECOND;

  const days = Math.floor(elapsedHours / 24);
  const hours = Math.floor(elapsedHours % 24);
  const elapsedLabel = days ? `${days}天${hours ? `${hours}小时` : ''}` : `${Math.floor(elapsedHours)}小时`;

  return { stage, elapsedHours, elapsedLabel };
}

