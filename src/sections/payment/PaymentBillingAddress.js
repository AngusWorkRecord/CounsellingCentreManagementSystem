import { Typography, TextField, Stack } from '@mui/material';
import { tr, useUiLanguage } from '../../locales/translate';
// @mui

// ----------------------------------------------------------------------

export default function PaymentBillingAddress() {
  useUiLanguage();
  return (
    <div>
      <Typography variant="h6">{tr("Billing Address")}</Typography>

      <Stack spacing={3} mt={5}>
        <TextField fullWidth label={tr("Person name")} />
        <TextField fullWidth label={tr("Phone number")} />
        <TextField fullWidth label={tr("Email")} />
        <TextField fullWidth label={tr("Address")} />
      </Stack>
    </div>
  );
}
