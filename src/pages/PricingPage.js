import { Helmet } from 'react-helmet-async';
// @mui
import { Box, Switch, Container, Typography, Stack } from '@mui/material';
import { tr, useUiLanguage } from '../locales/translate';
// _mock_
import { _pricingPlans } from '../_mock/arrays';
// sections
import { PricingPlanCard } from '../sections/pricing';

// ----------------------------------------------------------------------

export default function PricingPage() {
  useUiLanguage();
  return (
    <>
      <Helmet>
        <title> {tr("Pricing | Counselling Centre Management System")}</title>
      </Helmet>

      <Container
        sx={{
          pt: 15,
          pb: 10,
          minHeight: 1,
        }}
      >
        <Typography variant="h3" align="center" paragraph>{tr("Flexible plans for your")}<br />{tr("community's size and needs")}</Typography>

        <Typography align="center" sx={{ color: 'text.secondary' }}>{tr("Choose your plan and make modern online conversation magic")}</Typography>

        <Box sx={{ my: 5 }}>
          <Stack direction="row" alignItems="center" justifyContent="flex-end">
            <Typography variant="overline" sx={{ mr: 1.5 }}>{tr("MONTHLY")}</Typography>

            <Switch />
            <Typography variant="overline" sx={{ ml: 1.5 }}>{tr("YEARLY (save 10%)")}</Typography>
          </Stack>

          <Typography
            variant="caption"
            align="right"
            sx={{ color: 'text.secondary', display: 'block' }}
          >{tr("* Plus applicable taxes")}</Typography>
        </Box>

        <Box gap={3} display="grid" gridTemplateColumns={{ md: 'repeat(3, 1fr)' }}>
          {_pricingPlans.map((card, index) => (
            <PricingPlanCard key={card.subscription} card={card} index={index} />
          ))}
        </Box>
      </Container>
    </>
  );
}
