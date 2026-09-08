import { Helmet } from 'react-helmet-async';
// @mui
import { Box, Container, Stack, Card, CardHeader, Typography, Link } from '@mui/material';
import { tr, useUiLanguage } from '../../../locales/translate';
// routes
import { PATH_PAGE } from '../../../routes/paths';
// _mock_
import _mock, { randomInArray } from '../../../_mock';
// components
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';
// sections
import DataGridBasic from '../../../sections/_examples/mui/data-grid/DataGridBasic';
import DataGridCustom from '../../../sections/_examples/mui/data-grid/DataGridCustom';

// ----------------------------------------------------------------------

export const _dataGrid = [...Array(36)].map((_, index) => ({
  id: _mock.id(index),
  name: _mock.name.fullName(index),
  email: _mock.email(index),
  lastLogin: _mock.time(index),
  performance: _mock.number.percent(index),
  rating: _mock.number.rating(index),
  status: randomInArray(['online', 'away', 'busy']),
  isAdmin: _mock.boolean(index),
  lastName: _mock.name.lastName(index),
  firstName: _mock.name.firstName(index),
  age: _mock.number.age(index),
}));

// ----------------------------------------------------------------------

export default function MUIDataGridPage() {
  useUiLanguage();
  return (
    <>
      <Helmet>
        <title> {tr("MUI Components: DataGrid | Counselling Centre Management System")}</title>
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
            heading={tr("DataGrid")}
            links={[
              {
                name: tr("Components"),
                href: PATH_PAGE.components,
              },
              { name: tr("DataGrid") },
            ]}
            moreLink={['https://mui.com/x/react-data-grid/']}
            sx={{ mb: 0 }}
          />

          <Typography variant="body2" sx={{ my: 3 }}>{tr("This component includes 2")}<strong>{tr("Free")}</strong> {tr("and")} <strong>{tr("Paid")}</strong>{tr("versions from MUI.")}<br />{tr("Paid version will have more features. Please read more")}{' '}
            <Link href="https://mui.com/x/react-data-grid/" target="_blank" rel="noopener">{tr("here")}</Link>
          </Typography>
        </Container>
      </Box>

      <Container sx={{ my: 10 }}>
        <Stack spacing={5}>
          <Card>
            <CardHeader title={tr("Basic")} sx={{ mb: 2 }} />
            <Box sx={{ height: 390 }}>
              <DataGridBasic data={_dataGrid} />
            </Box>
          </Card>

          <Card>
            <CardHeader title={tr("Custom")} sx={{ mb: 2 }} />
            <Box sx={{ height: 720 }}>
              <DataGridCustom data={_dataGrid} />
            </Box>
          </Card>
        </Stack>
      </Container>
    </>
  );
}
