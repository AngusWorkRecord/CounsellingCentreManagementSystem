import { Card, Stack, Typography } from '@mui/material';
import Iconify from '../../../../../components/iconify';

export default function CaseAiTip() {
  return (
    <Card sx={{ p: 3 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
        <Iconify icon="eva:flash-fill" width={22} sx={{ color: 'secondary.main' }} />
        <Typography variant="h6">AI 个案管理提示</Typography>
      </Stack>
      <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
        本个案行政流程已完整，建议归档并持续观察后续是否需要跟进。
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
        AI 提示仅供管理参考。
      </Typography>
    </Card>
  );
}
