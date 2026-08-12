import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import Iconify from '../../components/iconify';
import { getCounsellingSessions } from '../../services/counsellingSessionService';
import {
  CounsellingPeriodFilter,
  filterSessionsByPeriod,
  formatDuration,
  formatPeriodLabel,
  getSessionMonth,
  getSessionYear,
  toNumber,
} from '../../sections/@dashboard/counselling';
import {
  CaseFilters,
  CaseSummary,
  CaseTable,
  PendingFollowUp,
  WORKFLOW_STATUS,
  getReminderDetails,
  getSessionEndedAt,
  getWorkflowStatus,
} from '../../sections/@dashboard/counselling/cases';

const ALL = '全部';
const initialFilters = { search: '', sessionMode: ALL, category: ALL, status: ALL };

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getCurrentYear() {
  return String(new Date().getFullYear());
}

function mapSession(session, index) {
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
    id: session.case_number || session.submission_id || `case-${index + 1}`,
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

export default function CounsellingCaseListPage() {
  const [sessions, setSessions] = useState([]);
  const [filterMode, setFilterMode] = useState('month');
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth);
  const [selectedYear, setSelectedYear] = useState(getCurrentYear);
  const [customStart, setCustomStart] = useState(() => new Date());
  const [customEnd, setCustomEnd] = useState(() => new Date());
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSessions() {
      setLoading(true);
      setError('');

      try {
        const data = await getCounsellingSessions({ signal: controller.signal });
        setSessions(data);
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
    () =>
      filterSessionsByPeriod(sessions, {
        mode: filterMode,
        month: selectedMonth,
        year: selectedYear,
        startDate: customStart,
        endDate: customEnd,
      }),
    [customEnd, customStart, filterMode, selectedMonth, selectedYear, sessions]
  );

  const filterOptions = useMemo(
    () => ({
      sessionModes: Array.from(
        new Set(periodSessions.map((session) => session.session_mode).filter(Boolean))
      ).sort(),
      categories: Array.from(
        new Set(periodSessions.map((session) => session.case_category).filter(Boolean))
      ).sort(),
    }),
    [periodSessions]
  );

  const filteredSessions = useMemo(() => {
    const query = filters.search.trim().toLocaleLowerCase();

    return periodSessions.filter((session) => {
      const matchesSearch =
        !query ||
        [session.case_number, session.submission_id, session.client_initials, session.counsellor].some((value) =>
          String(value || '').toLocaleLowerCase().includes(query)
        );
      const matchesMode = filters.sessionMode === ALL || session.session_mode === filters.sessionMode;
      const matchesCategory = filters.category === ALL || session.case_category === filters.category;
      const matchesStatus =
        filters.status === ALL || mapSession(session, 0).workflowStatus === filters.status;

      return matchesSearch && matchesMode && matchesCategory && matchesStatus;
    });
  }, [filters, periodSessions]);

  const cases = useMemo(() => filteredSessions.map(mapSession), [filteredSessions]);
  const pendingCases = useMemo(
    () => cases.filter((item) => item.workflowStatus === WORKFLOW_STATUS.DETAILED_PENDING && item.reminderStage),
    [cases]
  );
  const briefPending = cases.filter((item) => item.workflowStatus === WORKFLOW_STATUS.BRIEF_PENDING).length;
  const detailedPending = cases.filter((item) => item.workflowStatus === WORKFLOW_STATUS.DETAILED_PENDING).length;
  const completed = cases.filter((item) => item.workflowStatus === WORKFLOW_STATUS.COMPLETED).length;

  const periodLabel = formatPeriodLabel({
    mode: filterMode,
    month: selectedMonth,
    year: selectedYear,
    startDate: customStart,
    endDate: customEnd,
  });

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

  const handleFilterChange = (field, value) =>
    setFilters((current) => ({ ...current, [field]: value }));

  return (
    <>
      <Helmet><title>个案管理 | 辅导中心</title></Helmet>
      <Container maxWidth={false}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'flex-start', md: 'center' }}
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              个案管理&nbsp;&nbsp;/&nbsp;&nbsp;个案列表
            </Typography>
            <Typography variant="h3" gutterBottom>个案管理</Typography>
            <Typography variant="body2" color="text.secondary">
              样本期间：{periodLabel} ｜ 数据笔数：{filteredSessions.length}
            </Typography>
          </Box>

          <Stack alignItems={{ xs: 'stretch', md: 'flex-end' }} spacing={2}>
            <CounsellingPeriodFilter
              mode={filterMode}
              month={selectedMonth}
              year={selectedYear}
              customStart={customStart}
              customEnd={customEnd}
              monthOptions={monthOptions}
              yearOptions={yearOptions}
              onModeChange={handleModeChange}
              onMonthChange={setSelectedMonth}
              onYearChange={setSelectedYear}
              onCustomApply={(startDate, endDate) => {
                setCustomStart(startDate);
                setCustomEnd(endDate);
              }}
            />
            <Button variant="contained" size="large" startIcon={<Iconify icon="eva:plus-circle-outline" />}>
              新增个案
            </Button>
          </Stack>
        </Stack>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            action={<Button color="inherit" size="small" onClick={() => setReloadKey((value) => value + 1)}>重新加载</Button>}
          >
            {error}
          </Alert>
        )}

        {loading && (
          <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 420 }}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              正在读取辅导个案资料…
            </Typography>
          </Stack>
        )}

        {!loading && !error && (
          <>
            <Card sx={{ p: { xs: 1.5, md: 2.5 }, mb: 3 }}>
              <CaseFilters
                filters={filters}
                options={filterOptions}
                onChange={handleFilterChange}
                onReset={() => setFilters(initialFilters)}
              />
              <CaseSummary
                total={cases.length}
                briefPending={briefPending}
                detailedPending={detailedPending}
                completed={completed}
              />
            </Card>

            <Stack spacing={3}>
              <CaseTable cases={cases} />
              <PendingFollowUp cases={pendingCases} />
            </Stack>
          </>
        )}
      </Container>
    </>
  );
}
