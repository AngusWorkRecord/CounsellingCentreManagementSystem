import { Helmet } from 'react-helmet-async';
// @mui
import { alpha } from '@mui/material/styles';
import { Box, Alert, Button, Container, AlertTitle, Stack } from '@mui/material';
import { Masonry } from '@mui/lab';
import { tr, useUiLanguage } from '../../../locales/translate';
// routes
import { PATH_PAGE } from '../../../routes/paths';
// components
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';
// sections
import { Block } from '../../../sections/_examples/Block';

// ----------------------------------------------------------------------

const COLORS = ['info', 'success', 'warning', 'error'];

// ----------------------------------------------------------------------

export default function MUIAlertPage() {
  useUiLanguage();
  return (
    <>
      <Helmet>
        <title> {tr("MUI Components: Alert | Counselling Centre Management System")}</title>
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
            heading={tr("Alert")}
            links={[
              {
                name: tr("Components"),
                href: PATH_PAGE.components,
              },
              { name: tr("Alert") },
            ]}
            moreLink={['https://mui.com/components/alert']}
          />
        </Container>
      </Box>

      <Container sx={{ my: 10 }}>
        <Masonry columns={2} spacing={3}>
          <Block title={tr("Standard")}>
            <Stack spacing={2}>
              {COLORS.map((color) => (
                <Alert key={color} severity={color} onClose={() => {}}>{tr("This is an")}{tr(color)}{tr("alert — check it out!")}</Alert>
              ))}
            </Stack>
          </Block>

          <Block title={tr("Filled")}>
            <Stack spacing={2}>
              {COLORS.map((color) => (
                <Alert key={color} severity={color} variant="filled" onClose={() => {}}>{tr("This is an")}{tr(color)}{tr("alert — check it out!")}</Alert>
              ))}
            </Stack>
          </Block>

          <Block title={tr("Outlined")}>
            <Stack spacing={2}>
              {COLORS.map((color) => (
                <Alert key={color} severity={color} variant="outlined" onClose={() => {}}>{tr("This is an")}{tr(color)}{tr("alert — check it out!")}</Alert>
              ))}
            </Stack>
          </Block>

          <Block title={tr("Description")}>
            <Stack spacing={2}>
              {COLORS.map((color) => (
                <Alert key={color} severity={color} onClose={() => {}}>
                  <AlertTitle sx={{ textTransform: 'capitalize' }}> {tr(color)} </AlertTitle>{tr("This is an")}{tr(color)} {tr("alert —")} <strong>{tr("check it out!")}</strong>
                </Alert>
              ))}
            </Stack>
          </Block>

          <Block title={tr("Actions")}>
            <Stack spacing={2}>
              <Alert
                severity="info"
                action={
                  <Button color="info" size="small" variant="soft">{tr("Action")}</Button>
                }
              >{tr("This is an info alert — check it out!")}</Alert>

              <Alert
                severity="info"
                variant="filled"
                action={
                  <>
                    <Button
                      color="inherit"
                      size="small"
                      variant="outlined"
                      sx={{
                        mr: 1,
                        border: (theme) => `1px solid ${alpha(theme.palette.common.white, 0.48)}`,
                      }}
                    >{tr("Undo")}</Button>

                    <Button
                      size="small"
                      color="inherit"
                      variant="contained"
                      sx={{
                        bgcolor: 'common.white',
                      }}
                    >{tr("Action")}</Button>
                  </>
                }
              >{tr("This is an info alert — check it out!")}</Alert>

              <Alert
                severity="info"
                variant="outlined"
                action={
                  <>
                    <Button
                      color="info"
                      size="small"
                      variant="outlined"
                      sx={{
                        mr: 1,
                      }}
                    >{tr("Undo")}</Button>

                    <Button color="info" size="small" variant="contained">{tr("Action")}</Button>
                  </>
                }
              >{tr("This is an info alert — check it out!")}</Alert>
            </Stack>
          </Block>
        </Masonry>
      </Container>
    </>
  );
}
