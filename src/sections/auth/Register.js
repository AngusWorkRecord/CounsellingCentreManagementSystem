import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { Stack, Typography, Link, Checkbox, FormControlLabel } from '@mui/material';
// layouts
import LoginLayout from '../../layouts/login';
// routes
import { PATH_AUTH } from '../../routes/paths';
// components
import AuthWithSocial from './AuthWithSocial';
import AuthRegisterForm from './AuthRegisterForm';

// ----------------------------------------------------------------------

export default function Register() {
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleCheckboxChange = (event) => {
    setTermsAccepted(event.target.checked);
  };

  return (
    <LoginLayout padding={2} paddingTop={3}> {/* Customize paddingTop for the register page */}
      <Stack
        spacing={2}
        sx={{
          mb: 5,
          position: 'relative',
          maxHeight: '100vh',
          overflow: 'auto',
          justifyContent: 'center', // Center the content vertically
          alignItems: 'center', // Center the content horizontally
          textAlign: 'center', // Center text alignment
        }}
      >
        <Typography variant="h4">Get started absolutely free.</Typography>

        <Stack direction="row" spacing={0.5} justifyContent="center">
          <Typography variant="body2">Already have an account?</Typography>

          <Link 
            component={RouterLink} 
            to={PATH_AUTH.login} 
            variant="subtitle2" 
            sx={{ color: 'grey.800', fontWeight: 'bold' }} 
          >
            Sign in
          </Link>
        </Stack>
      </Stack>

      <AuthRegisterForm termsAccepted={termsAccepted} />

      <FormControlLabel
        control={
          <Checkbox 
            checked={termsAccepted} 
            onChange={handleCheckboxChange} 
            sx={{ 
              '& .MuiSvgIcon-root': {
                fontSize: 18, // Adjust size if needed
                color: 'grey.800', // Default color when not checked
              },
              '&.Mui-checked .MuiSvgIcon-root': {
                color: 'grey.800', // Color when checked
              },
              '& .MuiCheckbox-root': {
                // Override hover effect
                '&:hover': {
                  backgroundColor: 'transparent', // No color on hover
                },
                // Remove ripple effect
                '&:focus': {
                  outline: 'none', // Remove outline on focus
                },
              },
            }}
            disableRipple // Remove ripple effect
          />
        }
        label={
          <Typography
            component="div"
            sx={{ color: 'grey.800', typography: 'caption', textAlign: 'center' }}
          >
            {'By signing up, I agree to '}
            <Link underline="always" color="text.primary" fontWeight='bold'>
              Terms of Service
            </Link>
            {' and '}
            <Link underline="always" color="text.primary" fontWeight='bold'>
              Privacy Policy
            </Link>
            .
          </Typography>
        }
        sx={{ 
          mt: 3, 
          typography: 'caption', 
          textAlign: 'center',
          alignItems: 'center', // Center align checkbox and label
          '& .MuiFormControlLabel-label': { 
            display: 'flex', 
            alignItems: 'center' 
          },
          '& .MuiCheckbox-root': {
            marginRight: '8px' // Space between checkbox and label
          }
        }}
      />

      <AuthWithSocial />
    </LoginLayout>
  );
}
