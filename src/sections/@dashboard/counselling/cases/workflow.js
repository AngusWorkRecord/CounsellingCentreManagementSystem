import { tr } from '../../../../locales/translate';

export const WORKFLOW_STATUS = {
  // 中文原文：接案未完成、待简要报告、待详细报告、全部完成
  INTAKE_PENDING: 'Intake Incomplete',
  BRIEF_PENDING: 'Brief Report Pending',
  DETAILED_PENDING: 'Detailed Report Pending',
  COMPLETED: 'Completed',
};

export const REMINDER_STAGE = {
  // 中文原文：首次提醒、第二次提醒、最后提醒
  FIRST: 'First Reminder',
  SECOND: 'Second Reminder',
  FINAL: 'Final Reminder',
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
  // 中文原文：天、小时
  const elapsedLabel = tr("{{p0}} days {{p1}} hr", { p0: days, p1: hours });

  return { stage, elapsedHours, elapsedLabel };
}

