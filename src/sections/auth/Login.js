import { Link as RouterLink } from 'react-router-dom';
// @mui
import { Stack, Typography, Link } from '@mui/material';
import { AccountCircle } from '@mui/icons-material'; 
// auth
import { useAuthContext } from '../../auth/useAuthContext';
// routes
import { PATH_AUTH } from '../../routes/paths';
// layouts
import LoginLayout from '../../layouts/login';
// components
import AuthLoginForm from './AuthLoginForm';

export default function Login() {
  const { method } = useAuthContext();

  return (
    <LoginLayout padding={4}  paddingTop={12}>
      <Stack spacing={2} sx={{ mb: 5, position: 'relative', textAlign: 'center' }}>
        {/* Optional title */}
        <Typography variant="h4" sx={{ color: 'grey.800' }}>
          Sign in to CounsellingCentreManagementSystem

        </Typography>

        <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'center' }}>
          <Typography variant="body2" sx={{ color: 'grey.800' }}>New user?</Typography>
          <Link component={RouterLink} to={PATH_AUTH.register} variant="subtitle2" sx={{ color: 'grey.800', fontWeight: 'bold' }}>
            Create an account
          </Link>
        </Stack>
      </Stack>

      {/* Anonymous icon inside the form */}
      <AccountCircle
        sx={{
          fontSize: 80,
          color: 'grey.800',
          position: 'absolute',
          top: 10, // Adjust this to position the icon correctly inside the form
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />

      <AuthLoginForm />
    </LoginLayout>
  );
}
