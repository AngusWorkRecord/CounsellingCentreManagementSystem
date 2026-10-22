import { useRef, useState } from 'react';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Stack, Alert, Checkbox, FormControlLabel, Typography, IconButton, InputAdornment } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { tr, useUiLanguage } from '../../locales/translate';
import { uiMessage } from '../../locales/uiMessage';
import { useAuthContext } from '../../auth/useAuthContext';
import Iconify from '../../components/iconify';
import FormProvider, { RHFTextField } from '../../components/hook-form';

export default function AuthLoginForm() {
  useUiLanguage();
  const { login } = useAuthContext();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const submitting = useRef(false);
  const LoginSchema = Yup.object().shape({
    username: Yup.string().trim().required(tr('Username is required')),
    password: Yup.string().required(tr('Password is required')),
  });
  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues: { username: '', password: '' },
  });
  const { setError, clearErrors, handleSubmit, formState: { errors, isSubmitting } } = methods;
  const onSubmit = async (data) => {
    if (submitting.current) return;
    submitting.current = true;
    clearErrors('afterSubmit');
    try {
      const response = await login(data.username, data.password, rememberMe);
      if (!response) setError('afterSubmit', { message: tr('Invalid username or password.') });
    } catch (error) {
      let message = tr('Unable to login. Please try again.');
      if (error.code === 'INVALID_CREDENTIALS') message = tr('Invalid username or password.');
      if (error.code === 'INVALID_REQUEST') message = tr('Please enter a valid username and password.');
      setError('afterSubmit', { message });
    } finally {
      submitting.current = false;
    }
  };
  const fieldSx = {
    '& .MuiOutlinedInput-root': { borderRadius: 1, color: '#203043', bgcolor: '#fff' },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#dce3e7' },
    '& .MuiInputBase-input': { fontSize: 14 },
    '& .MuiInputAdornment-root': { color: '#8796a5' },
  };
  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2.5}>
        {!!errors.afterSubmit && <Alert severity="error">{uiMessage(errors.afterSubmit.message)}</Alert>}
        <Stack spacing={0.75}>
          <Typography component="label" htmlFor="login-username" variant="subtitle2">{tr('Username')}</Typography>
          <RHFTextField id="login-username" name="username" placeholder={tr('Enter your username')} autoComplete="username" size="small" disabled={isSubmitting}
            inputProps={{ 'aria-label': tr('Username') }}
            InputProps={{ startAdornment: <InputAdornment position="start"><Iconify icon="eva:person-fill" /></InputAdornment> }} sx={fieldSx} />
        </Stack>
        <Stack spacing={0.75}>
          <Typography component="label" htmlFor="login-password" variant="subtitle2">{tr('Password')}</Typography>
          <RHFTextField id="login-password" name="password" placeholder={tr('Enter your password')} autoComplete="current-password" size="small" type={showPassword ? 'text' : 'password'} disabled={isSubmitting}
            inputProps={{ 'aria-label': tr('Password') }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Iconify icon="eva:lock-fill" /></InputAdornment>,
              endAdornment: <InputAdornment position="end"><IconButton type="button" edge="end" aria-label={showPassword ? tr('Hide password') : tr('Show password')} aria-pressed={showPassword} onClick={() => setShowPassword((value) => !value)}><Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} /></IconButton></InputAdornment>,
            }} sx={fieldSx} />
          <Typography variant="caption" sx={{ color: '#687b89', pt: 0.5 }}>{tr('Forgot password? Contact an administrator to reset your password.')}</Typography>
        </Stack>
        <Stack spacing={0}>
          <FormControlLabel disabled={isSubmitting} control={<Checkbox checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} size="small" />} label={tr('Keep me signed in')} sx={{ '& .MuiFormControlLabel-label': { fontSize: 13 } }} />
        </Stack>
        <LoadingButton fullWidth size="large" type="submit" variant="contained" loading={isSubmitting} endIcon={<Iconify icon="eva:arrow-forward-fill" />}
          sx={{ bgcolor: '#00ad55', color: '#fff', borderRadius: 1, boxShadow: 'none', '&:hover': { bgcolor: '#008f46', boxShadow: 'none' } }}>{tr('Login')}</LoadingButton>
      </Stack>
    </FormProvider>
  );
}
