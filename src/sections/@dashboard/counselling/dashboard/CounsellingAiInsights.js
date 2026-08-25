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
  stable: { label: '稳定', color: 'success' }, attention: { label: '需要关注', color: 'warning' },
  urgent: { label: '优先处理', color: 'error' }, insufficient: { label: '资料不足', color: 'default' },
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
    status: 'insufficient', summaries: ['当前筛选期间没有可供分析的辅导记录。'], observations: [],
    actions: ['调整日期筛选范围，或在录入辅导记录后重新查看。'], warnings: ['资料为空，因此没有生成运营结论。'],
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
    `当前范围共有 ${total} 宗辅导记录，累计 ${Math.round(metrics.totalMinutes)} 分钟。`,
    `详细报告完成率为 ${reportRate}%（${completedReports}/${total}）。`,
    `尚未发送通知的记录占 ${pendingRate}%（${pendingNotifications}/${total}）。`,
    `当前记录分布于 ${categories.length} 个类别及 ${counsellors.length} 位辅导人员。`,
  ];
  const observations = [];
  const actions = [];
  const warnings = [];
  if (pendingNotifications) {
    observations.push({ severity: pendingRate >= 30 ? 'warning' : 'info', text: `${pendingNotifications} 宗记录尚未发送通知。` });
    actions.push('优先检查尚未发送通知的记录，并由负责人确认后续行动。');
  } else observations.push({ severity: 'success', text: '当前范围内的通知均已发送。' });
  if (completedReports < total) {
    observations.push({ severity: reportRate < 70 ? 'warning' : 'info', text: `${total - completedReports} 宗记录的详细报告尚未完成。` });
    actions.push('安排补齐未完成的详细报告，并核对报告链接和完成状态。');
  } else observations.push({ severity: 'success', text: '当前范围内的详细报告均已完成。' });
  if (zeroCollection) {
    observations.push({ severity: zeroRate >= 50 ? 'warning' : 'info', text: `${zeroCollection} 宗记录收款为 RM0，占 ${zeroRate}%。` });
    actions.push('人工核对 RM0 记录属于免费服务、费用豁免还是待付款。');
  }
  if (topCategory && percentage(topCategory.value, total) >= 40 && total >= 5) {
    observations.push({ severity: 'info', text: `“${topCategory.label}”是主要类别，占 ${percentage(topCategory.value, total)}%。` });
    actions.push(`评估“${topCategory.label}”类别的人员配置和服务资源是否足够。`);
  }
  if (topMode) observations.push({ severity: 'info', text: `最常使用“${topMode.label}”，共 ${topMode.value} 宗。` });
  if (concentration >= 1.5 && total >= 5) {
    observations.push({ severity: 'warning', text: `工作量较集中于 ${topCounsellor.label}（${topCounsellor.value} 宗）。` });
    actions.push('由管理人员复核辅导人员之间的工作量分配。');
  }
  if (invalidDuration) warnings.push(`${invalidDuration} 宗记录缺少有效辅导时长。`);
  if (total < 5) warnings.push('样本少于 5 宗，不显示细分趋势结论。');
  if (!actions.length) actions.push('维持现有流程，并持续观察报告、通知和工作量指标。');
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
            <Box><Typography variant="h6">G. 运营与管理建议</Typography><Chip label={status.label} color={status.color} size="small" sx={{ mt: 0.5 }} /></Box>
          </Stack>
          <ToggleButtonGroup exclusive size="small" value={ai.mode} onChange={(_, value) => value && ai.setMode(value)}>
            <ToggleButton value="general">General</ToggleButton><ToggleButton value="ai">AI</ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        {ai.mode === 'ai' && (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between" alignItems={{ sm: 'center' }} sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">匿名汇总范围：{dateRange.dateFrom} 至 {dateRange.dateTo}</Typography>
            <Stack direction="row" spacing={1}>
              {ai.loading ? <Button size="small" color="inherit" onClick={ai.cancel}>取消</Button> : null}
              <Button size="small" variant="contained" disabled={ai.loading || !sessions.length} onClick={ai.run} startIcon={ai.loading ? <CircularProgress size={16} color="inherit" /> : <Iconify icon="eva:flash-fill" />}>
                {result && !ai.stale ? '重新生成' : '生成 AI 建议'}
              </Button>
            </Stack>
          </Stack>
        )}

        <Box sx={{ maxHeight: { xs: '65vh', md: 420 }, overflowY: 'auto', overflowX: 'hidden', pr: { md: 1 }, overflowWrap: 'anywhere' }}>
          {ai.mode === 'general' ? (
            <>
              {general.warnings.map((warning) => <Alert key={warning} severity="warning" sx={{ mb: 2 }}>{warning}</Alert>)}
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}><Box sx={{ p: 2, borderRadius: 1.5, bgcolor: 'background.neutral', height: 1 }}><Typography variant="subtitle2">关键指标摘要</Typography><Divider sx={{ my: 1.5 }} /><Stack spacing={1}>{general.summaries.map((text) => <Typography key={text} variant="body2">• {text}</Typography>)}</Stack></Box></Grid>
                <Grid item xs={12} md={4}><Box sx={{ p: 2, borderRadius: 1.5, bgcolor: 'background.neutral', height: 1 }}><Typography variant="subtitle2" sx={{ mb: 1.5 }}>重点观察</Typography><InsightItems items={general.observations.map((item) => ({ ...item, title: '观察', detail: item.text }))} emptyText="没有足够资料形成观察。" /></Box></Grid>
                <Grid item xs={12} md={4}><Box sx={{ p: 2, borderRadius: 1.5, bgcolor: 'background.neutral', height: 1 }}><Typography variant="subtitle2" sx={{ mb: 1.5 }}>建议下一步</Typography><Stack spacing={1}>{general.actions.map((text, index) => <Typography key={text} variant="body2">{index + 1}. {text}</Typography>)}</Stack></Box></Grid>
              </Grid>
            </>
          ) : (
            <>
              {ai.stale && <Alert severity="warning" sx={{ mb: 2 }}>筛选范围已改变；当前显示的是旧结果，请重新生成。</Alert>}
              {ai.error && <Alert severity="error" sx={{ mb: 2 }}>{ai.error}</Alert>}
              {!result && !ai.loading && <Alert severity="info">AI 不会自动运行。确认范围后点击“生成 AI 建议”。</Alert>}
              {result && (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}><Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1.5 }}><Typography variant="subtitle2" sx={{ mb: 1 }}>整体摘要</Typography>{result.overview.map((text) => <Typography key={text} variant="body2" sx={{ mb: 0.75 }}>• {text}</Typography>)}<Typography variant="caption" color="text.secondary">生成：{new Date(ai.analysis.generatedAt).toLocaleString()}</Typography></Box></Grid>
                  <Grid item xs={12} md={4}><Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1.5 }}><Typography variant="subtitle2" sx={{ mb: 1 }}>趋势与待处理</Typography><InsightItems items={[...result.trends, ...result.pendingItems]} emptyText="没有识别到重点项目。" /></Box></Grid>
                  <Grid item xs={12} md={4}><Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1.5 }}><Typography variant="subtitle2" sx={{ mb: 1 }}>资源建议</Typography><InsightItems items={result.resourceRecommendations} emptyText="没有资源建议。" />{result.limitations.map((text) => <Alert key={text} severity="warning" sx={{ mt: 1 }}>{text}</Alert>)}</Box></Grid>
                </Grid>
              )}
            </>
          )}
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>* {ai.mode === 'ai' ? 'AI-generated, authorised manager review required.' : 'General 为本地规则分析。'} 不会自动修改任何个案记录。</Typography>
      </CardContent>
    </Card>
  );
}

CounsellingAiInsights.propTypes = {
  dateRange: PropTypes.shape({ dateFrom: PropTypes.string.isRequired, dateTo: PropTypes.string.isRequired }).isRequired,
  metrics: PropTypes.shape({ totalMinutes: PropTypes.number.isRequired }).isRequired,
  sessions: PropTypes.arrayOf(PropTypes.object).isRequired,
};
