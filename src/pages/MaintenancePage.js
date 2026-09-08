import { Helmet } from 'react-helmet-async';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { Button, Typography, Stack } from '@mui/material';
import { tr, useUiLanguage } from '../locales/translate';
// assets
import { MaintenanceIllustration } from '../assets/illustrations';

// ----------------------------------------------------------------------

export default function MaintenancePage() {
  useUiLanguage();
  return (
    <>
      <Helmet>
        <title> {tr("Maintenance | Counselling Centre Management System")}</title>
      </Helmet>

      <Stack sx={{ alignItems: 'center' }}>
        <Typography variant="h3" paragraph>{tr("Website currently under maintenance")}</Typography>

        <Typography sx={{ color: 'text.secondary' }}>{tr("We are currently working hard on this page!")}</Typography>

        <MaintenanceIllustration sx={{ my: 10, height: 240 }} />

        <Button component={RouterLink} to="/" size="large" variant="contained">{tr("Go to Home")}</Button>
      </Stack>
    </>
  );
}
