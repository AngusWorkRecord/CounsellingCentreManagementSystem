import { Helmet } from 'react-helmet-async';
// @mui
import { Box, Paper, Container, Stack } from '@mui/material';
import { tr, useUiLanguage } from '../../../locales/translate';
// routes
import { PATH_PAGE } from '../../../routes/paths';
// components
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';
// sections
import { Block } from '../../../sections/_examples/Block';
import CustomizedStepper from '../../../sections/_examples/mui/stepper/CustomizedStepper';
import VerticalLinearStepper from '../../../sections/_examples/mui/stepper/VerticalLinearStepper';
import LinearAlternativeLabel from '../../../sections/_examples/mui/stepper/LinearAlternativeLabel';
import HorizontalLinearStepper from '../../../sections/_examples/mui/stepper/HorizontalLinearStepper';

// ----------------------------------------------------------------------

export default function MUIStepperPage() {
  useUiLanguage();
  return (
    <>
      <Helmet>
        <title> {tr("MUI Components: Stepper | Counselling Centre Management System")}</title>
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
            heading={tr("Stepper")}
            links={[
              {
                name: tr("Components"),
                href: PATH_PAGE.components,
              },
              { name: tr("Stepper") },
            ]}
            moreLink={['https://mui.com/components/steppers']}
          />
        </Container>
      </Box>

      <Container sx={{ my: 10 }}>
        <Stack spacing={3}>
          <Block title={tr("Horizontal Linear Stepper")}>
            <Paper
              sx={{
                p: 3,
                width: '100%',
                boxShadow: (theme) => theme.customShadows.z8,
              }}
            >
              <HorizontalLinearStepper />
            </Paper>
          </Block>

          <Block title={tr("Linear Alternative Label")}>
            <Paper
              sx={{
                p: 3,
                width: '100%',
                boxShadow: (theme) => theme.customShadows.z8,
              }}
            >
              <LinearAlternativeLabel />
            </Paper>
          </Block>

          <Block title={tr("Vertical Linear Stepper")}>
            <Paper
              sx={{
                p: 3,
                width: '100%',
                boxShadow: (theme) => theme.customShadows.z8,
              }}
            >
              <VerticalLinearStepper />
            </Paper>
          </Block>

          <Block title={tr("Customized Stepper")}>
            <Paper
              sx={{
                p: 3,
                width: '100%',
                boxShadow: (theme) => theme.customShadows.z8,
              }}
            >
              <CustomizedStepper />
            </Paper>
          </Block>
        </Stack>
      </Container>
    </>
  );
}
