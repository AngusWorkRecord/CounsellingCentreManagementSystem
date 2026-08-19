import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import { Alert, Box, Card, CardContent, Chip, Divider, Grid, Stack, Typography } from '@mui/material';
import Iconify from '../../../../components/iconify';
import { groupCount, toNumber } from '../utils';

const STATUS_META = {
  stable: { label: '稳定', color: 'success' },
  attention: { label: '需要关注', color: 'warning' },
  urgent: { label: '优先处理', color: 'error' },
  insufficient: { label: '资料不足', color: 'default' },
};

const OBSERVATION_META = {
  success: { color: 'success.main', icon: 'eva:checkmark-circle-2-fill' },
  warning: { color: 'warning.main', icon: 'eva:alert-triangle-fill' },
  info: { color: 'info.main', icon: 'eva:info-fill' },
};

function percentage(value, total) {
  return total ? Math.round((value / total) * 100) : 0;
}

function buildManagementInsights(sessions, metrics) {
  const total = sessions.length;

  if (!total) {
    return {
      status: 'insufficient',
      summaries: ['当前筛选期间没有可供分析的辅导记录。'],
      observations: [],
      actions: ['调整日期筛选范围，或在录入辅导记录后重新查看。'],
      warnings: ['资料为空，因此没有生成运营结论。'],
    };
  }

  const completedReports = sessions.filter((session) => Boolean(session.report_completed)).length;
  const pendingNotifications = sessions.filter((session) => !session.notification_sent).length;
  const zeroCollection = sessions.filter((session) => toNumber(session.amount_received_rm) === 0).length;
  const invalidDuration = sessions.filter((session) => toNumber(session.duration_minutes) <= 0).length;
  const categoryCounts = groupCount(sessions, 'case_category').sort((a, b) => b.value - a.value);
  const modeCounts = groupCount(sessions, 'session_mode').sort((a, b) => b.value - a.value);
  const counsellorCounts = groupCount(sessions, 'counsellor').sort((a, b) => b.value - a.value);
  const reportRate = percentage(completedReports, total);
  const notificationPendingRate = percentage(pendingNotifications, total);
  const zeroCollectionRate = percentage(zeroCollection, total);
  const topCategory = categoryCounts[0];
  const topMode = modeCounts[0];
  const topCounsellor = counsellorCounts[0];
  const workloadAverage = counsellorCounts.length ? total / counsellorCounts.length : 0;
  const workloadConcentration = topCounsellor ? topCounsellor.value / Math.max(workloadAverage, 1) : 0;

  const summaries = [
    `当前范围共有 ${total} 宗辅导记录，累计 ${Math.round(metrics.totalMinutes)} 分钟。`,
    `详细报告完成率为 ${reportRate}%（${completedReports}/${total}）。`,
    `尚未发送通知的记录占 ${notificationPendingRate}%（${pendingNotifications}/${total}）。`,
    `当前记录分布于 ${categoryCounts.length} 个类别及 ${counsellorCounts.length} 位辅导人员。`,
  ];
  const observations = [];
  const actions = [];
  const warnings = [];

  if (pendingNotifications > 0) {
    observations.push({
      severity: notificationPendingRate >= 30 ? 'warning' : 'info',
      text: `${pendingNotifications} 宗记录尚未发送通知，需要确认是否仍待跟进。`,
    });
    actions.push('优先检查尚未发送通知的记录，并由负责人确认后续行动。');
  } else {
    observations.push({ severity: 'success', text: '当前范围内的通知均已发送。' });
  }

  if (completedReports < total) {
    observations.push({
      severity: reportRate < 70 ? 'warning' : 'info',
      text: `${total - completedReports} 宗记录的详细报告尚未完成。`,
    });
    actions.push('安排补齐未完成的详细报告，并核对报告链接和完成状态。');
  } else {
    observations.push({ severity: 'success', text: '当前范围内的详细报告均已完成。' });
  }

  if (zeroCollection > 0) {
    observations.push({
      severity: zeroCollectionRate >= 50 ? 'warning' : 'info',
      text: `${zeroCollection} 宗记录的收款为 RM0，占 ${zeroCollectionRate}%。`,
    });
    actions.push('人工核对 RM0 记录属于免费服务、费用豁免还是待付款。');
  }

  if (topCategory && percentage(topCategory.value, total) >= 40 && total >= 5) {
    observations.push({
      severity: 'info',
      text: `“${topCategory.label}”是当前主要类别，占 ${percentage(topCategory.value, total)}%。`,
    });
    actions.push(`评估“${topCategory.label}”类别的人员配置和服务资源是否足够。`);
  }

  if (topMode) {
    observations.push({
      severity: 'info',
      text: `最常使用的辅导方式是“${topMode.label}”，共 ${topMode.value} 宗。`,
    });
  }

  if (workloadConcentration >= 1.5 && total >= 5) {
    observations.push({
      severity: 'warning',
      text: `工作量较集中于 ${topCounsellor.label}（${topCounsellor.value} 宗），高于平均水平。`,
    });
    actions.push('由管理人员复核辅导人员之间的工作量分配，避免只凭数量直接调配。');
  }

  if (invalidDuration > 0) {
    warnings.push(`${invalidDuration} 宗记录缺少有效辅导时长，时长相关结论可能不完整。`);
  }
  if (total < 5) {
    warnings.push('样本少于 5 宗，不显示细分趋势结论，以降低误判风险。');
  }
  if (!actions.length) {
    actions.push('维持现有流程，并持续观察报告、通知和工作量指标的变化。');
  }

  let status = 'stable';
  if (pendingNotifications > 0 || completedReports < total || workloadConcentration >= 1.5) {
    status = 'attention';
  }
  if (notificationPendingRate >= 50 || reportRate < 50) status = 'urgent';

  return { status, summaries, observations, actions, warnings };
}

export default function CounsellingAiInsights({ metrics, sessions }) {
  const theme = useTheme();
  const insights = useMemo(() => buildManagementInsights(sessions, metrics), [metrics, sessions]);
  const status = STATUS_META[insights.status];

  return (
    <Card sx={{ height: 1 }}>
      <CardContent>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
          sx={{ mb: 2 }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ p: 1, borderRadius: '50%', color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.12), display: 'flex' }}>
              <Iconify icon="mdi:robot-outline" width={26} />
            </Box>
            <Box>
              <Typography variant="h6">G. AI 运营与管理建议</Typography>
              <Typography variant="caption" color="text.secondary">
                根据当前筛选范围的汇总指标生成，不读取个案自由文本
              </Typography>
            </Box>
          </Stack>
          <Chip label={status.label} color={status.color} size="small" />
        </Stack>

        {insights.warnings.map((warning) => (
          <Alert key={warning} severity="warning" sx={{ mb: 2 }}>{warning}</Alert>
        ))}

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: 'background.neutral', height: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>关键指标摘要</Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1}>
                {insights.summaries.map((summary) => (
                  <Typography key={summary} variant="body2">• {summary}</Typography>
                ))}
              </Stack>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: 'background.neutral', height: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>重点观察</Typography>
              {insights.observations.length ? (
                <Stack spacing={1.6}>
                  {insights.observations.map((item) => {
                    const meta = OBSERVATION_META[item.severity];
                    return (
                      <Stack key={item.text} direction="row" spacing={1} alignItems="flex-start">
                        <Iconify icon={meta.icon} sx={{ color: meta.color, mt: 0.25, flexShrink: 0 }} />
                        <Typography variant="body2">{item.text}</Typography>
                      </Stack>
                    );
                  })}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">没有足够资料形成观察。</Typography>
              )}
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: 'background.neutral', height: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>建议下一步行动</Typography>
              <Stack spacing={1.5}>
                {insights.actions.map((action, index) => (
                  <Stack key={action} direction="row" spacing={1} alignItems="flex-start">
                    <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: 'primary.main', color: 'primary.contrastText', display: 'grid', placeItems: 'center', typography: 'caption', flexShrink: 0 }}>
                      {index + 1}
                    </Box>
                    <Typography variant="body2">{action}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Grid>
        </Grid>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
          * 系统生成的辅助分析仅供参考，最终决策必须由授权管理人员审核；不会自动修改任何个案记录。
        </Typography>
      </CardContent>
    </Card>
  );
}

CounsellingAiInsights.propTypes = {
  metrics: PropTypes.shape({ totalMinutes: PropTypes.number.isRequired }).isRequired,
  sessions: PropTypes.arrayOf(PropTypes.object).isRequired,
};
