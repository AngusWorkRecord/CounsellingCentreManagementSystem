import PropTypes from 'prop-types';
// @mui
import { Box, Stack, Typography } from '@mui/material';
import { tr, useUiLanguage } from '../../locales/translate';
// styles
import { StyledRoot, StyledContent } from './styles';

// ----------------------------------------------------------------------

LoginLayout.propTypes = {
  title: PropTypes.string,
  branded: PropTypes.bool,
  children: PropTypes.node,
  padding: PropTypes.number, // Add padding prop
  paddingTop: PropTypes.number, // Add paddingTop prop
};

export default function LoginLayout({ children, title, padding = 4, paddingTop = 12, branded = false }) {
  useUiLanguage();
  if (branded) {
    return (
      <Box component="main" sx={{ minHeight: '100vh', backgroundColor: '#f5fbf7', backgroundImage: 'url(/assets/background/LoginBackground.png)', backgroundSize: 'cover', backgroundPosition: 'left bottom', color: '#203043', display: 'flex', alignItems: 'center', px: { xs: 2, sm: 4, md: 6 }, pt: { xs: 4, md: 6 }, pb: { xs: 10, md: 12 } }}>
        <Box sx={{ width: 1, maxWidth: 1200, mx: 'auto', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: { xs: 4, md: 8 }, alignItems: 'center' }}>
          <Stack spacing={2} alignItems="center" sx={{ textAlign: 'center', pb: { md: 14 } }}>
            <Box component="img" src="/logo/BodhiCounsellingLogo.png" alt={tr('Bodhi Counselling')} sx={{ width: { xs: 90, md: 140 }, height: 'auto', mb: 1 }} />
            <Typography component="h1" sx={{ fontSize: { xs: 26, md: 34 }, fontWeight: 700, lineHeight: 1.25, maxWidth: 420 }}>{tr('Counselling Centre Management System')}</Typography>
            <Typography sx={{ color: '#687b89', fontSize: 15 }}>{tr('Care · Listen · Support · Grow')}</Typography>
            <Typography sx={{ color: '#687b89', fontSize: 14, lineHeight: 1.8, maxWidth: 380 }}>{tr('A safer, more organised way to manage counselling cases for a healthier community.')}</Typography>
          </Stack>
          <Box sx={{ width: 1, maxWidth: 520, justifySelf: 'center', bgcolor: '#ffffff', borderRadius: 3, boxShadow: '0 8px 40px rgba(32, 60, 47, 0.08)', p: { xs: 3, sm: 4, md: 5 }, minWidth: 0 }}>
            {children}
          </Box>
        </Box>
      </Box>
    );
  }
  return (
    <StyledRoot
      sx={{
        backgroundImage: 'url(https://waifu2x.booru.pics/outfiles/f749a294c2117a1540ac2a13266e126aea82030e_s2_n3_y1.jpg)', // Add background image URL
        backgroundSize: 'cover', // Ensure the image covers the entire background
        backgroundPosition: 'center', // Center the image
        minHeight: '100vh', // Ensure it takes full viewport height
        overflow: 'hidden', // Prevent unnecessary scrolling
      }}
    >
      <StyledContent
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh', // Ensure it takes full viewport height
          overflow: 'hidden', // Prevent unnecessary scrolling
        }}
      >
        <Stack
          sx={{
            width: 1,
            maxWidth: 480,
            padding, // Use shorthand for padding
            paddingTop, // Use shorthand for paddingTop
            backgroundColor: 'white', // Ensures form background color is white
            position: 'relative', // To position elements within the form
          }}
        >
          {children}
        </Stack>
      </StyledContent>
    </StyledRoot>
  );
}
