import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';
// @mui
import { alpha } from '@mui/material/styles';
import { Box, Stack, Button, Typography, IconButton, InputAdornment } from '@mui/material';
import { tr, useUiLanguage } from '../locales/translate';
// hooks
import useCountdown from '../hooks/useCountdown';
// _mock
import { _socials } from '../_mock/arrays';
// components
import Iconify from '../components/iconify';
import { CustomTextField } from '../components/custom-input';
// assets
import { ComingSoonIllustration } from '../assets/illustrations';

// ----------------------------------------------------------------------

export default function ComingSoonPage() {
  useUiLanguage();
  const { days, hours, minutes, seconds } = useCountdown(new Date('07/07/2024 21:30'));

  return (
    <>
      <Helmet>
        <title> {tr("Coming Soon | Counselling Centre Management System")}</title>
      </Helmet>

      <Typography variant="h3" paragraph>{tr("Coming Soon!")}</Typography>

      <Typography sx={{ color: 'text.secondary' }}>{tr("We are currently working hard on this page!")}</Typography>

      <ComingSoonIllustration sx={{ my: 10, height: 240 }} />

      <Stack
        direction="row"
        justifyContent="center"
        divider={<Box sx={{ mx: { xs: 1, sm: 2.5 } }}>:</Box>}
        sx={{ typography: 'h2' }}
      >
        <TimeBlock label={tr("Days")} value={days} />

        <TimeBlock label={tr("Hours")} value={hours} />

        <TimeBlock label={tr("Minutes")} value={minutes} />

        <TimeBlock label={tr("Seconds")} value={seconds} />
      </Stack>

      <CustomTextField
        fullWidth
        placeholder={tr("Enter your email")}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Button variant="contained" size="large">{tr("Notify Me")}</Button>
            </InputAdornment>
          ),
          sx: { pr: 0.5 },
        }}
        sx={{ my: 5 }}
      />

      <Stack spacing={1} alignItems="center" justifyContent="center" direction="row">
        {_socials.map((social) => (
          <IconButton
            key={social.name}
            sx={{
              color: social.color,
              '&:hover': {
                bgcolor: alpha(social.color, 0.08),
              },
            }}
          >
            <Iconify icon={social.icon} />
          </IconButton>
        ))}
      </Stack>
    </>
  );
}

// ----------------------------------------------------------------------

TimeBlock.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
};

function TimeBlock({ label, value }) {
  useUiLanguage();
  return (
    <div>
      <Box> {value} </Box>
      <Box sx={{ color: 'text.secondary', typography: 'body1' }}>{label}</Box>
    </div>
  );
}
