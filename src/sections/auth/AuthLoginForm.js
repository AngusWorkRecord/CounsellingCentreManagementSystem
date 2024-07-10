import { useState } from 'react';
import * as Yup from 'yup';
import { Link as RouterLink } from 'react-router-dom';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { Link, Stack, Alert, IconButton, InputAdornment } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// routes
import { PATH_AUTH } from '../../routes/paths';
// auth
import { useAuthContext } from '../../auth/useAuthContext';
// components
import Iconify from '../../components/iconify';
import FormProvider, { RHFTextField } from '../../components/hook-form';

// ----------------------------------------------------------------------

export default function AuthLoginForm() {
  const { login } = useAuthContext();
  const [showPassword, setShowPassword] = useState(false);

  const LoginSchema = Yup.object().shape({
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    password: Yup.string().required('Password is required'),
  });

  const defaultValues = {
    email: 'admin@gmail.com', // pee0803@unimas.my
    password: 'admin',
  };

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = methods;

  const onSubmit = async (data) => {
    try {
      const resp = await login(data.email, 1, data.password);
      if (!resp) {
        setError('afterSubmit', {
          message: 'Invalid username or password.',
        });
      }
    } catch (error) {
      console.error(error);
      reset();
      setError('afterSubmit', {
        ...error,
        message: error.message,
      });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        {!!errors.afterSubmit && <Alert severity="error">{errors.afterSubmit.message}</Alert>}

        <RHFTextField
          name="email"
          label="Email address"
          variant="standard"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:email-fill" sx={{ color: 'grey.800' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiInputBase-root': {
              borderBottom: '2px solid #333333', // Darker underline color
            },
            '& .MuiInputLabel-root': {
              color: '#333333', // Darker color for the label
            },
            '& .MuiInputLabel-root.MuiInputLabel-shrink': {
              transform: 'translate(0, 1.5px) scale(0.75)', // Adjust label position
            },
            '& .MuiInputBase-input': {
              padding: '12px 0', // Adjust padding as needed
            },
          }}
        />

        <RHFTextField
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          variant="standard"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:lock-fill" sx={{ color: 'grey.800' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} sx={{ color: 'grey.800' }} />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiInputBase-root': {
              borderBottom: '2px solid #333333', // Darker underline color
            },
            '& .MuiInputLabel-root': {
              color: '#333333', // Darker color for the label
            },
            '& .MuiInputLabel-root.MuiInputLabel-shrink': {
              transform: 'translate(0, 1.5px) scale(0.75)', // Adjust label position
            },
            '& .MuiInputBase-input': {
              padding: '12px 0', // Adjust padding as needed
            },
          }}
        />
      </Stack>

      <Stack alignItems="flex-end" sx={{ my: 2 }}>
        <Link
          component={RouterLink}
          to={PATH_AUTH.resetPassword}
          variant="body2"
          color="inherit"
          underline="always"
        >
          Forgot password?
        </Link>
      </Stack>

      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitSuccessful || isSubmitting}
        sx={{
          bgcolor: 'grey.800', // Darker background color
          color: 'common.white', // White text color for contrast
          '&:hover': {
            bgcolor: 'grey.900', // Slightly lighter dark color on hover
          },
        }}
      >
        Login
      </LoadingButton>
    </FormProvider>
  );
}
