import PropTypes from 'prop-types';
// @mui
import { Stack } from '@mui/material';
// styles
import { StyledRoot, StyledContent } from './styles';

// ----------------------------------------------------------------------

LoginLayout.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
  padding: PropTypes.number, // Add padding prop
  paddingTop: PropTypes.number, // Add paddingTop prop
};

export default function LoginLayout({ children, title, padding = 4, paddingTop = 12 }) {
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
