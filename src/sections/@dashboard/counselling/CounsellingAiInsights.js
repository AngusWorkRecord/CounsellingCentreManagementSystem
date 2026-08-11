import { alpha, useTheme } from '@mui/material/styles';
import { Box, Card, CardContent, Chip, Divider, Grid, Stack, Typography } from '@mui/material';
import Iconify from '../../../components/iconify';

const observations = [
  { color: 'success.main', icon: 'eva:checkmark-circle-2-fill', text: '所有详细报告均已完成，行政记录完整。' },
  { color: 'warning.main', icon: 'eva:alert-triangle-fill', text: '仍有个案尚未发送通知，需要尽快跟进。' },
  { color: 'info.main', icon: 'eva:info-fill', text: '部分个案收款为 RM0，建议确认免费服务、豁免或待付款状态。' },
  { color: 'secondary.main', icon: 'eva:pie-chart-2-fill', text: '目前各类别个案数相对平均，尚未出现明显集中类别。' },
];

const actions = [
  '优先处理尚未发送通知的个案。',
  '确认 RM0 个案的付款状态（免费／豁免／待付款）。',
  '持续收集更多个案数据，以识别高需求辅导类别及时间趋势。',
  '观察线上与电话辅导的发展趋势，评估是否需要加强相关资源。',
];

export default function CounsellingAiInsights() {
  const theme = useTheme();

  return (
    <Card sx={{ height: 1 }}>
      <CardContent>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
          <Box sx={{ p: 1, borderRadius: '50%', color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.12), display: 'flex' }}>
            <Iconify icon="mdi:robot-outline" width={26} />
          </Box>
          <Typography variant="h6">G. AI 运营与管理建议</Typography>
        </Stack>

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: 'background.neutral', height: 1 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="subtitle2">整体评估</Typography>
                <Chip label="稳定" color="success" size="small" />
              </Stack>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="subtitle2" sx={{ mb: 1 }}>关键指标摘要</Typography>
              <Stack spacing={1}>
                <Typography variant="body2">• 个案处理与辅导时长保持稳定</Typography>
                <Typography variant="body2">• 报告完成率维持良好水平</Typography>
                <Typography variant="body2">• 通知发送仍有跟进空间</Typography>
                <Typography variant="body2">• 收款状态需要定期核对</Typography>
              </Stack>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: 'background.neutral', height: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>重点观察</Typography>
              <Stack spacing={1.6}>
                {observations.map((item) => (
                  <Stack key={item.text} direction="row" spacing={1} alignItems="flex-start">
                    <Iconify icon={item.icon} sx={{ color: item.color, mt: 0.25, flexShrink: 0 }} />
                    <Typography variant="body2">{item.text}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: 'background.neutral', height: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>建议下一步行动</Typography>
              <Stack spacing={1.5}>
                {actions.map((action, index) => (
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
          * AI 建议仅供参考，最终决策请由授权人员审核。
        </Typography>
      </CardContent>
    </Card>
  );
}

