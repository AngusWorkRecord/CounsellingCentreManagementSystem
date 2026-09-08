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
import IconButtons from '../../../sections/_examples/mui/button/IconButtons';
import ButtonGroups from '../../../sections/_examples/mui/button/ButtonGroups';
import ToggleButtons from '../../../sections/_examples/mui/button/ToggleButtons';
import ButtonVariants from '../../../sections/_examples/mui/button/ButtonVariants';
import FloatingActionButton from '../../../sections/_examples/mui/button/FloatingActionButton';

// ----------------------------------------------------------------------

const TABS = [
  {
    value: 'contained',
    get label() { return tr("Contained Buttons"); },
    component: <ButtonVariants variant="contained" />,
  },
  {
    value: 'outlined',
    get label() { return tr("Outlined Buttons"); },
    component: <ButtonVariants variant="outlined" />,
  },
  { value: 'text', get label() { return tr("Text Buttons"); }, component: <ButtonVariants /> },
  { value: 'soft', get label() { return tr("Soft Buttons"); }, component: <ButtonVariants variant="soft" /> },
  { value: 'icon', get label() { return tr("Icon Buttons"); }, component: <IconButtons /> },
  { value: 'fab', get label() { return tr("Floating Action Button"); }, component: <FloatingActionButton /> },
  { value: 'groups', get label() { return tr("Button Groups"); }, component: <ButtonGroups /> },
  { value: 'toggle', get label() { return tr("Toggle Buttons"); }, component: <ToggleButtons /> },
];

// ----------------------------------------------------------------------

export default function MUIButtonsPage() {
  useUiLanguage();
  const [currentTab, setCurrentTab] = useState('contained');

  return (
    <>
      <Helmet>
        <title> {tr("MUI Components: Buttons | Counselling Centre Management System")}</title>
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
            heading={tr("Buttons")}
            links={[
              {
                name: tr("Components"),
                href: PATH_PAGE.components,
              },
              { name: tr("Buttons") },
            ]}
            moreLink={[
              'https://mui.com/components/buttons',
              'https://mui.com/components/button-group',
              'https://mui.com/components/floating-action-button',
              'https://mui.com/components/toggle-button',
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
