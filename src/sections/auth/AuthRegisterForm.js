import { useState } from 'react';
import PropTypes from 'prop-types';
import * as Yup from 'yup';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { Stack, IconButton, InputAdornment, Alert } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// auth
import { useAuthContext } from '../../auth/useAuthContext';
// components
import Iconify from '../../components/iconify';
import FormProvider, { RHFTextField } from '../../components/hook-form';

// ----------------------------------------------------------------------

AuthRegisterForm.propTypes = {
  termsAccepted: PropTypes.bool.isRequired,
};

export default function AuthRegisterForm({ termsAccepted }) {
  const { register } = useAuthContext();

  const [showPassword, setShowPassword] = useState(false);

  const RegisterSchema = Yup.object().shape({
    firstName: Yup.string().required('First name required'),
    lastName: Yup.string().required('Last name required'),
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    password: Yup.string().required('Password is required'),
  });

  const defaultValues = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  };

  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });

  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = methods;

  const onSubmit = async (data) => {
    if (!termsAccepted) {
      setError('terms', { message: 'You must accept the terms and conditions' });
      return;
    }

    try {
      if (register) {
        await register(data.email, data.password, data.firstName, data.lastName);
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
      <Stack spacing={2.5}>
        {!!errors.afterSubmit && <Alert severity="error">{errors.afterSubmit.message}</Alert>}
        {!!errors.terms && <Alert severity="error">{errors.terms.message}</Alert>}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <RHFTextField
            name="firstName"
            label="First name"
            variant="standard"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:person-fill" sx={{ color: 'grey.800' }} />
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
            name="lastName"
            label="Last name"
            variant="standard"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:person-fill" sx={{ color: 'grey.800' }} />
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


        <LoadingButton
          fullWidth
          color="inherit"
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting || isSubmitSuccessful}
          sx={{
            bgcolor: 'text.primary',
            color: (theme) => (theme.palette.mode === 'light' ? 'common.white' : 'grey.800'),
            '&:hover': {
              bgcolor: 'text.primary',
              color: (theme) => (theme.palette.mode === 'light' ? 'common.white' : 'grey.800'),
            },
          }}
        >
          Create account
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}
