import { Helmet } from 'react-helmet-async';
// @mui
import { Box, Card, Grid, Container, CardHeader, CardContent } from '@mui/material';
import { tr, useUiLanguage } from '../../../locales/translate';
// routes
import { PATH_PAGE } from '../../../routes/paths';
// components
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';
// sections
import {
  ChartPie,
  ChartBar,
  ChartLine,
  ChartArea,
  ChartMixed,
  ChartDonut,
  ChartsRadarBar,
  ChartRadialBar,
  ChartColumnSingle,
  ChartColumnStacked,
  ChartColumnNegative,
  ChartColumnMultiple,
} from '../../../sections/_examples/extra/chart';

// ----------------------------------------------------------------------

export default function DemoChartsPage() {
  useUiLanguage();
  return (
    <>
      <Helmet>
        <title> {tr("Extra Components: Charts | Counselling Centre Management System")}</title>
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
            heading={tr("Charts")}
            links={[
              {
                name: tr("Components"),
                href: PATH_PAGE.components,
              },
              { name: tr("Charts") },
            ]}
            moreLink={['https://apexcharts.com']}
          />
        </Container>
      </Box>

      <Container sx={{ my: 10 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card dir="ltr">
              <CardHeader title={tr("Area")} />
              <CardContent>
                <ChartArea />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card dir="ltr">
              <CardHeader title={tr("Line")} />
              <CardContent>
                <ChartLine />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card dir="ltr">
              <CardHeader title={tr("Column Single")} />
              <CardContent>
                <ChartColumnSingle />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card dir="ltr">
              <CardHeader title={tr("Column Multiple")} />
              <CardContent>
                <ChartColumnMultiple />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card dir="ltr">
              <CardHeader title={tr("Column Stacked")} />
              <CardContent>
                <ChartColumnStacked />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card dir="ltr">
              <CardHeader title={tr("Column Negative")} />
              <CardContent>
                <ChartColumnNegative />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card dir="ltr">
              <CardHeader title={tr("Bar")} />
              <CardContent>
                <ChartBar />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card dir="ltr">
              <CardHeader title={tr("Mixed")} />
              <CardContent>
                <ChartMixed />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card dir="ltr">
              <CardHeader title={tr("Pie")} />
              <CardContent
                sx={{
                  height: 420,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ChartPie />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card dir="ltr">
              <CardHeader title={tr("Donut")} />
              <CardContent
                sx={{
                  height: 420,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ChartDonut />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card dir="ltr">
              <CardHeader title={tr("Radial Bar")} />
              <CardContent
                sx={{
                  height: 420,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ChartRadialBar />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card dir="ltr">
              <CardHeader title={tr("Radar")} />
              <CardContent
                sx={{
                  height: 420,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ChartsRadarBar />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
