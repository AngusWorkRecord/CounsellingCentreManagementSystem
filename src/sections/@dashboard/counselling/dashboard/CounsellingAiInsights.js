import PropTypes from 'prop-types';
import { useCallback, useMemo } from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Divider, Grid, Stack,
  ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material';
import Iconify from '../../../../components/iconify';
import { generateManagementInsights, getManagementInsights } from '../../../../services/aiAnalysisService';
import useAiAnalysis from '../useAiAnalysis';
import { groupCount, toNumber } from '../utils';

const STATUS_META = {
  // 中文原文：稳定、需要关注、优先处理、资料不足
  stable: { label: 'Stable', color: 'success' }, attention: { label: 'Needs Attention', color: 'warning' },
  urgent: { label: 'Priority Action', color: 'error' }, insufficient: { label: 'Insufficient Data', color: 'default' },
};
const OBSERVATION_META = {
  success: { color: 'success.main', icon: 'eva:checkmark-circle-2-fill' },
  warning: { color: 'warning.main', icon: 'eva:alert-triangle-fill' },
  error: { color: 'error.main', icon: 'eva:alert-circle-fill' },
  info: { color: 'info.main', icon: 'eva:info-fill' },
};

function percentage(value, total) { return total ? Math.round((value / total) * 100) : 0; }

function buildManagementInsights(sessions, metrics) {
  const total = sessions.length;
  if (!total) return {
    // 中文原文：当前筛选期间没有可供分析的辅导记录；调整日期筛选范围，或在录入辅导记录后重新查看；资料为空，因此没有生成运营结论
    status: 'insufficient', summaries: ['No counselling records are available for analysis in the selected period.'], observations: [],
    actions: ['Adjust the date range or return after counselling records have been added.'], warnings: ['No operational conclusions were generated because no data is available.'],
  };
  const completedReports = sessions.filter((item) => Boolean(item.report_completed)).length;
  const pendingNotifications = sessions.filter((item) => !item.notification_sent).length;
  const zeroCollection = sessions.filter((item) => toNumber(item.amount_received_rm) === 0).length;
  const invalidDuration = sessions.filter((item) => toNumber(item.duration_minutes) <= 0).length;
  const categories = groupCount(sessions, 'case_category').sort((a, b) => b.value - a.value);
  const modes = groupCount(sessions, 'session_mode').sort((a, b) => b.value - a.value);
  const counsellors = groupCount(sessions, 'counsellor').sort((a, b) => b.value - a.value);
  const reportRate = percentage(completedReports, total);
  const pendingRate = percentage(pendingNotifications, total);
  const zeroRate = percentage(zeroCollection, total);
  const topCategory = categories[0];
  const topMode = modes[0];
  const topCounsellor = counsellors[0];
  const concentration = topCounsellor ? topCounsellor.value / Math.max(total / counsellors.length, 1) : 0;
  const summaries = [
    // 中文原文：当前范围记录、详细报告完成率、尚未发送通知、类别及辅导人员统计
    `${total} counselling records are in scope, totalling ${Math.round(metrics.totalMinutes)} minutes.`,
    `The detailed report completion rate is ${reportRate}% (${completedReports}/${total}).`,
    `${pendingRate}% of records have pending notifications (${pendingNotifications}/${total}).`,
    `The records cover ${categories.length} categories and ${counsellors.length} counsellors.`,
  ];
  const observations = [];
  const actions = [];
  const warnings = [];
  if (pendingNotifications) {
    observations.push({ severity: pendingRate >= 30 ? 'warning' : 'info', text: `${pendingNotifications} records have pending notifications.` });
    actions.push('Prioritise records with pending notifications and have the person responsible confirm the follow-up action.');
  } else observations.push({ severity: 'success', text: 'All notifications within the current scope have been sent.' });
  if (completedReports < total) {
    observations.push({ severity: reportRate < 70 ? 'warning' : 'info', text: `${total - completedReports} detailed reports remain incomplete.` });
    actions.push('Complete outstanding detailed reports and verify their links and completion status.');
  } else observations.push({ severity: 'success', text: 'All detailed reports within the current scope are complete.' });
  if (zeroCollection) {
    observations.push({ severity: zeroRate >= 50 ? 'warning' : 'info', text: `${zeroCollection} records show RM0 payments (${zeroRate}%).` });
    actions.push('Manually verify whether RM0 records represent free services, fee waivers, or pending payments.');
  }
  if (topCategory && percentage(topCategory.value, total) >= 40 && total >= 5) {
    observations.push({ severity: 'info', text: `“${topCategory.label}” is the leading category at ${percentage(topCategory.value, total)}%.` });
    actions.push(`Assess whether staffing and service resources for “${topCategory.label}” are sufficient.`);
  }
  if (topMode) observations.push({ severity: 'info', text: `“${topMode.label}” is the most used mode, with ${topMode.value} cases.` });
  if (concentration >= 1.5 && total >= 5) {
    observations.push({ severity: 'warning', text: `Workload is concentrated on ${topCounsellor.label} (${topCounsellor.value} cases).` });
    actions.push('Have management review workload distribution among counsellors.');
  }
  if (invalidDuration) warnings.push(`${invalidDuration} records do not have a valid counselling duration.`);
  if (total < 5) warnings.push('The sample contains fewer than five cases, so no detailed trend conclusion is shown.');
  if (!actions.length) actions.push('Maintain the current process and continue monitoring reports, notifications, and workload indicators.');
  let status = 'stable';
  if (pendingNotifications || completedReports < total || concentration >= 1.5) status = 'attention';
  if (pendingRate >= 50 || reportRate < 50) status = 'urgent';
  return { status, summaries, observations, actions, warnings };
}

function InsightItems({ items, emptyText }) {
  if (!items?.length) return <Typography variant="body2" color="text.secondary">{emptyText}</Typography>;
  return (
    <Stack spacing={1.5}>
      {items.map((item) => {
        const meta = OBSERVATION_META[item.severity] || OBSERVATION_META.info;
        return (
          <Stack key={`${item.title}-${item.detail}`} direction="row" spacing={1} alignItems="flex-start">
            <Iconify icon={meta.icon} sx={{ color: meta.color, mt: 0.25, flexShrink: 0 }} />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2">{item.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>{item.detail}</Typography>
            </Box>
          </Stack>
        );
      })}
    </Stack>
  );
}

InsightItems.propTypes = { items: PropTypes.array, emptyText: PropTypes.string.isRequired };

export default function CounsellingAiInsights({ dateRange, metrics, sessions }) {
  const theme = useTheme();
  const general = useMemo(() => buildManagementInsights(sessions, metrics), [metrics, sessions]);
  const requestPayload = useMemo(() => ({ dateFrom: dateRange.dateFrom, dateTo: dateRange.dateTo }), [dateRange.dateFrom, dateRange.dateTo]);
  const scopeKey = `${dateRange.dateFrom}:${dateRange.dateTo}`;
  const loadLatest = useCallback((options) => getManagementInsights(requestPayload, options), [requestPayload]);
  const generate = useCallback((options) => generateManagementInsights(requestPayload, options), [requestPayload]);
  const ai = useAiAnalysis({ generate, loadLatest, scopeKey });
  const result = ai.analysis?.result;
  const status = STATUS_META[ai.mode === 'general' ? general.status : result?.status || 'insufficient'];

  return (
    <Card sx={{ height: 1, minWidth: 0 }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ p: 1, borderRadius: '50%', color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.12), display: 'flex' }}>
              <Iconify icon="mdi:robot-outline" width={26} />
            </Box>
            <Box><Typography variant="h6">G. Operations and Management Recommendations</Typography><Chip label={status.label} color={status.color} size="small" sx={{ mt: 0.5 }} /></Box>
          </Stack>
          <ToggleButtonGroup exclusive size="small" value={ai.mode} onChange={(_, value) => value && ai.setMode(value)}>
            <ToggleButton value="general">General</ToggleButton><ToggleButton value="ai">AI</ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        {ai.mode === 'ai' && (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between" alignItems={{ sm: 'center' }} sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">Anonymised aggregate range: {dateRange.dateFrom} to {dateRange.dateTo}</Typography>
            <Stack direction="row" spacing={1}>
              {ai.loading ? <Button size="small" color="inherit" onClick={ai.cancel}>Cancel</Button> : null}
              <Button size="small" variant="contained" disabled={ai.loading || !sessions.length} onClick={ai.run} startIcon={ai.loading ? <CircularProgress size={16} color="inherit" /> : <Iconify icon="eva:flash-fill" />}>
                {result && !ai.stale ? 'Regenerate' : 'Generate AI Recommendations'}
              </Button>
            </Stack>
          </Stack>
        )}

        <Box sx={{ maxHeight: { xs: '65vh', md: 420 }, overflowY: 'auto', overflowX: 'hidden', pr: { md: 1 }, overflowWrap: 'anywhere' }}>
          {ai.mode === 'general' ? (
            <>
              {general.warnings.map((warning) => <Alert key={warning} severity="warning" sx={{ mb: 2 }}>{warning}</Alert>)}
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}><Box sx={{ p: 2, borderRadius: 1.5, bgcolor: 'background.neutral', height: 1 }}><Typography variant="subtitle2">Key Metrics Summary</Typography><Divider sx={{ my: 1.5 }} /><Stack spacing={1}>{general.summaries.map((text) => <Typography key={text} variant="body2">• {text}</Typography>)}</Stack></Box></Grid>
                <Grid item xs={12} md={4}><Box sx={{ p: 2, borderRadius: 1.5, bgcolor: 'background.neutral', height: 1 }}><Typography variant="subtitle2" sx={{ mb: 1.5 }}>Key Observations</Typography><InsightItems items={general.observations.map((item) => ({ ...item, title: 'Observation', detail: item.text }))} emptyText="There is not enough data to form an observation." /></Box></Grid>
                <Grid item xs={12} md={4}><Box sx={{ p: 2, borderRadius: 1.5, bgcolor: 'background.neutral', height: 1 }}><Typography variant="subtitle2" sx={{ mb: 1.5 }}>Recommended Next Steps</Typography><Stack spacing={1}>{general.actions.map((text, index) => <Typography key={text} variant="body2">{index + 1}. {text}</Typography>)}</Stack></Box></Grid>
              </Grid>
            </>
          ) : (
            <>
              {ai.stale && <Alert severity="warning" sx={{ mb: 2 }}>The filter range has changed. The current result is outdated; please regenerate it.</Alert>}
              {ai.error && <Alert severity="error" sx={{ mb: 2 }}>{ai.error}</Alert>}
              {!result && !ai.loading && <Alert severity="info">AI does not run automatically. Confirm the scope, then select “Generate AI Recommendations”.</Alert>}
              {result && (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}><Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1.5 }}><Typography variant="subtitle2" sx={{ mb: 1 }}>Overall Summary</Typography>{result.overview.map((text) => <Typography key={text} variant="body2" sx={{ mb: 0.75 }}>• {text}</Typography>)}<Typography variant="caption" color="text.secondary">Generated: {new Date(ai.analysis.generatedAt).toLocaleString()}</Typography></Box></Grid>
                  <Grid item xs={12} md={4}><Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1.5 }}><Typography variant="subtitle2" sx={{ mb: 1 }}>Trends and Pending Items</Typography><InsightItems items={[...result.trends, ...result.pendingItems]} emptyText="No priority items were identified." /></Box></Grid>
                  <Grid item xs={12} md={4}><Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1.5 }}><Typography variant="subtitle2" sx={{ mb: 1 }}>Resource Recommendations</Typography><InsightItems items={result.resourceRecommendations} emptyText="No resource recommendations are available." />{result.limitations.map((text) => <Alert key={text} severity="warning" sx={{ mt: 1 }}>{text}</Alert>)}</Box></Grid>
                </Grid>
              )}
            </>
          )}
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>* {ai.mode === 'ai' ? 'AI-generated, authorised manager review required.' : 'General uses local rule-based analysis.'} No case records are modified automatically.</Typography>
      </CardContent>
    </Card>
  );
}

CounsellingAiInsights.propTypes = {
  dateRange: PropTypes.shape({ dateFrom: PropTypes.string.isRequired, dateTo: PropTypes.string.isRequired }).isRequired,
  metrics: PropTypes.shape({ totalMinutes: PropTypes.number.isRequired }).isRequired,
  sessions: PropTypes.arrayOf(PropTypes.object).isRequired,
};
