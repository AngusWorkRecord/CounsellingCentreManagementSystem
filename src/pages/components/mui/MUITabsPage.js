import { useState } from 'react';

import { Helmet } from 'react-helmet-async';
// @mui
import { Box, Tab, Tabs, Container, Stack } from '@mui/material';
import { Masonry } from '@mui/lab';
import { tr, useUiLanguage } from '../../../locales/translate';
// routes
import { PATH_PAGE } from '../../../routes/paths';
// components
import Iconify from '../../../components/iconify';
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';
// sections
import { Block } from '../../../sections/_examples/Block';

// ----------------------------------------------------------------------

const style = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexWrap: 'wrap',
  '& > *': { mx: '8px !important' },
};

const TABS = [
  {
    value: 'one',
    icon: <Iconify icon="eva:phone-call-fill" width={24} />,
    get label() { return tr("Item One"); },
  },
  {
    value: 'two',
    icon: <Iconify icon="eva:heart-fill" width={24} />,
    get label() { return tr("Item Two"); },
  },
  {
    value: 'three',
    icon: <Iconify icon="eva:headphones-fill" width={24} />,
    get label() { return tr("Item Three"); },
    disabled: true,
  },
  {
    value: 'four',
    icon: <Iconify icon="eva:headphones-fill" width={24} />,
    get label() { return tr("Item Four"); },
  },
  {
    value: 'five',
    icon: <Iconify icon="eva:headphones-fill" width={24} />,
    get label() { return tr("Item Five"); },
    disabled: true,
  },
  {
    value: 'six',
    icon: <Iconify icon="eva:headphones-fill" width={24} />,
    get label() { return tr("Item Six"); },
  },
  {
    value: 'seven',
    icon: <Iconify icon="eva:headphones-fill" width={24} />,
    get label() { return tr("Item Seven"); },
  },
];

// ----------------------------------------------------------------------

export default function MUITabsPage() {
  useUiLanguage();
  const [currentTab, setCurrentTab] = useState('one');

  const [scrollable, setScrollable] = useState('one');

  return (
    <>
      <Helmet>
        <title> {tr("MUI Components: Tabs | Counselling Centre Management System")}</title>
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
            heading={tr("Tabs")}
            links={[
              {
                name: tr("Components"),
                href: PATH_PAGE.components,
              },
              { name: tr("Tabs") },
            ]}
            moreLink={['https://mui.com/components/tabs']}
          />
        </Container>
      </Box>

      <Container sx={{ my: 10 }}>
        <Masonry columns={{ xs: 1, md: 2 }} spacing={3}>
          <Block title={tr("Text")} sx={style}>
            <Stack spacing={2} sx={{ width: 1 }}>
              <Tabs value={currentTab} onChange={(event, newValue) => setCurrentTab(newValue)}>
                {TABS.slice(0, 3).map((tab) => (
                  <Tab key={tab.value} value={tab.value} label={tab.label} />
                ))}
              </Tabs>

              {TABS.slice(0, 3).map(
                (tab) =>
                  tab.value === currentTab && (
                    <Box
                      key={tab.value}
                      sx={{ p: 2, borderRadius: 1, bgcolor: 'background.neutral' }}
                    >
                      {tab.label}
                    </Box>
                  )
              )}
            </Stack>
          </Block>

          <Block title={tr("Icon")} sx={style}>
            <Tabs value={currentTab} onChange={(event, newValue) => setCurrentTab(newValue)}>
              {TABS.slice(0, 3).map((tab) => (
                <Tab key={tab.value} icon={tab.icon} value={tab.value} />
              ))}
            </Tabs>
          </Block>

          <Block title={tr("Top")} sx={style}>
            <Tabs value={currentTab} onChange={(event, newValue) => setCurrentTab(newValue)}>
              {TABS.slice(0, 3).map((tab) => (
                <Tab
                  iconPosition="top"
                  key={tab.value}
                  icon={tab.icon}
                  label={tab.label}
                  value={tab.value}
                  disabled={tab.disabled}
                />
              ))}
            </Tabs>
          </Block>

          <Block title={tr("Bottom")} sx={style}>
            <Tabs value={currentTab} onChange={(event, newValue) => setCurrentTab(newValue)}>
              {TABS.slice(0, 3).map((tab) => (
                <Tab
                  iconPosition="bottom"
                  key={tab.value}
                  icon={tab.icon}
                  label={tab.label}
                  value={tab.value}
                  disabled={tab.disabled}
                />
              ))}
            </Tabs>
          </Block>

          <Block title={tr("Start")} sx={style}>
            <Tabs value={currentTab} onChange={(event, newValue) => setCurrentTab(newValue)}>
              {TABS.slice(0, 3).map((tab) => (
                <Tab
                  key={tab.value}
                  icon={tab.icon}
                  label={tab.label}
                  value={tab.value}
                  disabled={tab.disabled}
                />
              ))}
            </Tabs>
          </Block>

          <Block title={tr("End")} sx={style}>
            <Tabs value={currentTab} onChange={(event, newValue) => setCurrentTab(newValue)}>
              {TABS.slice(0, 3).map((tab) => (
                <Tab
                  iconPosition="end"
                  key={tab.value}
                  icon={tab.icon}
                  label={tab.label}
                  value={tab.value}
                  disabled={tab.disabled}
                />
              ))}
            </Tabs>
          </Block>

          <Block title={tr("Scrollable")} sx={style}>
            <Box
              sx={{
                flexGrow: 1,
                width: '100%',
                maxWidth: 320,
              }}
            >
              <Tabs value={scrollable} onChange={(event, newValue) => setScrollable(newValue)}>
                {TABS.map((tab) => (
                  <Tab key={tab.value} label={tab.label} value={tab.value} />
                ))}
              </Tabs>
            </Box>
          </Block>
        </Masonry>
      </Container>
    </>
  );
}
