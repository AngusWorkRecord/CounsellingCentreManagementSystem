import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTheme } from '@mui/material/styles';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { getCounsellingSessions } from '../../services/counsellingSessionService';
import {
  CaseCategoryDistributionChart,
  CounsellingAiInsights,
  CounsellingMetricCard,
  CounsellingPeriodFilter,
  CounsellorWorkloadChart,
  DailyCollectionChart,
  SessionDurationChart,
  SessionModeDistributionChart,
  filterSessionsByPeriod,
  formatCurrency,
  formatDuration,
  formatPeriodLabel,
  getSessionMonth,
  getSessionYear,
  toNumber,
} from '../../sections/@dashboard/counselling';

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getCurrentYear() {
  return String(new Date().getFullYear());
}

export default function CounsellingDashboardPage() {
  const theme = useTheme();
  const [sessions, setSessions] = useState([]);
  const [filterMode, setFilterMode] = useState('month');
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth);
  const [selectedYear, setSelectedYear] = useState(getCurrentYear);
  const [customStart, setCustomStart] = useState(() => new Date());
  const [customEnd, setCustomEnd] = useState(() => new Date());
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

  const filteredSessions = useMemo(
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

  const handleCustomApply = (startDate, endDate) => {
    setCustomStart(startDate);
    setCustomEnd(endDate);
  };

  const periodLabel = formatPeriodLabel({
    mode: filterMode,
    month: selectedMonth,
    year: selectedYear,
    startDate: customStart,
    endDate: customEnd,
  });

  const totalMinutes = filteredSessions.reduce(
    (total, session) => total + toNumber(session.duration_minutes),
    0
  );
  const totalCollection = filteredSessions.reduce(
    (total, session) => total + toNumber(session.amount_received_rm),
    0
  );
  const averageMinutes = filteredSessions.length ? totalMinutes / filteredSessions.length : 0;

  return (
    <>
      <Helmet>
        <title>辅导个案管理 | Dashboard</title>
      </Helmet>

      <Container maxWidth={false}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'flex-start', md: 'center' }}
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography variant="h3" gutterBottom>
              辅导个案管理 Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              样本期间：{periodLabel} ｜ 数据笔数：{filteredSessions.length}
            </Typography>
          </Box>

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
            onCustomApply={handleCustomApply}
          />
        </Stack>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={() => setReloadKey((value) => value + 1)}>
                重新加载
              </Button>
            }
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
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} lg={3}>
              <CounsellingMetricCard
                title="总个案数"
                value={filteredSessions.length}
                icon="solar:folder-with-files-bold-duotone"
                color={theme.palette.primary.main}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <CounsellingMetricCard
                title="总辅导时长"
                value={formatDuration(totalMinutes)}
                icon="solar:clock-circle-bold-duotone"
                color={theme.palette.info.main}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <CounsellingMetricCard
                title="平均辅导时长"
                value={formatDuration(averageMinutes)}
                icon="solar:stopwatch-bold-duotone"
                color={theme.palette.secondary.main}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <CounsellingMetricCard
                title="收到款项"
                value={formatCurrency(totalCollection)}
                icon="solar:wallet-money-bold-duotone"
                color={theme.palette.primary.main}
              />
            </Grid>

            <Grid item xs={12} md={6} xl={3}>
              <SessionModeDistributionChart sessions={filteredSessions} />
            </Grid>
            <Grid item xs={12} md={6} xl={3}>
              <CaseCategoryDistributionChart sessions={filteredSessions} />
            </Grid>
            <Grid item xs={12} md={6} xl={3}>
              <CounsellorWorkloadChart sessions={filteredSessions} />
            </Grid>
            <Grid item xs={12} md={6} xl={3}>
              <SessionDurationChart sessions={filteredSessions} />
            </Grid>

            <Grid item xs={12} lg={4}>
              <DailyCollectionChart sessions={filteredSessions} />
            </Grid>
            <Grid item xs={12} lg={8}>
              <CounsellingAiInsights />
            </Grid>
          </Grid>
        )}
      </Container>
    </>
  );
}
