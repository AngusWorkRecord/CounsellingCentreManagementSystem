import { Helmet } from 'react-helmet-async';
// @mui
import { Box, Card, Container, CardHeader, Stack } from '@mui/material';
import { tr, useUiLanguage } from '../../../locales/translate';
// routes
import { PATH_PAGE } from '../../../routes/paths';
// components
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';
// sections
import BasicTable from '../../../sections/_examples/mui/table/BasicTable';
import CollapsibleTable from '../../../sections/_examples/mui/table/collapsible-table';
import SortingSelecting from '../../../sections/_examples/mui/table/sorting-selecting';
import GroupingFixedHeader from '../../../sections/_examples/mui/table/GroupingFixedHeader';

// ----------------------------------------------------------------------

export default function MUITablePage() {
  useUiLanguage();
  return (
    <>
      <Helmet>
        <title> {tr("MUI Components: Table | Counselling Centre Management System")}</title>
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
            heading={tr("Table")}
            links={[
              {
                name: tr("Components"),
                href: PATH_PAGE.components,
              },
              { name: tr("Table") },
            ]}
            moreLink={['https://mui.com/components/tables']}
          />
        </Container>
      </Box>

      <Container sx={{ my: 10 }}>
        <Stack spacing={3}>
          <Card>
            <CardHeader title={tr("Basic Table")} />
            <BasicTable />
          </Card>

          <Card>
            <SortingSelecting />
          </Card>

          <Card>
            <CardHeader title={tr("Grouping & FixedHeader")} />
            <GroupingFixedHeader />
          </Card>

          <Card>
            <CardHeader title={tr("Collapsible Table")} />
            <CollapsibleTable />
          </Card>
        </Stack>
      </Container>
    </>
  );
}
