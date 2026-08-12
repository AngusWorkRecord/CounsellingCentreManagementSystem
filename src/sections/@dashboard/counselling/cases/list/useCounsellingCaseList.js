import { useEffect, useMemo, useState } from 'react';
import { getCounsellingSessions } from '../../../../../services/counsellingSessionService';
import {
  filterSessionsByPeriod,
  formatPeriodLabel,
  getSessionMonth,
  getSessionYear,
} from '../..';
import { WORKFLOW_STATUS } from '../workflow';
import {
  INITIAL_FILTERS,
  buildFilterOptions,
  getCurrentMonth,
  getCurrentYear,
  mapSessionToCase,
  matchesCaseFilters,
} from './utils';

export default function useCounsellingCaseList() {
  const [sessions, setSessions] = useState([]);
  const [filterMode, setFilterMode] = useState('month');
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth);
  const [selectedYear, setSelectedYear] = useState(getCurrentYear);
  const [customStart, setCustomStart] = useState(() => new Date());
  const [customEnd, setCustomEnd] = useState(() => new Date());
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSessions() {
      setLoading(true);
      setError('');
      try {
        setSessions(await getCounsellingSessions({ signal: controller.signal }));
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setError(requestError.message || '无法读取辅导个案资料');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadSessions();
    return () => controller.abort();
  }, [reloadKey]);

  const monthOptions = useMemo(() => {
    const months = new Set([getCurrentMonth()]);
    sessions.forEach((session) => {
      const month = getSessionMonth(session.counselling_date);
      if (month) months.add(month);
    });
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [sessions]);

  const yearOptions = useMemo(() => {
    const years = new Set([getCurrentYear()]);
    sessions.forEach((session) => {
      const year = getSessionYear(session.counselling_date);
      if (year) years.add(year);
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [sessions]);

  const periodSessions = useMemo(
    () => filterSessionsByPeriod(sessions, {
      mode: filterMode,
      month: selectedMonth,
      year: selectedYear,
      startDate: customStart,
      endDate: customEnd,
    }),
    [customEnd, customStart, filterMode, selectedMonth, selectedYear, sessions]
  );
  const filterOptions = useMemo(() => buildFilterOptions(periodSessions), [periodSessions]);
  const filteredSessions = useMemo(
    () => periodSessions.filter((session) => matchesCaseFilters(session, filters)),
    [filters, periodSessions]
  );
  const cases = useMemo(() => filteredSessions.map(mapSessionToCase), [filteredSessions]);
  const pendingCases = useMemo(
    () => cases.filter((item) =>
      item.workflowStatus === WORKFLOW_STATUS.DETAILED_PENDING && item.reminderStage
    ),
    [cases]
  );

  const handleModeChange = (mode) => {
    const today = new Date();
    setFilterMode(mode);
    if (mode === 'month') setSelectedMonth(getCurrentMonth());
    if (mode === 'year') setSelectedYear(getCurrentYear());
    if (mode === 'custom') {
      setCustomStart(today);
      setCustomEnd(today);
    }
  };

  const summary = {
    total: cases.length,
    briefPending: cases.filter((item) => item.workflowStatus === WORKFLOW_STATUS.BRIEF_PENDING).length,
    detailedPending: cases.filter((item) => item.workflowStatus === WORKFLOW_STATUS.DETAILED_PENDING).length,
    completed: cases.filter((item) => item.workflowStatus === WORKFLOW_STATUS.COMPLETED).length,
  };

  return {
    loading,
    error,
    reload: () => setReloadKey((value) => value + 1),
    periodLabel: formatPeriodLabel({ mode: filterMode, month: selectedMonth, year: selectedYear, startDate: customStart, endDate: customEnd }),
    filteredCount: filteredSessions.length,
    periodFilter: {
      mode: filterMode,
      month: selectedMonth,
      year: selectedYear,
      customStart,
      customEnd,
      monthOptions,
      yearOptions,
      onModeChange: handleModeChange,
      onMonthChange: setSelectedMonth,
      onYearChange: setSelectedYear,
      onCustomApply: (startDate, endDate) => {
        setCustomStart(startDate);
        setCustomEnd(endDate);
      },
    },
    caseFilter: {
      filters,
      options: filterOptions,
      onChange: (field, value) => setFilters((current) => ({ ...current, [field]: value })),
      onReset: () => setFilters(INITIAL_FILTERS),
    },
    cases,
    pendingCases,
    summary,
  };
}
