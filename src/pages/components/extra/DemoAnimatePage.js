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
import {
  Inview,
  OtherView,
  ScrollView,
  DialogView,
  BackgroundView,
} from '../../../sections/_examples/extra/animate';

// ----------------------------------------------------------------------

const TABS = [
  { value: 'inview', get label() { return tr("In View"); }, component: <Inview /> },
  { value: 'scroll', get label() { return tr("Scroll"); }, component: <ScrollView /> },
  { value: 'dialog', get label() { return tr("Dialog"); }, component: <DialogView /> },
  { value: 'background', get label() { return tr("Background"); }, component: <BackgroundView /> },
  { value: 'other', get label() { return tr("Other"); }, component: <OtherView /> },
];

// ----------------------------------------------------------------------

export default function DemoAnimatePage() {
  useUiLanguage();
  const [currentTab, setCurrentTab] = useState('inview');

  return (
    <>
      <Helmet>
        <title> {tr("Extra Components: Animate | Counselling Centre Management System")}</title>
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
            heading={tr("Animate")}
            links={[
              {
                name: tr("Components"),
                href: PATH_PAGE.components,
              },
              { name: tr("Animate") },
            ]}
            moreLink={['https://www.framer.com/api/motion']}
          />
        </Container>
      </Box>

      <Container sx={{ my: 10 }}>
        <Tabs value={currentTab} onChange={(event, newValue) => setCurrentTab(newValue)}>
          {TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </Tabs>

        {TABS.map(
          (tab) =>
            tab.value === currentTab && (
              <Box key={tab.value} sx={{ mt: 5 }}>
                {tab.component}
              </Box>
            )
        )}
      </Container>
    </>
  );
}
