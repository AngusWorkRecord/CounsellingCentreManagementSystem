import { formatDuration, toNumber } from '../..';
import {
  WORKFLOW_STATUS,
  getReminderDetails,
  getSessionEndedAt,
  getWorkflowStatus,
} from '../workflow';

export const ALL = '全部';
export const INITIAL_FILTERS = {
  search: '',
  sessionMode: ALL,
  category: ALL,
  status: ALL,
};

export function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function getCurrentYear() {
  return String(new Date().getFullYear());
}

export function mapSessionToCase(session, index) {
  const sessionEndedAt = getSessionEndedAt(session.counselling_date, session.session_end);
  const workflowStatus = getWorkflowStatus({
    sessionEndedAt,
    caseNumber: session.case_number,
    reportUrl: session.report_url,
  });
  const reminder =
    workflowStatus === WORKFLOW_STATUS.DETAILED_PENDING
      ? getReminderDetails(sessionEndedAt)
      : null;

  return {
    id: String(session.id || `case-${index + 1}`),
    submissionId: session.submission_id || '',
    caseNumber: String(session.case_number || '').trim(),
    reportUrl: String(session.report_url || '').trim(),
    date: String(session.counselling_date || '').slice(0, 10),
    initials: session.client_initials || '-',
    sessionMode: session.session_mode || '未分类',
    category: session.case_category || '未分类',
    counsellor: session.counsellor || '-',
    duration: formatDuration(session.duration_minutes),
    amount: toNumber(session.amount_received_rm),
    briefReportCompleted: Boolean(String(session.case_number || '').trim()),
    detailedReportCompleted: Boolean(String(session.report_url || '').trim()),
    workflowStatus,
    sessionEndedAt,
    reminderStage: reminder?.stage || '',
    elapsedSinceEnd: reminder?.elapsedLabel || '',
  };
}

export function buildFilterOptions(sessions) {
  return {
    sessionModes: Array.from(
      new Set(sessions.map((session) => session.session_mode).filter(Boolean))
    ).sort(),
    categories: Array.from(
      new Set(sessions.map((session) => session.case_category).filter(Boolean))
    ).sort(),
  };
}

export function matchesCaseFilters(session, filters) {
  const query = filters.search.trim().toLocaleLowerCase();
  const matchesSearch =
    !query ||
    [session.case_number, session.submission_id, session.client_initials, session.counsellor]
      .some((value) => String(value || '').toLocaleLowerCase().includes(query));
  const matchesMode = filters.sessionMode === ALL || session.session_mode === filters.sessionMode;
  const matchesCategory = filters.category === ALL || session.case_category === filters.category;
  const matchesStatus =
    filters.status === ALL || mapSessionToCase(session, 0).workflowStatus === filters.status;

  return matchesSearch && matchesMode && matchesCategory && matchesStatus;
}
