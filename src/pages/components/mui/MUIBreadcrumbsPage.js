import { Helmet } from 'react-helmet-async';
// @mui
import { Box, Link, Stack, Button, Container, Typography, Breadcrumbs } from '@mui/material';
import { tr, useUiLanguage } from '../../../locales/translate';
// routes
import { PATH_PAGE } from '../../../routes/paths';
// components
import Iconify from '../../../components/iconify';
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';
// sections
import { Block } from '../../../sections/_examples/Block';

// ----------------------------------------------------------------------

export default function MUIBreadcrumbsPage() {
  useUiLanguage();
  return (
    <>
      <Helmet>
        <title> {tr("MUI Components: Breadcrumbs | Counselling Centre Management System")}</title>
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
            heading={tr("Breadcrumbs")}
            links={[
              {
                name: tr("Components"),
                href: PATH_PAGE.components,
              },
              { name: tr("Breadcrumbs") },
            ]}
            moreLink={['https://mui.com/components/custom-breadcrumbs']}
          />
        </Container>
      </Box>

      <Container sx={{ my: 10 }}>
        <Stack spacing={3}>
          <Block
            title={tr("Text")}
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Breadcrumbs>
              <Link color="inherit" href="#">
                Material-UI
              </Link>
              <Link color="inherit" href="#">{tr("Core")}</Link>
              <Typography sx={{ color: 'text.primary' }}>{tr("Breadcrumb")}</Typography>
            </Breadcrumbs>
          </Block>

          <Block
            title={tr("With Icon")}
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Breadcrumbs>
              <Link color="inherit" href="#" sx={{ display: 'flex', alignItems: 'center' }}>
                <Iconify icon="eva:home-fill" sx={{ mr: 0.5 }} />
                Material-UI
              </Link>
              <Link color="inherit" href="#" sx={{ display: 'flex', alignItems: 'center' }}>
                <Iconify icon="eva:camera-fill" sx={{ mr: 0.5 }} />{tr("Core")}</Link>
              <Typography
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'text.primary',
                }}
              >
                <Iconify icon="eva:bell-fill" sx={{ mr: 0.5 }} />{tr("Breadcrumb")}</Typography>
            </Breadcrumbs>
          </Block>

          <Block title={tr("Customized")}>
            <CustomBreadcrumbs
              links={[
                {
                  name: tr("Home"),
                  href: '#',
                  icon: <Iconify icon="eva:home-fill" />,
                },
                { name: tr("Link1"), href: '#', icon: <Iconify icon="eva:cube-outline" /> },
                { name: tr("Link2"), href: '#', icon: <Iconify icon="eva:cube-outline" /> },
                { name: tr("Link3"), href: '#', icon: <Iconify icon="eva:cube-outline" /> },
                { name: tr("Link4"), href: '#', icon: <Iconify icon="eva:cube-outline" /> },
                { name: tr("Link5"), href: '#', icon: <Iconify icon="eva:cube-outline" /> },
              ]}
            />

            <CustomBreadcrumbs
              heading={tr("Heading")}
              links={[
                {
                  name: tr("Home"),
                  href: '#',
                  icon: <Iconify icon="eva:home-fill" />,
                },
                { name: tr("Link1"), href: '#', icon: <Iconify icon="eva:cube-outline" /> },
                { name: tr("Link2"), href: '#', icon: <Iconify icon="eva:cube-outline" /> },
                { name: tr("Link3"), href: '#', icon: <Iconify icon="eva:cube-outline" /> },
                { name: tr("Link4"), href: '#', icon: <Iconify icon="eva:cube-outline" /> },
                { name: tr("Link5"), icon: <Iconify icon="eva:cube-outline" /> },
              ]}
              action={
                <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />}>{tr("New Product")}</Button>
              }
            />
          </Block>
        </Stack>
      </Container>
    </>
  );
}
