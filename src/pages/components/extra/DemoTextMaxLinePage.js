import { Helmet } from 'react-helmet-async';
// @mui
import Masonry from '@mui/lab/Masonry';
import { Box, Card, CardHeader, Container, CardContent } from '@mui/material';
import { tr, useUiLanguage } from '../../../locales/translate';
// routes
import { PATH_PAGE } from '../../../routes/paths';
// components
import TextMaxLine from '../../../components/text-max-line';
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';

// ----------------------------------------------------------------------

export default function DemoTextMaxLinePage() {
  useUiLanguage();
  return (
    <>
      <Helmet>
        <title> {tr("Extra Components: Text Max Line | Counselling Centre Management System")}</title>
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
            heading={tr("TextMaxLine")}
            links={[
              {
                name: tr("Components"),
                href: PATH_PAGE.components,
              },
              { name: tr("TextMaxLine") },
            ]}
          />
        </Container>
      </Box>

      <Container sx={{ my: 10 }}>
        <Masonry columns={3} spacing={3}>
          <Card>
            <CardHeader title={tr("1 Line")} />
            <CardContent>
              <TextMaxLine line={1}>{tr("Donec posuere vulputate arcu. Fusce vulputate eleifend sapien. Phasellus magna. Proin sapien ipsum, porta a, auctor quis, euismod ut, mi. Suspendisse faucibus, nunc et pellentesque egestas, lacus ante convallis tellus, vitae iaculis lacus elit id tortor.")}</TextMaxLine>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title={tr("2 Line")} />
            <CardContent>
              <TextMaxLine>{tr("Donec posuere vulputate arcu. Fusce vulputate eleifend sapien. Phasellus magna. Proin sapien ipsum, porta a, auctor quis, euismod ut, mi. Suspendisse faucibus, nunc et pellentesque egestas, lacus ante convallis tellus, vitae iaculis lacus elit id tortor.")}</TextMaxLine>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title={tr("3 Line")} />
            <CardContent>
              <TextMaxLine line={3}>{tr("Donec posuere vulputate arcu. Fusce vulputate eleifend sapien. Phasellus magna. Proin sapien ipsum, porta a, auctor quis, euismod ut, mi. Suspendisse faucibus, nunc et pellentesque egestas, lacus ante convallis tellus, vitae iaculis lacus elit id tortor.")}</TextMaxLine>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title={tr("4 Line")} />
            <CardContent>
              <TextMaxLine line={4}>{tr("Donec posuere vulputate arcu. Fusce vulputate eleifend sapien. Phasellus magna. Proin sapien ipsum, porta a, auctor quis, euismod ut, mi. Suspendisse faucibus, nunc et pellentesque egestas, lacus ante convallis tellus, vitae iaculis lacus elit id tortor.")}</TextMaxLine>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title={tr("As Link")} />
            <CardContent>
              <TextMaxLine asLink line={3} href="#" color="primary" sx={{ maxWidth: 300 }}>{tr("Donec posuere vulputate arcu. Fusce vulputate eleifend sapien. Phasellus magna. Proin sapien ipsum, porta a, auctor quis, euismod ut, mi. Suspendisse faucibus, nunc et pellentesque egestas, lacus ante convallis tellus, vitae iaculis lacus elit id tortor.")}</TextMaxLine>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title={tr("Persistent")} />
            <CardContent>
              <TextMaxLine persistent line={3} href="#" sx={{ bgcolor: 'background.neutral' }}>{tr("Donec posuere vulputate arcu.")}</TextMaxLine>
            </CardContent>
          </Card>
        </Masonry>
      </Container>
    </>
  );
}
