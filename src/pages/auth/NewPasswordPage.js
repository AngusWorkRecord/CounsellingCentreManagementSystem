import { Helmet } from 'react-helmet-async';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { Link, Typography } from '@mui/material';
import { tr, useUiLanguage } from '../../locales/translate';
// routes
import { PATH_AUTH } from '../../routes/paths';
// components
import Iconify from '../../components/iconify';
// sections
import AuthNewPasswordForm from '../../sections/auth/AuthNewPasswordForm';
// assets
import { SentIcon } from '../../assets/icons';

// ----------------------------------------------------------------------

export default function NewPasswordPage() {
  useUiLanguage();
  return (
    <>
      <Helmet>
        <title> {tr("New Password | Counselling Centre Management System")}</title>
      </Helmet>

      <SentIcon sx={{ mb: 5, height: 96 }} />

      <Typography variant="h3" paragraph>{tr("Request sent successfully!")}</Typography>

      <Typography sx={{ color: 'text.secondary', mb: 5 }}>{tr("We've sent a 6-digit confirmation email to your email.")}<br />{tr("Please enter the code in below box to verify your email.")}</Typography>

      <AuthNewPasswordForm />

      <Typography variant="body2" sx={{ my: 3 }}>{tr("Don’t have a code?")}<Link variant="subtitle2">{tr("Resend code")}</Link>
      </Typography>

      <Link
        component={RouterLink}
        to={PATH_AUTH.login}
        color="inherit"
        variant="subtitle2"
        sx={{
          mx: 'auto',
          alignItems: 'center',
          display: 'inline-flex',
        }}
      >
        <Iconify icon="eva:chevron-left-fill" width={16} />{tr("Return to sign in")}</Link>
    </>
  );
}
