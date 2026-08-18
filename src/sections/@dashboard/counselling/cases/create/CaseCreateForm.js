import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { LoadingButton } from '@mui/lab';
import { Button, Card, Divider, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import FormProvider, { RHFSelect, RHFTextField } from '../../../../../components/hook-form';
import { useSnackbar } from '../../../../../components/snackbar';
import { PATH_DASHBOARD } from '../../../../../routes/paths';
import { createCounsellingSession } from '../../../../../services/counsellingSessionService';
import { CASE_CATEGORIES, COUNSELLORS, SESSION_MODES } from './constants';

function getToday() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60 * 1000).toISOString().slice(0, 10);
}

function getDurationMinutes(start, end) {
  if (!/^\d{2}:\d{2}$/.test(start || '') || !/^\d{2}:\d{2}$/.test(end || '')) return 0;
  const [startHour, startMinute] = start.split(':').map(Number);
  const [endHour, endMinute] = end.split(':').map(Number);
  return endHour * 60 + endMinute - (startHour * 60 + startMinute);
}

const schema = Yup.object().shape({
  submissionId: Yup.string().trim().required('请输入 Submission ID'),
  respondentId: Yup.string().trim(),
  counsellingDate: Yup.string().required('请选择辅导日期'),
  counsellor: Yup.string().oneOf(COUNSELLORS).required('请选择辅导员'),
  sessionMode: Yup.string().oneOf(SESSION_MODES).required('请选择辅导类型'),
  caseCategory: Yup.string().oneOf(CASE_CATEGORIES).required('请选择个案类别'),
  sessionStart: Yup.string().required('请选择开始时间'),
  sessionEnd: Yup.string()
    .required('请选择结束时间')
    .test('after-start', '结束时间必须晚于开始时间', function validateEnd(value) {
      return getDurationMinutes(this.parent.sessionStart, value) > 0;
    }),
  clientInitials: Yup.string().trim().required('请输入案主简称'),
  clientPhone: Yup.string().trim(),
  clientSummary: Yup.string().trim(),
  volunteerActions: Yup.string().trim(),
  caseNumber: Yup.string().trim().required('请输入个案编号'),
  reportUrl: Yup.string().trim(),
  amountReceivedRm: Yup.number()
    .typeError('收款金额必须是数字')
    .min(0, '收款金额不能小于 0')
    .required('请输入收款金额'),
});

const defaultValues = {
  submissionId: '',
  respondentId: '',
  counsellingDate: getToday(),
  counsellor: '',
  sessionMode: '',
  caseCategory: '',
  sessionStart: '',
  sessionEnd: '',
  clientInitials: '',
  clientPhone: '',
  clientSummary: '',
  volunteerActions: '',
  caseNumber: '',
  reportUrl: '',
  amountReceivedRm: '0.00',
};

export default function CaseCreateForm() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const methods = useForm({ resolver: yupResolver(schema), defaultValues });
  const {
    handleSubmit,
    setError,
    watch,
    formState: { isSubmitting },
  } = methods;
  const [sessionStart, sessionEnd] = watch(['sessionStart', 'sessionEnd']);
  const duration = useMemo(
    () => Math.max(0, getDurationMinutes(sessionStart, sessionEnd)),
    [sessionEnd, sessionStart]
  );

  const onSubmit = async (values) => {
    try {
      const created = await createCounsellingSession({
        ...values,
        respondentId: values.respondentId || null,
        clientPhone: values.clientPhone || null,
        clientSummary: values.clientSummary || null,
        volunteerActions: values.volunteerActions || null,
        reportUrl: values.reportUrl || null,
        amountReceivedRm: Number(values.amountReceivedRm),
      });
      enqueueSnackbar('个案新增成功', { variant: 'success' });
      navigate(PATH_DASHBOARD.general.counsellingCaseDetail(created.id));
    } catch (error) {
      const message = error.message || '无法新增个案，请稍后再试';
      if (/Submission ID already exists/i.test(message)) {
        setError('submissionId', { type: 'server', message: 'Submission ID 已存在' });
      }
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <Card sx={{ p: { xs: 2.5, md: 3 } }}>
          <Typography variant="h6">基本资料</Typography>
          <Divider sx={{ my: 2.5 }} />
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}><RHFTextField name="submissionId" label="Submission ID *" /></Grid>
            <Grid item xs={12} md={6}><RHFTextField name="respondentId" label="Respondent ID（可选）" /></Grid>
            <Grid item xs={12} md={6}><RHFTextField name="caseNumber" label="个案编号 *" /></Grid>
            <Grid item xs={12} md={6}><RHFTextField name="clientInitials" label="案主简称 *" /></Grid>
            <Grid item xs={12} md={6}><RHFTextField name="clientPhone" label="联系电话（可选）" /></Grid>
            <Grid item xs={12} md={6}>
              <RHFTextField name="amountReceivedRm" label="收款金额（RM）" type="number" inputProps={{ min: 0, step: '0.01' }} />
            </Grid>
          </Grid>
        </Card>

        <Card sx={{ p: { xs: 2.5, md: 3 } }}>
          <Typography variant="h6">辅导资料</Typography>
          <Divider sx={{ my: 2.5 }} />
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}><RHFTextField name="counsellingDate" label="辅导日期 *" type="date" InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} md={6}>
              <RHFSelect name="counsellor" label="辅导员 *">
                {COUNSELLORS.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
              </RHFSelect>
            </Grid>
            <Grid item xs={12} md={6}>
              <RHFSelect name="sessionMode" label="辅导类型 *">
                {SESSION_MODES.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
              </RHFSelect>
            </Grid>
            <Grid item xs={12} md={6}>
              <RHFSelect name="caseCategory" label="个案类别 *">
                {CASE_CATEGORIES.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
              </RHFSelect>
            </Grid>
            <Grid item xs={12} md={4}><RHFTextField name="sessionStart" label="开始时间 *" type="time" InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} md={4}><RHFTextField name="sessionEnd" label="结束时间 *" type="time" InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="辅导时长" value={duration ? `${duration} 分钟` : '—'} disabled />
            </Grid>
          </Grid>
        </Card>

        <Card sx={{ p: { xs: 2.5, md: 3 } }}>
          <Typography variant="h6">个案记录</Typography>
          <Divider sx={{ my: 2.5 }} />
          <Stack spacing={2.5}>
            <RHFTextField name="clientSummary" label="案主自述摘要（可选）" multiline minRows={3} />
            <RHFTextField name="volunteerActions" label="志工处理步骤（可选）" multiline minRows={3} />
            <RHFTextField name="reportUrl" label="详细报告链接（可选）" placeholder="https://..." />
          </Stack>
        </Card>

        <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
          <Button variant="outlined" disabled={isSubmitting} onClick={() => navigate(PATH_DASHBOARD.general.counsellingCases)}>
            取消
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            保存个案
          </LoadingButton>
        </Stack>
      </Stack>
    </FormProvider>
  );
}
