import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';
// @mui
import { alpha } from '@mui/material/styles';
import { Box, Container, Stack, Paper, CardHeader, Tooltip } from '@mui/material';
import { tr, useUiLanguage } from '../../../locales/translate';
// routes
import { PATH_PAGE } from '../../../routes/paths';
// components
import Label from '../../../components/label';
import Iconify from '../../../components/iconify';
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';

// ----------------------------------------------------------------------

const COLORS = ['default', 'primary', 'secondary', 'info', 'success', 'warning', 'error'];

// ----------------------------------------------------------------------

export default function DemoLabelPage() {
  useUiLanguage();
  return (
    <>
      <Helmet>
        <title> {tr("Extra Components: Label | Counselling Centre Management System")}</title>
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
            heading={tr("Label")}
            links={[
              {
                name: tr("Components"),
                href: PATH_PAGE.components,
              },
              { name: tr("Label") },
            ]}
          />
        </Container>
      </Box>

      <Container sx={{ my: 10 }}>
        <Stack spacing={3}>
          <Block title={tr("Filled")}>
            {COLORS.map((color) => (
              <Tooltip key={color} title={color}>
                <Label color={color} variant="filled">
                  {tr(color)}
                </Label>
              </Tooltip>
            ))}
          </Block>

          <Block title={tr("Outlined")}>
            {COLORS.map((color) => (
              <Label key={color} color={color} variant="outlined">
                {tr(color)}
              </Label>
            ))}
          </Block>

          <Block title={tr("Soft")}>
            {COLORS.map((color) => (
              <Label key={color} color={color} variant="soft">
                {tr(color)}
              </Label>
            ))}
          </Block>

          <Block title={tr("With Icon")}>
            <Label variant="filled" color="primary" startIcon={<Iconify icon="eva:email-fill" />}>{tr("Start Icon")}</Label>

            <Label variant="filled" color="primary" endIcon={<Iconify icon="eva:email-fill" />}>{tr("End Icon")}</Label>

            <Label variant="outlined" color="primary" startIcon={<Iconify icon="eva:email-fill" />}>{tr("Start Icon")}</Label>

            <Label variant="outlined" color="primary" endIcon={<Iconify icon="eva:email-fill" />}>{tr("End Icon")}</Label>

            <Label color="primary" startIcon={<Iconify icon="eva:email-fill" />}>{tr("Start Icon")}</Label>

            <Label color="primary" endIcon={<Iconify icon="eva:email-fill" />}>{tr("End Icon")}</Label>
          </Block>
        </Stack>
      </Container>
    </>
  );
}

// ----------------------------------------------------------------------

Block.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
};

export function Block({ title, children }) {
  useUiLanguage();
  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 1.5,
        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
      }}
    >
      {title && <CardHeader title={title} />}
      <Box
        sx={{
          p: 5,
          minHeight: 180,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          '& > *': { mx: 1 },
        }}
      >
        {children}
      </Box>
    </Paper>
  );
}
