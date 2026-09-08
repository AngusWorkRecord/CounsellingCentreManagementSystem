import PropTypes from 'prop-types';
import orderBy from 'lodash/orderBy';
import { Helmet } from 'react-helmet-async';
// @mui
import { Container, Typography, Stack, Link, Box, Divider } from '@mui/material';
import { tr, useUiLanguage } from '../../locales/translate';
// sections
import { ComponentHero, ComponentCard } from '../../sections/_examples';
import { foundation, mui, extra } from '../../sections/_examples/config-navigation';

// ----------------------------------------------------------------------

export default function ComponentsOverviewPage() {
  useUiLanguage();
  return (
    <>
      <Helmet>
        <title> {tr("Components Overview | Counselling Centre Management System")}</title>
      </Helmet>

      <ComponentHero />

      <Container sx={{ pt: 10, pb: 15 }}>
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Typography variant="h5">{tr("Foundation")}</Typography>

            <Typography variant="body2" sx={{ color: 'text.secondary' }}>{tr("Colors, Typography, Shadows…")}</Typography>
          </Stack>

          <Grid>
            {foundation.map((item) => (
              <ComponentCard key={item.name} item={item} />
            ))}
          </Grid>
        </Stack>

        <Divider sx={{ borderStyle: 'dashed', my: 8 }} />

        <Stack spacing={3}>
          <Stack spacing={1}>
            <Typography variant="h5">MUI</Typography>

            <Typography variant="body2" sx={{ color: 'text.secondary' }}>{tr("Components from")}{' '}
              <Link href="https://mui.com/components/" target="_blank" rel="noopener">
                MUI
              </Link>
              .
            </Typography>

            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              <i>{tr("Some advanced components from MUI X will not be included. So you need to purchase a separate")}<Link
                  href="https://mui.com/pricing/"
                  target="_blank"
                  rel="noopener"
                  sx={{ ml: 0.5 }}
                >{tr("license")}</Link>
                .
              </i>
            </Typography>
          </Stack>

          <Grid>
            {orderBy(mui, ['name'], ['asc']).map((item) => (
              <ComponentCard key={item.name} item={item} />
            ))}
          </Grid>
        </Stack>

        <Divider sx={{ borderStyle: 'dashed', my: 8 }} />

        <Stack spacing={3}>
          <Stack spacing={1}>
            <Typography variant="h5">{tr("Extra Components")}</Typography>

            <Typography variant="body2" sx={{ color: 'text.secondary' }}>{tr("Some custom components / use 3rd party dependencies (chart, map, editor…).")}</Typography>
          </Stack>

          <Grid>
            {extra.map((item) => (
              <ComponentCard key={item.name} item={item} />
            ))}
          </Grid>
        </Stack>
      </Container>
    </>
  );
}

// ----------------------------------------------------------------------

Grid.propTypes = {
  children: PropTypes.node,
};

function Grid({ children }) {
  useUiLanguage();
  return (
    <Box
      display="grid"
      gridTemplateColumns={{
        xs: 'repeat(2, 1fr)',
        sm: 'repeat(3, 1fr)',
        md: 'repeat(4, 1fr)',
        lg: 'repeat(6, 1fr)',
      }}
      gap={2.5}
    >
      {children}
    </Box>
  );
}
