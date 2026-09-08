import { Helmet } from 'react-helmet-async';
// @mui
import { Box, Container, Stack } from '@mui/material';
import { tr, useUiLanguage } from '../../../locales/translate';
// routes
import { PATH_PAGE } from '../../../routes/paths';
// components
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';
// sections
import { Block } from '../../../sections/_examples/Block';
import SimpleTransferList from '../../../sections/_examples/mui/transfer-list/SimpleTransferList';
import EnhancedTransferList from '../../../sections/_examples/mui/transfer-list/EnhancedTransferList';

// ----------------------------------------------------------------------

const style = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexWrap: 'wrap',
};

// ----------------------------------------------------------------------

export default function MUITransferListPage() {
  useUiLanguage();
  return (
    <>
      <Helmet>
        <title> {tr("MUI Components: Transfer List | Counselling Centre Management System")}</title>
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
            heading={tr("Transfer List")}
            links={[
              {
                name: tr("Components"),
                href: PATH_PAGE.components,
              },
              { name: tr("Transfer List") },
            ]}
            moreLink={['https://mui.com/components/transfer-list']}
          />
        </Container>
      </Box>

      <Container sx={{ my: 10 }}>
        <Stack spacing={3}>
          <Block title={tr("Simple")} sx={style}>
            <SimpleTransferList />
          </Block>

          <Block title={tr("Enhanced")} sx={style}>
            <EnhancedTransferList />
          </Block>
        </Stack>
      </Container>
    </>
  );
}
