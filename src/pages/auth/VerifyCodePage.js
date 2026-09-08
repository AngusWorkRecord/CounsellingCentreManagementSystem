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
import AuthVerifyCodeForm from '../../sections/auth/AuthVerifyCodeForm';
// assets
import { EmailInboxIcon } from '../../assets/icons';

// ----------------------------------------------------------------------

export default function VerifyCodePage() {
  useUiLanguage();
  return (
    <>
      <Helmet>
        <title> {tr("Verify Code | Counselling Centre Management System")}</title>
      </Helmet>

      <EmailInboxIcon sx={{ mb: 5, height: 96 }} />

      <Typography variant="h3" paragraph>{tr("Please check your email!")}</Typography>

      <Typography sx={{ color: 'text.secondary', mb: 5 }}>{tr("We have emailed a 6-digit confirmation code to acb@domain, please enter the code in below box to verify your email.")}</Typography>

      <AuthVerifyCodeForm />

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
