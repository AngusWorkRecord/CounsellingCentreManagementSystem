import { Helmet } from 'react-helmet-async';
// @mui
import { Divider } from '@mui/material';
import { tr, useUiLanguage } from '../locales/translate';
// sections
import { AboutHero, AboutWhat, AboutTeam, AboutVision, AboutTestimonials } from '../sections/about';

// ----------------------------------------------------------------------

export default function AboutPage() {
  useUiLanguage();
  return (
    <>
      <Helmet>
        <title> {tr("About us | Counselling Centre Management System")}</title>
      </Helmet>

      <AboutHero />

      <AboutWhat />

      <AboutVision />

      <Divider orientation="vertical" sx={{ my: 10, mx: 'auto', width: 2, height: 40 }} />

      <AboutTeam />

      <AboutTestimonials />
    </>
  );
}
