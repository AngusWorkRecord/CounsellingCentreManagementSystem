import { useState } from 'react';

import { Helmet } from 'react-helmet-async';
// @mui
import { Box, Container, Tab, Tabs } from '@mui/material';
import { tr, useUiLanguage } from '../../../locales/translate';
// routes
import { PATH_PAGE } from '../../../routes/paths';
// components
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';
// sections
import Textfields from '../../../sections/_examples/mui/Textfields';

// ----------------------------------------------------------------------

const TABS = [
  { value: 'outlined', get label() { return tr("Outlined"); }, component: <Textfields variant="outlined" /> },
  { value: 'filled', get label() { return tr("Filled"); }, component: <Textfields variant="filled" /> },
  { value: 'standard', get label() { return tr("Standard"); }, component: <Textfields variant="standard" /> },
];

// ----------------------------------------------------------------------

export default function MUITextFieldPage() {
  useUiLanguage();
  const [currentTab, setCurrentTab] = useState('outlined');

  return (
    <>
      <Helmet>
        <title> {tr("MUI Components: Textfield | Counselling Centre Management System")}</title>
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
            heading={tr("Textfield")}
            links={[
              {
                name: tr("Components"),
                href: PATH_PAGE.components,
              },
              { name: tr("Textfield") },
            ]}
            moreLink={['https://mui.com/components/text-fields']}
          />
        </Container>
      </Box>

      <Container sx={{ my: 10 }}>
        <Tabs value={currentTab} onChange={(event, newValue) => setCurrentTab(newValue)}>
          {TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </Tabs>

        <form noValidate autoComplete="off">
          {TABS.map(
            (tab) =>
              tab.value === currentTab && (
                <Box key={tab.value} sx={{ mt: 5 }}>
                  {tab.component}
                </Box>
              )
          )}
        </form>
      </Container>
    </>
  );
}
