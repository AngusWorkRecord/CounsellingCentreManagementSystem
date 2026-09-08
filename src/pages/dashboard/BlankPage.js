import { Helmet } from 'react-helmet-async';
// @mui
import { Container, Typography } from '@mui/material';
import { tr, useUiLanguage } from '../../locales/translate';
// components
import { useSettingsContext } from '../../components/settings';

// ----------------------------------------------------------------------
export default function BlankPage() {
  useUiLanguage();
  const { themeStretch } = useSettingsContext();

  return (
    <>
      <Helmet>
        <title> {tr("Blank Page | Counselling Centre Management System")}</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Typography variant="h6"> {tr("Blank")} </Typography>
      </Container>
    </>
  );
}
