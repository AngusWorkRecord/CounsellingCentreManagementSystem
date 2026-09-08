import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';
// @mui
import { Box, Container, Grid, Typography, Stack, Paper } from '@mui/material';
import { tr, useUiLanguage } from '../../../locales/translate';
// routes
import { PATH_PAGE } from '../../../routes/paths';
// components
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';
import { useTypography } from '../../../components/text-max-line';

// ----------------------------------------------------------------------

const TYPOGRAPHYS = [
  { get label() { return tr("h1. Heading"); }, variant: 'h1' },
  { get label() { return tr("h2. Heading"); }, variant: 'h2' },
  { get label() { return tr("h3. Heading"); }, variant: 'h3' },
  { get label() { return tr("h4. Heading"); }, variant: 'h4' },
  { get label() { return tr("h5. Heading"); }, variant: 'h5' },
  { get label() { return tr("h6. Heading"); }, variant: 'h6' },
  {
    get label() { return tr("subtitle1. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur"); },
    variant: 'subtitle1',
  },
  {
    get label() { return tr("subtitle2. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur"); },
    variant: 'subtitle2',
  },
  {
    get label() { return tr("body1. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur unde suscipit, quam beatae rerum inventore consectetur, neque doloribus, cupiditate numquam dignissimos laborum fugiat deleniti? Eum quasi quidem quibusdam."); },
    variant: 'body1',
  },
  {
    get label() { return tr("body2. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur unde suscipit, quam beatae rerum inventore consectetur, neque doloribus, cupiditate numquam dignissimos laborum fugiat deleniti? Eum quasi quidem quibusdam."); },
    variant: 'body2',
  },
  { get label() { return tr("caption text"); }, variant: 'caption' },
  { get label() { return tr("overline text"); }, variant: 'overline' },
  { get label() { return tr("Button"); }, variant: 'button' },
];

// ----------------------------------------------------------------------

export default function FoundationTypographyPage() {
  useUiLanguage();
  return (
    <>
      <Helmet>
        <title> {tr("Foundations: Typography | Counselling Centre Management System")}</title>
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
            heading={tr("Typography")}
            links={[
              {
                name: tr("Components"),
                href: PATH_PAGE.components,
              },
              { name: tr("Typography") },
            ]}
            moreLink={['https://mui.com/components/typography']}
          />
        </Container>
      </Box>

      <Container sx={{ my: 10 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Typography variant="h6" paragraph>{tr("Default Text")}</Typography>
          </Grid>

          <Grid item xs={12} md={9}>
            <Stack spacing={3}>
              {TYPOGRAPHYS.map((font) => (
                <BlockVariant key={font.variant} font={font} />
              ))}
            </Stack>
          </Grid>
        </Grid>

        <Box sx={{ height: 40 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Typography variant="h6" paragraph>{tr("Colors Text")}</Typography>
          </Grid>

          <Grid item xs={12} md={9}>
            <Stack spacing={3}>
              {['primary', 'secondary', 'disabled'].map((color) => (
                <Paper key={color} variant="outlined" sx={{ p: 3, borderRadius: 1 }}>
                  <Typography gutterBottom variant="subtitle1" sx={{ color: `text.${color}` }}>{tr("text")}{tr(color)}
                  </Typography>

                  <Typography gutterBottom variant="body2" sx={{ color: `text.${color}` }}>{tr("Cras ultricies mi eu turpis hendrerit fringilla. Fusce vel dui. Pellentesque auctor neque nec urna. Sed cursus turpis vitae tortor. Curabitur suscipit suscipit tellus.")}</Typography>
                </Paper>
              ))}

              {['primary', 'secondary', 'info', 'warning', 'error'].map((color) => (
                <Paper key={color} variant="outlined" sx={{ p: 3, borderRadius: 1 }}>
                  <Typography gutterBottom variant="subtitle1" sx={{ color: `${color}.main` }}>
                    {tr(color)}
                  </Typography>

                  <Typography gutterBottom variant="body2" sx={{ color: `${color}.main` }}>{tr("Cras ultricies mi eu turpis hendrerit fringilla. Fusce vel dui. Pellentesque auctor neque nec urna. Sed cursus turpis vitae tortor. Curabitur suscipit suscipit tellus.")}</Typography>
                </Paper>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

// ----------------------------------------------------------------------

BlockVariant.propTypes = {
  font: PropTypes.shape({
    label: PropTypes.string,
    variant: PropTypes.string,
  }),
};

function BlockVariant({ font }) {
  useUiLanguage();
  const { variant, label } = font;

  const { fontSize, lineHeight, fontWeight, letterSpacing = 0 } = useTypography(variant);

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 1 }}>
      <Typography variant={variant} gutterBottom>
        {label}
      </Typography>

      <Typography variant="body2" sx={{ color: 'text.secondary' }}>{tr("size:")}{fontSize} / l-height: {lineHeight} / weight:
        {fontWeight} / letterSpacing: {letterSpacing}
      </Typography>
    </Paper>
  );
}
