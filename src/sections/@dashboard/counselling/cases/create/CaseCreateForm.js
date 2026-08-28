import PropTypes from 'prop-types';
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { LoadingButton } from '@mui/lab';
import { Button, Card, Divider, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import FormProvider, { RHFSelect, RHFTextField } from '../../../../../components/hook-form';
import { useSnackbar } from '../../../../../components/snackbar';
import { PATH_DASHBOARD } from '../../../../../routes/paths';
import {
  createCounsellingSession,
  updateCounsellingSession,
} from '../../../../../services/counsellingSessionService';
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
  // 中文原文：请输入 Submission ID
  submissionId: Yup.string().trim().required('Please enter the Submission ID'),
  respondentId: Yup.string().trim(),
  // 中文原文：请选择辅导日期、辅导员、辅导类型、个案类别、开始时间
  counsellingDate: Yup.string().required('Please select the counselling date'),
  counsellor: Yup.string().oneOf(COUNSELLORS).required('Please select a counsellor'),
  sessionMode: Yup.string().oneOf(SESSION_MODES).required('Please select a session mode'),
  caseCategory: Yup.string().oneOf(CASE_CATEGORIES).required('Please select a case category'),
  sessionStart: Yup.string().required('Please select the start time'),
  sessionEnd: Yup.string()
    // 中文原文：请选择结束时间；结束时间必须晚于开始时间
    .required('Please select the end time')
    .test('after-start', 'End time must be later than start time', function validateEnd(value) {
      return getDurationMinutes(this.parent.sessionStart, value) > 0;
    }),
  // 中文原文：请输入案主简称
  clientInitials: Yup.string().trim().required('Please enter the client initials'),
  clientPhone: Yup.string().trim(),
  clientSummary: Yup.string().trim(),
  volunteerActions: Yup.string().trim(),
  // 中文原文：请输入个案编号
  caseNumber: Yup.string().trim().required('Please enter the case number'),
  reportUrl: Yup.string().trim(),
  amountReceivedRm: Yup.number()
    // 中文原文：收款金额必须是数字、收款金额不能小于 0、请输入收款金额
    .typeError('Payment amount must be a number')
    .min(0, 'Payment amount cannot be less than 0')
    .required('Please enter the payment amount'),
});

function getDefaultValues(session) {
  return {
    submissionId: session?.submission_id || '',
    respondentId: session?.respondent_id || '',
    counsellingDate: String(session?.counselling_date || getToday()).slice(0, 10),
    counsellor: session?.counsellor || '',
    sessionMode: session?.session_mode || '',
    caseCategory: session?.case_category || '',
    sessionStart: String(session?.session_start || '').slice(0, 5),
    sessionEnd: String(session?.session_end || '').slice(0, 5),
    clientInitials: session?.client_initials || '',
    clientPhone: session?.client_phone || '',
    clientSummary: session?.client_summary || '',
    volunteerActions: session?.volunteer_actions || '',
    caseNumber: session?.case_number || '',
    reportUrl: session?.report_url || '',
    amountReceivedRm: String(session?.amount_received_rm ?? '0.00'),
  };
}

export default function CaseCreateForm({ currentSession = null }) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const isEdit = Boolean(currentSession);
  const defaultValues = useMemo(() => getDefaultValues(currentSession), [currentSession]);
  const methods = useForm({ resolver: yupResolver(schema), defaultValues });
  const {
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { isSubmitting },
  } = methods;
  const [sessionStart, sessionEnd] = watch(['sessionStart', 'sessionEnd']);
  const duration = useMemo(
    () => Math.max(0, getDurationMinutes(sessionStart, sessionEnd)),
    [sessionEnd, sessionStart]
  );

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        respondentId: values.respondentId || null,
        clientPhone: values.clientPhone || null,
        clientSummary: values.clientSummary || null,
        volunteerActions: values.volunteerActions || null,
        reportUrl: values.reportUrl || null,
        amountReceivedRm: Number(values.amountReceivedRm),
      };
      const saved = isEdit
        ? await updateCounsellingSession(currentSession.id, payload)
        : await createCounsellingSession(payload);
      // 中文原文：个案更新成功、个案新增成功
      enqueueSnackbar(isEdit ? 'Case updated successfully' : 'Case created successfully', { variant: 'success' });
      navigate(PATH_DASHBOARD.general.counsellingCaseDetail(saved.id));
    } catch (error) {
      // 中文原文：无法新增个案，请稍后再试
      const message = error.message || 'Unable to create the case. Please try again later.';
      if (/Submission ID already exists/i.test(message)) {
        // 中文原文：Submission ID 已存在
        setError('submissionId', { type: 'server', message: 'Submission ID already exists' });
      }
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <Card sx={{ p: { xs: 2.5, md: 3 } }}>
          {/* 中文原文：基本资料 */}<Typography variant="h6">Basic Information</Typography>
          <Divider sx={{ my: 2.5 }} />
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}><RHFTextField name="submissionId" label="Submission ID *" /></Grid>
            {/* 中文原文：可选、个案编号、案主简称、联系电话 */}
            <Grid item xs={12} md={6}><RHFTextField name="respondentId" label="Respondent ID (Optional)" /></Grid>
            <Grid item xs={12} md={6}><RHFTextField name="caseNumber" label="Case Number *" /></Grid>
            <Grid item xs={12} md={6}><RHFTextField name="clientInitials" label="Client Initials *" /></Grid>
            <Grid item xs={12} md={6}><RHFTextField name="clientPhone" label="Contact Number (Optional)" /></Grid>
            <Grid item xs={12} md={6}>
              <RHFTextField name="amountReceivedRm" label="Payment Amount (RM)" type="number" inputProps={{ min: 0, step: '0.01' }} />
            </Grid>
          </Grid>
        </Card>

        <Card sx={{ p: { xs: 2.5, md: 3 } }}>
          {/* 中文原文：辅导资料 */}<Typography variant="h6">Counselling Information</Typography>
          <Divider sx={{ my: 2.5 }} />
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}><RHFTextField name="counsellingDate" label="Counselling Date *" type="date" InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} md={6}>
              <RHFSelect name="counsellor" label="Counsellor *">
                {COUNSELLORS.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
              </RHFSelect>
            </Grid>
            <Grid item xs={12} md={6}>
              <RHFSelect name="sessionMode" label="Session Mode *">
                {SESSION_MODES.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
              </RHFSelect>
            </Grid>
            <Grid item xs={12} md={6}>
              <RHFSelect name="caseCategory" label="Case Category *">
                {CASE_CATEGORIES.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
              </RHFSelect>
            </Grid>
            {/* 中文原文：开始时间、结束时间、辅导时长、分钟 */}
            <Grid item xs={12} md={4}><RHFTextField name="sessionStart" label="Start Time *" type="time" InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} md={4}><RHFTextField name="sessionEnd" label="End Time *" type="time" InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Session Duration" value={duration ? `${duration} min` : '—'} disabled />
            </Grid>
          </Grid>
        </Card>

        <Card sx={{ p: { xs: 2.5, md: 3 } }}>
          {/* 中文原文：个案记录 */}<Typography variant="h6">Case Record</Typography>
          <Divider sx={{ my: 2.5 }} />
          <Stack spacing={2.5}>
            {/* 中文原文：案主自述摘要、志工处理步骤、详细报告链接、可选 */}
            <RHFTextField name="clientSummary" label="Client Statement Summary (Optional)" multiline minRows={3} />
            <RHFTextField name="volunteerActions" label="Volunteer Actions (Optional)" multiline minRows={3} />
            <RHFTextField name="reportUrl" label="Detailed Report Link (Optional)" placeholder="https://..." />
          </Stack>
        </Card>

        <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
          <Button variant="outlined" disabled={isSubmitting} onClick={() => navigate(PATH_DASHBOARD.general.counsellingCases)}>
            {/* 中文原文：取消 */}Cancel
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {/* 中文原文：更新个案、保存个案 */}{isEdit ? 'Update Case' : 'Save Case'}
          </LoadingButton>
        </Stack>
      </Stack>
    </FormProvider>
  );
}

CaseCreateForm.propTypes = {
  currentSession: PropTypes.object,
};
