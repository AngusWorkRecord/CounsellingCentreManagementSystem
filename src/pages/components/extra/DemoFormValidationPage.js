import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
// @mui
import {
  Box,
  Stack,
  Switch,
  Divider,
  Container,
  Typography,
  FormControlLabel,
} from '@mui/material';
import { tr, useUiLanguage } from '../../../locales/translate';
// routes
import { PATH_PAGE } from '../../../routes/paths';
// components
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';
// sections
import { ReactHookForm } from '../../../sections/_examples/extra/form';

// ----------------------------------------------------------------------

export default function DemoFormValidationPage() {
  useUiLanguage();
  const [debug, setDebug] = useState(true);

  const handleChangeDebug = (event) => {
    setDebug(event.target.checked);
  };

  return (
    <>
      <Helmet>
        <title> {tr("Extra Components: Form Validation | Counselling Centre Management System")}</title>
      </Helmet>

      <Box
        sx={{
          pt: 6,
          pb: 1,
          bgcolor: (theme) => (theme.palette.mode === 'light' ? 'grey.200' : 'grey.800'),
        }}
      >
        <Container>
          <CustomBreadcrumbs
            heading={tr("Form Validation")}
            links={[
              { name: tr("Components"), href: PATH_PAGE.components },
              { name: tr("Form Validation") },
            ]}
            moreLink={['https://react-hook-form.com/', 'https://github.com/jquense/yup']}
          />
        </Container>
      </Box>

      <Container sx={{ my: 10 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h4"> React Hook Form + Yup </Typography>
          <FormControlLabel
            control={<Switch checked={debug} onChange={handleChangeDebug} />}
            label={tr("Show Debug")}
            labelPlacement="start"
          />
        </Stack>

        <Divider sx={{ my: 5 }} />

        <ReactHookForm debug={debug} />
      </Container>
    </>
  );
}
