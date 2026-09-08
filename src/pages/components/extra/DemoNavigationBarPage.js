import { Helmet } from 'react-helmet-async';
// @mui
import { Box, Container, Stack, AppBar, Toolbar, Typography } from '@mui/material';
import { tr, useUiLanguage } from '../../../locales/translate';
// routes
import { PATH_PAGE } from '../../../routes/paths';
// config
import { NAV, HEADER } from '../../../config-global';
// components
import Iconify from '../../../components/iconify';
import {
  NavSectionMini,
  NavSectionVertical,
  NavSectionHorizontal,
} from '../../../components/nav-section';
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';

// ----------------------------------------------------------------------

export default function DemoNavigationBarPage() {
  useUiLanguage();
  return (
    <>
      <Helmet>
        <title> {tr("Extra Components: Navigation Bar | Counselling Centre Management System")}</title>
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
            heading={tr("Navigation Bar")}
            links={[
              {
                name: tr("Components"),
                href: PATH_PAGE.components,
              },
              { name: tr("Navigation Bar") },
            ]}
          />
        </Container>
      </Box>

      <Container sx={{ my: 10 }}>
        <Stack spacing={2} sx={{ mb: 10 }}>
          <Typography variant="h6"> {tr("Nav Horizontal")} </Typography>
          <AppBar
            position="static"
            component="nav"
            color="default"
            sx={{
              boxShadow: 0,
              top: HEADER.H_DASHBOARD_DESKTOP_OFFSET,
            }}
          >
            <Toolbar>
              <NavSectionHorizontal data={NAV_ITEMS} />
            </Toolbar>
          </AppBar>
        </Stack>

        <Stack direction="row" spacing={5}>
          <Stack spacing={2} sx={{ width: NAV.W_BASE }}>
            <Typography variant="h6"> {tr("Nav Vertical")} </Typography>

            <NavSectionVertical
              data={NAV_ITEMS}
              sx={{
                py: 5,
                borderRadius: 2,
                bgcolor: 'background.paper',
                boxShadow: (theme) => theme.customShadows.z24,
              }}
            />
          </Stack>

          <Stack spacing={2} sx={{ width: NAV.W_DASHBOARD_MINI }}>
            <Typography variant="h6"> {tr("Nav Mini")} </Typography>

            <NavSectionMini
              data={NAV_ITEMS}
              sx={{
                py: 5,
                borderRadius: 2,
                bgcolor: 'background.paper',
                boxShadow: (theme) => theme.customShadows.z24,
              }}
            />
          </Stack>
        </Stack>
      </Container>
    </>
  );
}

// ----------------------------------------------------------------------

const NAV_ITEMS = [
  {
    get subheader() { return tr("Marketing"); },
    items: [
      {
        get title() { return tr("Landing"); },
        path: '#',
        icon: <Iconify icon="carbon:bat" />,
      },
      {
        get title() { return tr("Services"); },
        path: '#',
        icon: <Iconify icon="carbon:cyclist" />,
      },
      {
        get title() { return tr("Case Studies"); },
        path: '#',
        icon: <Iconify icon="carbon:3d-cursor-alt" />,
        children: [
          { get title() { return tr("Case Studies"); }, path: '#' },
          { get title() { return tr("Case Study"); }, path: '#' },
        ],
      },
      {
        get title() { return tr("Blog"); },
        path: '#',
        icon: <Iconify icon="carbon:3d-mpr-toggle" />,
        children: [
          { get title() { return tr("Blog Posts"); }, path: '#' },
          { get title() { return tr("Blog Post"); }, path: '#' },
        ],
      },
      {
        get title() { return tr("About"); },
        path: '#',
        icon: <Iconify icon="carbon:airport-01" />,
      },
      {
        get title() { return tr("Contact"); },
        path: '#',
        icon: <Iconify icon="carbon:battery-full" />,
      },
      {
        get title() { return tr("Tours"); },
        path: '#',
        icon: <Iconify icon="carbon:basketball" />,
        children: [
          { get title() { return tr("Tours"); }, path: '#' },
          { get title() { return tr("Tour"); }, path: '#' },
        ],
      },
      {
        get title() { return tr("Checkout"); },
        path: '#',
        icon: <Iconify icon="carbon:area" />,
        children: [
          { get title() { return tr("Checkout"); }, path: '#' },
          { get title() { return tr("Checkout Complete"); }, path: '#' },
        ],
      },
    ],
  },
  {
    get subheader() { return tr("Travel"); },
    items: [
      {
        get title() { return tr("Level 1"); },
        path: '#',
        icon: <Iconify icon="carbon:play" />,
        children: [
          { get title() { return tr("Level 2.1"); }, path: '#' },
          { get title() { return tr("Level 2.2"); }, path: '#' },
          {
            get title() { return tr("Level 2.3"); },
            path: '#',
            children: [
              { get title() { return tr("Level 3.1"); }, path: '#' },
              { get title() { return tr("Level 3.2"); }, path: '#' },
            ],
          },
        ],
      },
    ],
  },
];
