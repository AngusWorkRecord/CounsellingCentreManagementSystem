import { Helmet } from 'react-helmet-async';
// @mui
import { Box, Container, Typography, Badge } from '@mui/material';
import { Masonry } from '@mui/lab';
import { tr, useUiLanguage } from '../../../locales/translate';
// routes
import { PATH_PAGE } from '../../../routes/paths';
// components
import Iconify from '../../../components/iconify';
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';
// sections
import { Block } from '../../../sections/_examples/Block';

// ----------------------------------------------------------------------

export default function MUIBadgePage() {
  useUiLanguage();
  return (
    <>
      <Helmet>
        <title> {tr("MUI Components: Badge | Counselling Centre Management System")}</title>
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
            heading={tr("Badge")}
            links={[
              {
                name: tr("Components"),
                href: PATH_PAGE.components,
              },
              { name: tr("Badge") },
            ]}
            moreLink={['https://mui.com/components/badges']}
          />
        </Container>
      </Box>

      <Container sx={{ my: 10 }}>
        <Masonry columns={{ xs: 1, md: 2 }} spacing={3}>
          <Block
            title={tr("Basic")}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '& > *': { mx: 1 },
            }}
          >
            <Badge badgeContent={4}>
              <Iconify icon="eva:email-fill" width={24} />
            </Badge>

            <Badge badgeContent={4} color="primary">
              <Iconify icon="eva:email-fill" width={24} />
            </Badge>

            <Badge badgeContent={4} color="secondary">
              <Iconify icon="eva:email-fill" width={24} />
            </Badge>

            <Badge badgeContent={4} color="info">
              <Iconify icon="eva:email-fill" width={24} />
            </Badge>

            <Badge badgeContent={4} color="success">
              <Iconify icon="eva:email-fill" width={24} />
            </Badge>

            <Badge badgeContent={4} color="warning">
              <Iconify icon="eva:email-fill" width={24} />
            </Badge>

            <Badge badgeContent={4} color="error">
              <Iconify icon="eva:email-fill" width={24} />
            </Badge>
          </Block>

          <Block
            title={tr("Maximum value")}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '& > *': { mx: 1 },
            }}
          >
            <Badge
              badgeContent={99}
              color="error"
              children={<Iconify icon="eva:email-fill" width={24} />}
            />
            <Badge
              badgeContent={100}
              color="error"
              children={<Iconify icon="eva:email-fill" width={24} />}
            />
            <Badge
              badgeContent={1000}
              max={999}
              color="error"
              children={<Iconify icon="eva:email-fill" width={24} />}
            />
          </Block>

          <Block
            title={tr("Dot badge")}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '& > *': { mx: 1 },
            }}
          >
            <Badge color="info" variant="dot">
              <Iconify icon="eva:email-fill" width={24} />
            </Badge>

            <Badge color="info" variant="dot">
              <Typography>{tr("Typography")}</Typography>
            </Badge>
          </Block>

          <Block
            title={tr("Badge overlap")}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '& > *': { mx: 1 },
            }}
          >
            <Badge color="info" badgeContent=" ">
              <Box sx={{ width: 40, height: 40, bgcolor: 'warning.main' }} />
            </Badge>

            <Badge color="info" badgeContent=" " variant="dot">
              <Box sx={{ width: 40, height: 40, bgcolor: 'warning.main' }} />
            </Badge>

            <Badge color="info" overlap="circular" badgeContent=" ">
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: 'warning.main',
                }}
              />
            </Badge>

            <Badge color="info" overlap="circular" badgeContent=" " variant="dot">
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: 'warning.main',
                }}
              />
            </Badge>
          </Block>
        </Masonry>
      </Container>
    </>
  );
}
