import { useState } from 'react';
import { useLocation } from 'react-router-dom';
// @mui
import { alpha, useTheme } from '@mui/material/styles';
import { Box, Divider, Drawer, Stack, Typography, Tooltip, IconButton } from '@mui/material';
import { tr, useUiLanguage } from '../../../locales/translate';
// utils
import { bgBlur } from '../../../utils/cssStyles';
// config
import { NAV } from '../../../config-global';
//
import Iconify from '../../iconify';
import Scrollbar from '../../scrollbar';
//
import { defaultSettings } from '../config-setting';
import { useSettingsContext } from '../SettingsContext';
import Block from './Block';
import BadgeDot from './BadgeDot';
import ToggleButton from './ToggleButton';
import ModeOptions from './ModeOptions';
import LayoutOptions from './LayoutOptions';
import StretchOptions from './StretchOptions';
import ContrastOptions from './ContrastOptions';
import DirectionOptions from './DirectionOptions';
import FullScreenOptions from './FullScreenOptions';
import ColorPresetsOptions from './ColorPresetsOptions';

// ----------------------------------------------------------------------

const SPACING = 2.5;

export default function SettingsDrawer() {
  useUiLanguage();
  const { pathname } = useLocation();
  const standaloneTable = /^\/love-design\/?$/i.test(pathname);
  const {
    themeMode,
    themeLayout,
    themeStretch,
    themeContrast,
    themeDirection,
    themeColorPresets,
    onResetSetting,
  } = useSettingsContext();

  const theme = useTheme();

  const [open, setOpen] = useState(false);

  const handleToggle = () => {
    setOpen(!open);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const notDefault =
    themeMode !== defaultSettings.themeMode ||
    themeLayout !== defaultSettings.themeLayout ||
    themeStretch !== defaultSettings.themeStretch ||
    themeContrast !== defaultSettings.themeContrast ||
    themeDirection !== defaultSettings.themeDirection ||
    themeColorPresets !== defaultSettings.themeColorPresets;

  return (
    <>
      {!open && <ToggleButton open={open} notDefault={notDefault} onToggle={handleToggle} />}

      <Drawer
        anchor="right"
        open={open}
        onClose={handleClose}
        BackdropProps={{ invisible: true }}
        PaperProps={{
          sx: {
            ...bgBlur({ color: theme.palette.background.default, opacity: 0.9 }),
            width: NAV.W_BASE,
            boxShadow: `-24px 12px 40px 0 ${alpha(
              theme.palette.mode === 'light' ? theme.palette.grey[500] : theme.palette.common.black,
              0.16
            )}`,
          },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ py: 2, pr: 1, pl: SPACING }}
        >
          <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>{tr("Settings")}</Typography>

          <Tooltip title={tr("Reset")}>
            <Box sx={{ position: 'relative' }}>
              {notDefault && <BadgeDot />}
              <IconButton onClick={onResetSetting}>
                <Iconify icon="ic:round-refresh" />
              </IconButton>
            </Box>
          </Tooltip>

          <IconButton onClick={handleClose}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Scrollbar sx={{ p: SPACING, pb: 0 }}>
          <Block title={tr("Mode")}>
            <ModeOptions />
          </Block>

          <Block title={tr("Contrast")}>
            <ContrastOptions />
          </Block>

          <Block title={tr("Direction")}>
            <DirectionOptions />
          </Block>

          {!standaloneTable && (
            <Block title={tr("Layout")}>
              <LayoutOptions />
            </Block>
          )}

          <Block title={tr("Stretch")} tooltip={tr("Only available at large resolutions > 1600px (xl)")}>
            <StretchOptions />
          </Block>

          <Block title={tr("Presets")}>
            <ColorPresetsOptions />
          </Block>
        </Scrollbar>

        <Box sx={{ p: SPACING, pt: 0 }}>
          <FullScreenOptions />
        </Box>
      </Drawer>
    </>
  );
}
