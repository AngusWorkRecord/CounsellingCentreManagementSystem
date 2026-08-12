import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Card,
  Chip,
  Divider,
  Grid,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import Iconify from '../../../../../components/iconify';

function valueOrDash(value) {
  return value === null || value === undefined || value === '' ? '-' : value;
}

function formatDate(value) {
  return String(value || '').slice(0, 10) || '-';
}

function formatTime(value) {
  return String(value || '').slice(0, 5) || '-';
}

function DetailItem({ icon, label, value }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-start">
      <Iconify icon={icon} width={24} sx={{ color: 'primary.main', mt: 0.25 }} />
      <Box>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="subtitle2">{valueOrDash(value)}</Typography>
      </Box>
    </Stack>
  );
}

DetailItem.propTypes = {
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.node,
};

function TextSection({ icon, title, children }) {
  return (
    <Card sx={{ p: 3 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
        <Iconify icon={icon} width={22} sx={{ color: 'primary.main' }} />
        <Typography variant="h6">{title}</Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
        {valueOrDash(children)}
      </Typography>
    </Card>
  );
}

TextSection.propTypes = {
  children: PropTypes.node,
  icon: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};

function StatusFlow({ session }) {
  const steps = [
    {
      label: '个案预约',
      complete: true,
      detail: `${formatDate(session.counselling_date)} ${formatTime(session.session_start)}`,
    },
    {
      label: '辅导已完成',
      complete: Boolean(String(session.session_end || '').trim()),
      detail: session.session_end
        ? `${formatDate(session.counselling_date)} ${formatTime(session.session_end)}`
        : '',
    },
    {
      label: '简要报告已提交',
      complete: Boolean(String(session.volunteer_actions || '').trim()),
      detail: '',
    },
    {
      label: '详细报告已提交',
      complete: Boolean(String(session.report_url || '').trim()),
      detail: '',
    },
  ];

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2.5 }}>个案状态</Typography>
      <Stack>
        {steps.map((step, index) => (
          <Stack key={step.label} direction="row" spacing={1.5} sx={{ minHeight: 70 }}>
            <Stack alignItems="center">
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  color: step.complete ? 'common.white' : 'text.disabled',
                  bgcolor: step.complete ? 'primary.main' : 'grey.200',
                  fontWeight: 700,
                }}
              >
                {index + 1}
              </Box>
              {index < steps.length - 1 && (
                <Box sx={{ width: 2, flexGrow: 1, bgcolor: step.complete ? 'primary.light' : 'divider' }} />
              )}
            </Stack>
            <Box sx={{ flexGrow: 1, pt: 0.25 }}>
              <Typography variant="subtitle2">{step.label}</Typography>
              {step.detail && <Typography variant="caption" color="text.secondary">{step.detail}</Typography>}
            </Box>
            <Iconify
              icon={step.complete ? 'eva:checkmark-circle-2-fill' : 'eva:clock-outline'}
              width={22}
              sx={{ color: step.complete ? 'success.main' : 'text.disabled', mt: 0.5 }}
            />
          </Stack>
        ))}
      </Stack>
    </Card>
  );
}

StatusFlow.propTypes = { session: PropTypes.object.isRequired };

function QuickActions({ session, onBack }) {
  const actions = [
    { label: '编辑个案资料', icon: 'eva:edit-2-outline', disabled: true },
    { label: '发送跟进通知', icon: 'eva:paper-plane-outline', disabled: true },
    {
      label: '查看详细报告',
      icon: 'eva:download-outline',
      href: session.report_url || undefined,
      disabled: !session.report_url,
    },
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
            <Button
              fullWidth
              color="inherit"
              variant="outlined"
              disabled={action.disabled}
              component={action.href ? 'a' : 'button'}
              href={action.href}
              target={action.href ? '_blank' : undefined}
              rel={action.href ? 'noopener noreferrer' : undefined}
              onClick={action.onClick}
              startIcon={<Iconify icon={action.icon} sx={{ color: 'primary.main' }} />}
              endIcon={<Iconify icon="eva:chevron-right-fill" />}
              sx={{ justifyContent: 'space-between', py: 1.25, px: 1.5 }}
            >
              {action.label}
            </Button>
          </Grid>
        ))}
      </Grid>
    </Card>
  );
}

QuickActions.propTypes = {
  onBack: PropTypes.func.isRequired,
  session: PropTypes.object.isRequired,
};

function AiCaseTip() {
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

function RecordTable({ session }) {
  const rows = [
    ['数据库 ID', session.id],
    ['Respondent ID', session.respondent_id],
    ['Submission ID', session.submission_id],
    ['报告状态', session.report_completed ? '已完成' : '未完成'],
    ['通知状态', session.notification_sent ? '已发送' : '未发送'],
    ['收到款项', `RM${Number(session.amount_received_rm || 0).toFixed(2)}`],
  ];

  return (
    <Card sx={{ p: 3 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <Iconify icon="eva:file-text-outline" width={22} sx={{ color: 'primary.main' }} />
        <Typography variant="h6">个案记录</Typography>
      </Stack>
      <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5, overflow: 'hidden' }}>
        {rows.map(([label, value], index) => (
          <Box key={label}>
            <Grid container>
              <Grid item xs={5} sm={4} sx={{ p: 1.5, bgcolor: 'background.neutral' }}>
                <Typography variant="subtitle2">{label}</Typography>
              </Grid>
              <Grid item xs={7} sm={8} sx={{ p: 1.5 }}>
                <Typography variant="body2">{valueOrDash(value)}</Typography>
              </Grid>
            </Grid>
            {index < rows.length - 1 && <Divider />}
          </Box>
        ))}
        <Divider />
        <Grid container>
          <Grid item xs={5} sm={4} sx={{ p: 1.5, bgcolor: 'background.neutral' }}>
            <Typography variant="subtitle2">详细报告链接</Typography>
          </Grid>
          <Grid item xs={7} sm={8} sx={{ p: 1.5, minWidth: 0 }}>
            {session.report_url ? (
              <Link href={session.report_url} target="_blank" rel="noopener noreferrer" sx={{ wordBreak: 'break-all' }}>
                {session.report_url}
              </Link>
            ) : (
              <Typography variant="body2">-</Typography>
            )}
          </Grid>
        </Grid>
      </Box>
    </Card>
  );
}

RecordTable.propTypes = { session: PropTypes.object.isRequired };

export default function CaseDetailContent({ session, onBack }) {
  const amount = Number(session.amount_received_rm || 0);

  return (
    <Stack spacing={2.5}>
      <Card sx={{ p: { xs: 2.5, md: 4 } }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={3}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" color="primary.main" sx={{ mb: 3 }}>
              {valueOrDash(session.case_number)}
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} lg={3}><DetailItem icon="eva:person-outline" label="案主简称" value={session.client_initials} /></Grid>
              <Grid item xs={12} sm={6} lg={3}><DetailItem icon="eva:briefcase-outline" label="个案类别" value={session.case_category} /></Grid>
              <Grid item xs={12} sm={6} lg={3}><DetailItem icon="eva:message-square-outline" label="辅导类型" value={session.session_mode} /></Grid>
              <Grid item xs={12} sm={6} lg={3}><DetailItem icon="eva:people-outline" label="辅导员" value={session.counsellor} /></Grid>
              <Grid item xs={12} sm={6} lg={3}><DetailItem icon="eva:calendar-outline" label="日期" value={formatDate(session.counselling_date)} /></Grid>
              <Grid item xs={12} sm={6} lg={3}><DetailItem icon="eva:clock-outline" label="时间" value={`${formatTime(session.session_start)} – ${formatTime(session.session_end)}`} /></Grid>
              <Grid item xs={12} sm={6} lg={3}><DetailItem icon="eva:pie-chart-outline" label="时长" value={`${valueOrDash(session.duration_minutes)} 分钟`} /></Grid>
              <Grid item xs={12} sm={6} lg={3}><DetailItem icon="eva:phone-outline" label="联系电话" value={session.client_phone} /></Grid>
            </Grid>
          </Box>
          <Stack alignItems={{ xs: 'flex-start', md: 'flex-end' }} spacing={1} sx={{ minWidth: 170 }}>
            <Typography variant="caption" color="text.secondary">当前状态</Typography>
            <Chip color={session.report_url ? 'success' : 'warning'} label={session.report_url ? '详细报告已提交' : '处理中'} />
            <Chip color="info" variant="outlined" label={`已收款 RM${amount.toFixed(2)}`} />
          </Stack>
        </Stack>
      </Card>

      <Grid container spacing={2.5} alignItems="stretch">
        <Grid item xs={12} md={6}>
          <Stack
            spacing={2.5}
            sx={{
              height: '100%',
              '& > .MuiCard-root': { flex: { md: 1 } },
            }}
          >
            <TextSection icon="eva:file-text-outline" title="案主自述摘要">{session.client_summary}</TextSection>
            <TextSection icon="eva:activity-outline" title="志工处理步骤">{session.volunteer_actions}</TextSection>
          </Stack>
        </Grid>
        <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
          <Box sx={{ width: 1, '& > .MuiCard-root': { height: '100%' } }}>
            <StatusFlow session={session} />
          </Box>
        </Grid>
      </Grid>

      <Grid container spacing={2.5} alignItems="stretch">
        <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
          <Box sx={{ width: 1, '& > .MuiCard-root': { height: '100%' } }}>
            <RecordTable session={session} />
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Stack
            spacing={2.5}
            sx={{
              height: '100%',
              '& > .MuiCard-root': { flex: { md: 1 } },
            }}
          >
            <QuickActions session={session} onBack={onBack} />
            <AiCaseTip />
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}

CaseDetailContent.propTypes = {
  onBack: PropTypes.func.isRequired,
  session: PropTypes.object.isRequired,
};
