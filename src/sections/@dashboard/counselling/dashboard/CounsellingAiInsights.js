import PropTypes from 'prop-types';
import { useCallback, useMemo } from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Divider, Grid, Stack,
  ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material';
import { useUiLanguage, tr, currentLocale } from '../../../../locales/translate';
import { domainLabel } from '../../../../locales/domainLabels';
import Iconify from '../../../../components/iconify';
import { generateManagementInsights, getManagementInsights } from '../../../../services/aiAnalysisService';
import useAiAnalysis from '../useAiAnalysis';
import { groupCount, toNumber } from '../utils';

const STATUS_META = {
  // 中文原文：稳定、需要关注、优先处理、资料不足
  stable: { get label() { return tr("Stable"); }, color: 'success' }, attention: { get label() { return tr("Needs Attention"); }, color: 'warning' },
  urgent: { get label() { return tr("Priority Action"); }, color: 'error' }, insufficient: { get label() { return tr("Insufficient Data"); }, color: 'default' },
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
    tr("{{p0}} counselling records are in scope, totalling {{p1}} minutes.", { p0: total, p1: Math.round(metrics.totalMinutes) }),
    tr("The detailed report completion rate is {{p0}}% ({{p1}}/{{p2}}).", { p0: reportRate, p1: completedReports, p2: total }),
    tr("{{p0}}% of records have pending notifications ({{p1}}/{{p2}}).", { p0: pendingRate, p1: pendingNotifications, p2: total }),
    tr("The records cover {{p0}} categories and {{p1}} counsellors.", { p0: categories.length, p1: counsellors.length }),
  ];
  const observations = [];
  const actions = [];
  const warnings = [];
  if (pendingNotifications) {
    observations.push({ severity: pendingRate >= 30 ? 'warning' : 'info', text: tr("{{p0}} records have pending notifications.", { p0: pendingNotifications }) });
    actions.push(tr("Prioritise records with pending notifications and have the person responsible confirm the follow-up action."));
  } else observations.push({ severity: 'success', text: tr("All notifications within the current scope have been sent.") });
  if (completedReports < total) {
    observations.push({ severity: reportRate < 70 ? 'warning' : 'info', text: tr("{{p0}} detailed reports remain incomplete.", { p0: total - completedReports }) });
    actions.push(tr("Complete outstanding detailed reports and verify their links and completion status."));
  } else observations.push({ severity: 'success', text: tr("All detailed reports within the current scope are complete.") });
  if (zeroCollection) {
    observations.push({ severity: zeroRate >= 50 ? 'warning' : 'info', text: tr("{{p0}} records show RM0 payments ({{p1}}%).", { p0: zeroCollection, p1: zeroRate }) });
    actions.push(tr("Manually verify whether RM0 records represent free services, fee waivers, or pending payments."));
  }
  if (topCategory && percentage(topCategory.value, total) >= 40 && total >= 5) {
    observations.push({ severity: 'info', text: tr("“{{p0}}” is the leading category at {{p1}}%.", { p0: domainLabel(topCategory.label), p1: percentage(topCategory.value, total) }) });
    actions.push(tr("Assess whether staffing and service resources for “{{p0}}” are sufficient.", { p0: domainLabel(topCategory.label) }));
  }
  if (topMode) observations.push({ severity: 'info', text: tr("“{{p0}}” is the most used mode, with {{p1}} cases.", { p0: domainLabel(topMode.label), p1: topMode.value }) });
  if (concentration >= 1.5 && total >= 5) {
    observations.push({ severity: 'warning', text: tr("Workload is concentrated on {{p0}} ({{p1}} cases).", { p0: topCounsellor.label, p1: topCounsellor.value }) });
    actions.push(tr("Have management review workload distribution among counsellors."));
  }
  if (invalidDuration) warnings.push(tr("{{p0}} records do not have a valid counselling duration.", { p0: invalidDuration }));
  if (total < 5) warnings.push(tr("The sample contains fewer than five cases, so no detailed trend conclusion is shown."));
  if (!actions.length) actions.push(tr("Maintain the current process and continue monitoring reports, notifications, and workload indicators."));
  let status = 'stable';
  if (pendingNotifications || completedReports < total || concentration >= 1.5) status = 'attention';
  if (pendingRate >= 50 || reportRate < 50) status = 'urgent';
  return { status, summaries, observations, actions, warnings };
}

function InsightItems({ items, emptyText }) {
  const uiLanguage = useUiLanguage();
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
  const uiLanguage = useUiLanguage();
  const theme = useTheme();
  const language = useUiLanguage();
  const general = useMemo(() => buildManagementInsights(sessions, metrics, uiLanguage), [metrics, sessions, uiLanguage]);
  const requestPayload = useMemo(() => ({ dateFrom: dateRange.dateFrom, dateTo: dateRange.dateTo, language }), [dateRange.dateFrom, dateRange.dateTo, language]);
  const scopeKey = `${dateRange.dateFrom}:${dateRange.dateTo}:${language}`;
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
            <Box><Typography variant="h6">{tr("G. Operations and Management Recommendations")}</Typography><Chip label={status.label} color={status.color} size="small" sx={{ mt: 0.5 }} /></Box>
          </Stack>
          <ToggleButtonGroup exclusive size="small" value={ai.mode} onChange={(_, value) => value && ai.setMode(value)}>
            <ToggleButton value="general">{tr("General")}</ToggleButton><ToggleButton value="ai">{tr("AI")}</ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        {ai.mode === 'ai' && (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between" alignItems={{ sm: 'center' }} sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">{tr("Anonymised aggregate range:")} {dateRange.dateFrom} {tr("to")} {dateRange.dateTo}</Typography>
            <Stack direction="row" spacing={1}>
              {ai.loading ? <Button size="small" color="inherit" onClick={ai.cancel}>{tr("Cancel")}</Button> : null}
              <Button size="small" variant="contained" disabled={ai.loading || !sessions.length} onClick={ai.run} startIcon={ai.loading ? <CircularProgress size={16} color="inherit" /> : <Iconify icon="eva:flash-fill" />}>
                {result && !ai.stale ? tr("Regenerate") : tr("Generate AI Recommendations")}
              </Button>
            </Stack>
          </Stack>
        )}

        <Box sx={{ maxHeight: { xs: '65vh', md: 420 }, overflowY: 'auto', overflowX: 'hidden', pr: { md: 1 }, overflowWrap: 'anywhere' }}>
          {ai.mode === 'general' ? (
            <>
              {general.warnings.map((warning) => <Alert key={warning} severity="warning" sx={{ mb: 2 }}>{warning}</Alert>)}
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}><Box sx={{ p: 2, borderRadius: 1.5, bgcolor: 'background.neutral', height: 1 }}><Typography variant="subtitle2">{tr("Key Metrics Summary")}</Typography><Divider sx={{ my: 1.5 }} /><Stack spacing={1}>{general.summaries.map((text) => <Typography key={text} variant="body2">• {text}</Typography>)}</Stack></Box></Grid>
                <Grid item xs={12} md={4}><Box sx={{ p: 2, borderRadius: 1.5, bgcolor: 'background.neutral', height: 1 }}><Typography variant="subtitle2" sx={{ mb: 1.5 }}>{tr("Key Observations")}</Typography><InsightItems items={general.observations.map((item) => ({ ...item, title: tr("Observation"), detail: item.text }))} emptyText={tr("There is not enough data to form an observation.")} /></Box></Grid>
                <Grid item xs={12} md={4}><Box sx={{ p: 2, borderRadius: 1.5, bgcolor: 'background.neutral', height: 1 }}><Typography variant="subtitle2" sx={{ mb: 1.5 }}>{tr("Recommended Next Steps")}</Typography><Stack spacing={1}>{general.actions.map((text, index) => <Typography key={text} variant="body2">{index + 1}. {text}</Typography>)}</Stack></Box></Grid>
              </Grid>
            </>
          ) : (
            <>
              {ai.stale && <Alert severity="warning" sx={{ mb: 2 }}>{tr("The filter range has changed. The current result is outdated; please regenerate it.")}</Alert>}
              {ai.error && <Alert severity="error" sx={{ mb: 2 }}>{ai.error}</Alert>}
              {!result && !ai.loading && <Alert severity="info">{tr("AI does not run automatically. Confirm the scope, then select “Generate AI Recommendations”.")}</Alert>}
              {result && (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}><Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1.5 }}><Typography variant="subtitle2" sx={{ mb: 1 }}>{tr("Overall Summary")}</Typography>{result.overview.map((text) => <Typography key={text} variant="body2" sx={{ mb: 0.75 }}>• {text}</Typography>)}<Typography variant="caption" color="text.secondary">{tr("Generated:")} {new Date(ai.analysis.generatedAt).toLocaleString(currentLocale())}</Typography></Box></Grid>
                  <Grid item xs={12} md={4}><Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1.5 }}><Typography variant="subtitle2" sx={{ mb: 1 }}>{tr("Trends and Pending Items")}</Typography><InsightItems items={[...result.trends, ...result.pendingItems]} emptyText={tr("No priority items were identified.")} /></Box></Grid>
                  <Grid item xs={12} md={4}><Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1.5 }}><Typography variant="subtitle2" sx={{ mb: 1 }}>{tr("Resource Recommendations")}</Typography><InsightItems items={result.resourceRecommendations} emptyText={tr("No resource recommendations are available.")} />{result.limitations.map((text) => <Alert key={text} severity="warning" sx={{ mt: 1 }}>{text}</Alert>)}</Box></Grid>
                </Grid>
              )}
            </>
          )}
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>* {ai.mode === 'ai' ? tr("AI-generated, authorised manager review required.") : tr("General uses local rule-based analysis.")} {tr("No case records are modified automatically.")}</Typography>
      </CardContent>
    </Card>
  );
}

CounsellingAiInsights.propTypes = {
  dateRange: PropTypes.shape({ dateFrom: PropTypes.string.isRequired, dateTo: PropTypes.string.isRequired }).isRequired,
  metrics: PropTypes.shape({ totalMinutes: PropTypes.number.isRequired }).isRequired,
  sessions: PropTypes.arrayOf(PropTypes.object).isRequired,
};
