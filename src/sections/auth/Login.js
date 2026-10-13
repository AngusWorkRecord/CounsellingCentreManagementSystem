import { Box, Divider, Stack, Typography } from '@mui/material';
import { tr, useUiLanguage } from '../../locales/translate';
import LoginLayout from '../../layouts/login';
import Iconify from '../../components/iconify';
import AuthLoginForm from './AuthLoginForm';

export default function Login() {
  useUiLanguage();
  return (
    <LoginLayout branded>
      <Stack spacing={0.75} sx={{ mb: 3.5 }}>
        <Typography component="h2" variant="h4" sx={{ color: '#203043' }}>{tr('Welcome Back')}</Typography>
        <Typography variant="body2" sx={{ color: '#687b89' }}>{tr('Please login to access the Counselling Centre Management System.')}</Typography>
      </Stack>
      <AuthLoginForm />
      <Divider sx={{ my: 3 }} />
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ bgcolor: '#eef9f3', borderRadius: 1.5, p: 1.5 }}>
        <Box sx={{ bgcolor: '#d2efdf', borderRadius: 1.5, p: 1, display: 'flex', flexShrink: 0 }}>
          <Iconify icon="eva:shield-fill" sx={{ color: '#00a854', width: 24, height: 24 }} />
        </Box>
        <Box>
          <Typography variant="subtitle2" sx={{ fontSize: 12 }}>{tr('Authorised Access Only')}</Typography>
          <Typography sx={{ fontSize: 11, lineHeight: 1.6, color: '#687b89' }}>{tr('This system contains confidential counselling information. Unauthorised access is strictly prohibited.')}</Typography>
        </Box>
      </Stack>
    </LoginLayout>
  );
}
