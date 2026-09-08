import { Helmet } from 'react-helmet-async';
// @mui
import { Masonry } from '@mui/lab';
import { Box, Fab, Zoom, Fade, Button, Tooltip, Container, IconButton } from '@mui/material';
import { tr, useUiLanguage } from '../../../locales/translate';
// routes
import { PATH_PAGE } from '../../../routes/paths';
// components
import Iconify from '../../../components/iconify';
import { FabButtonAnimate } from '../../../components/animate';
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';
// sections
import { Block } from '../../../sections/_examples/Block';

// ----------------------------------------------------------------------

const LONG_TEXT = `
Aliquam eget finibus ante, non facilisis lectus. Sed vitae dignissim est, vel aliquam tellus.
Praesent non nunc mollis, fermentum neque at, semper arcu.
Nullam eget est sed sem iaculis gravida eget vitae justo.
`;

const style = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexWrap: 'wrap',
  '& > *': { m: '8px !important' },
};

// ----------------------------------------------------------------------

export default function MUITooltipPage() {
  useUiLanguage();
  return (
    <>
      <Helmet>
        <title> {tr("MUI Components: Tooltip | Counselling Centre Management System")}</title>
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
            heading={tr("Tooltip")}
            links={[
              {
                name: tr("Components"),
                href: PATH_PAGE.components,
              },
              { name: tr("Tooltip") },
            ]}
            moreLink={['https://mui.com/components/tooltips']}
          />
        </Container>
      </Box>

      <Container sx={{ my: 10 }}>
        <Masonry columns={{ xs: 1, md: 2 }} spacing={3}>
          <Block title={tr("Simple")} sx={style}>
            <Tooltip title={tr("Delete")}>
              <IconButton>
                <Iconify icon="eva:trash-2-outline" width={24} />
              </IconButton>
            </Tooltip>

            <Tooltip title={tr("Add")}>
              <Fab>
                <Iconify icon="eva:plus-fill" width={24} />
              </Fab>
            </Tooltip>

            <Tooltip title={tr("Delete")}>
              <IconButton color="info">
                <Iconify icon="eva:trash-2-outline" width={24} />
              </IconButton>
            </Tooltip>

            <Tooltip title={tr("Add")}>
              <FabButtonAnimate color="info">
                <Iconify icon="eva:plus-fill" width={24} />
              </FabButtonAnimate>
            </Tooltip>

            <Tooltip title={tr("Add")}>
              <Button variant="outlined" color="info">{tr("Button")}</Button>
            </Tooltip>
          </Block>

          <Block title={tr("Arrow")} sx={style}>
            <Tooltip title={tr("Add")} arrow>
              <Fab>
                <Iconify icon="eva:plus-fill" width={24} />
              </Fab>
            </Tooltip>
          </Block>

          <Block title={tr("Variable Width")} sx={style}>
            <Tooltip title={LONG_TEXT}>
              <Button color="inherit">{tr("Default Width [300px]")}</Button>
            </Tooltip>

            <Tooltip title={LONG_TEXT} sx={{ maxWidth: 500 }}>
              <Button color="inherit">{tr("Custom Width [500px]")}</Button>
            </Tooltip>

            <Tooltip title={LONG_TEXT} sx={{ maxWidth: 'none' }}>
              <Button color="inherit">{tr("No wrapping")}</Button>
            </Tooltip>
          </Block>

          <Block title={tr("Transitions")} sx={style}>
            <Tooltip title={tr("Add")}>
              <Button color="inherit">{tr("Grow")}</Button>
            </Tooltip>

            <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} title={tr("Add")}>
              <Button color="inherit">{tr("Fade")}</Button>
            </Tooltip>

            <Tooltip TransitionComponent={Zoom} title={tr("Add")}>
              <Button color="inherit">{tr("Zoom")}</Button>
            </Tooltip>
          </Block>

          <Block title={tr("Positioned")} sx={style}>
            <Tooltip title={tr("Add")} placement="top-start">
              <Button color="inherit">{tr("top-start")}</Button>
            </Tooltip>

            <Tooltip title={tr("Add")} placement="top">
              <Button color="inherit">{tr("top")}</Button>
            </Tooltip>

            <Tooltip title={tr("Add")} placement="top-end">
              <Button color="inherit">{tr("top-end")}</Button>
            </Tooltip>

            <Tooltip title={tr("Add")} placement="left-start">
              <Button color="inherit">{tr("left-start")}</Button>
            </Tooltip>

            <Tooltip title={tr("Add")} placement="left">
              <Button color="inherit">{tr("left")}</Button>
            </Tooltip>

            <Tooltip title={tr("Add")} placement="left-end">
              <Button color="inherit">{tr("left-end")}</Button>
            </Tooltip>

            <Tooltip title={tr("Add")} placement="right-start">
              <Button color="inherit">{tr("right-start")}</Button>
            </Tooltip>

            <Tooltip title={tr("Add")} placement="right">
              <Button color="inherit">{tr("right")}</Button>
            </Tooltip>

            <Tooltip title={tr("Add")} placement="right-end">
              <Button color="inherit">{tr("right-end")}</Button>
            </Tooltip>

            <Tooltip title={tr("Add")} placement="bottom-start">
              <Button color="inherit">{tr("bottom-start")}</Button>
            </Tooltip>

            <Tooltip title={tr("Add")} placement="bottom">
              <Button color="inherit">{tr("bottom")}</Button>
            </Tooltip>

            <Tooltip title={tr("Add")} placement="bottom-end">
              <Button color="inherit">{tr("bottom-end")}</Button>
            </Tooltip>
          </Block>
        </Masonry>
      </Container>
    </>
  );
}
