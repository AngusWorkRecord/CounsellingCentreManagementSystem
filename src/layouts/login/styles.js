import { styled } from '@mui/material/styles';

// Styled components
export const StyledRoot = styled('main')(() => ({
  height: '100vh', // Ensure full viewport height
  display: 'flex',
  alignItems: 'center', // Center vertically
  justifyContent: 'center', // Center horizontally
  position: 'relative',
}));

export const StyledContent = styled('div')(({ theme }) => ({
  width: '100%', // Make sure it stretches full width
  maxWidth: 480, // Ensure content doesn't exceed 480px
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(2),
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(8, 4), // Adjust padding for larger screens if needed
  },
}));
