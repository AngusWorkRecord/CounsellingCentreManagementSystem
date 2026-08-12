import PropTypes from 'prop-types';
import { Button, Card, Grid, Stack, Typography } from '@mui/material';
import Iconify from '../../../../../components/iconify';

export default function CaseQuickActions({ session, onBack }) {
  const actions = [
    { label: '编辑个案资料', icon: 'eva:edit-2-outline', disabled: true },
    { label: '发送跟进通知', icon: 'eva:paper-plane-outline', disabled: true },
    { label: '查看详细报告', icon: 'eva:download-outline', href: session.report_url || undefined, disabled: !session.report_url },
    { label: '返回上一页', icon: 'eva:arrow-back-outline', onClick: onBack },
  ];

  return (
    <Card sx={{ p: 3 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <Iconify icon="eva:file-text-outline" width={22} sx={{ color: 'primary.main' }} />
        <Typography variant="h6">快捷操作</Typography>
      </Stack>
      <Grid container spacing={1.5}>
        {actions.map((action) => (
          <Grid item xs={12} sm={6} lg={12} xl={6} key={action.label}>
            <Button fullWidth color="inherit" variant="outlined" disabled={action.disabled} component={action.href ? 'a' : 'button'} href={action.href} target={action.href ? '_blank' : undefined} rel={action.href ? 'noopener noreferrer' : undefined} onClick={action.onClick} startIcon={<Iconify icon={action.icon} sx={{ color: 'primary.main' }} />} endIcon={<Iconify icon="eva:chevron-right-fill" />} sx={{ justifyContent: 'space-between', py: 1.25, px: 1.5 }}>
              {action.label}
            </Button>
          </Grid>
        ))}
      </Grid>
    </Card>
  );
}

CaseQuickActions.propTypes = {
  onBack: PropTypes.func.isRequired,
  session: PropTypes.object.isRequired,
};
