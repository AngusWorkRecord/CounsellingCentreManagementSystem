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
import PickerDate from '../../../sections/_examples/mui/pickers/PickerDate';
import PickerTime from '../../../sections/_examples/mui/pickers/PickerTime';
import PickerDateTime from '../../../sections/_examples/mui/pickers/PickerDateTime';
import PickerDateRange from '../../../sections/_examples/mui/pickers/PickerDateRange';

// ----------------------------------------------------------------------

const TABS = [
  { value: 'date', get label() { return tr("Date"); }, component: <PickerDate /> },
  { value: 'datetime', get label() { return tr("DateTime"); }, component: <PickerDateTime /> },
  { value: 'time', get label() { return tr("Time"); }, component: <PickerTime /> },
  { value: 'range', get label() { return tr("Range"); }, component: <PickerDateRange /> },
];

// ----------------------------------------------------------------------

export default function MUIPickersPage() {
  useUiLanguage();
  const [currentTab, setCurrentTab] = useState('date');

  return (
    <>
      <Helmet>
        <title> {tr("MUI Components: Pickers | Counselling Centre Management System")}</title>
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
            heading={tr("Date / Time pickers")}
            links={[
              { name: tr("Components"), href: PATH_PAGE.components },
              { name: tr("Date / Time pickers") },
            ]}
            moreLink={[
              'https://mui.com/components/pickers',
              'https://mui.com/x/react-date-pickers/getting-started/',
            ]}
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
