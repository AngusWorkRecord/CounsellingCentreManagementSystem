import { Helmet } from 'react-helmet-async';
// @mui
import { Box, Container } from '@mui/material';
import { Masonry } from '@mui/lab';
import { tr, useUiLanguage } from '../../../locales/translate';
// routes
import { PATH_PAGE } from '../../../routes/paths';
// components
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';
// sections
import FormDialogs from '../../../sections/_examples/mui/dialog/FormDialogs';
import AlertDialog from '../../../sections/_examples/mui/dialog/AlertDialog';
import ScrollDialog from '../../../sections/_examples/mui/dialog/ScrollDialog';
import SimpleDialogs from '../../../sections/_examples/mui/dialog/SimpleDialogs';
import MaxWidthDialog from '../../../sections/_examples/mui/dialog/MaxWidthDialog';
import FullScreenDialogs from '../../../sections/_examples/mui/dialog/FullScreenDialogs';
import TransitionsDialogs from '../../../sections/_examples/mui/dialog/TransitionsDialogs';
import { Block } from '../../../sections/_examples/Block';

// ----------------------------------------------------------------------

const style = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

// ----------------------------------------------------------------------

export default function MUIDialogPage() {
  useUiLanguage();
  return (
    <>
      <Helmet>
        <title> {tr("MUI Components: Dialog | Counselling Centre Management System")}</title>
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
            heading={tr("Dialog")}
            links={[
              {
                name: tr("Components"),
                href: PATH_PAGE.components,
              },
              { name: tr("Dialog") },
            ]}
            moreLink={['https://mui.com/components/dialogs']}
          />
        </Container>
      </Box>

      <Container sx={{ my: 10 }}>
        <Masonry columns={{ xs: 1, md: 3 }} spacing={3}>
          <Block title={tr("Simple")} sx={style}>
            <SimpleDialogs />
          </Block>

          <Block title={tr("Alerts")} sx={style}>
            <AlertDialog />
          </Block>

          <Block title={tr("Transitions")} sx={style}>
            <TransitionsDialogs />
          </Block>

          <Block title={tr("Form")} sx={style}>
            <FormDialogs />
          </Block>

          <Block title={tr("Full Screen")} sx={style}>
            <FullScreenDialogs />
          </Block>

          <Block title={tr("Max Width Dialog")} sx={style}>
            <MaxWidthDialog />
          </Block>

          <Block title={tr("Scrolling Content Dialogs")} sx={style}>
            <ScrollDialog />
          </Block>
        </Masonry>
      </Container>
    </>
  );
}
