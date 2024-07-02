import PropTypes from 'prop-types';
// @mui
import { alpha } from '@mui/material/styles';
import { Card, CardHeader, Typography, Stack, LinearProgress, Box } from '@mui/material';
// utils
import { fShortenNumber } from '../../../../utils/formatNumber';

// ----------------------------------------------------------------------

BookingBookedRoom.propTypes = {
  data: PropTypes.array,
  title: PropTypes.string,
  subheader: PropTypes.string,
};

export default function BookingBookedRoom({ title, subheader, data, ...other }) {
  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Stack spacing={3} sx={{ px: 3, my: 1, pt: 2 }}>
        {data.map((progress) => (
          <Stack key={progress.status}>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
              {progress.status}
            </Typography>
            {console.log(progress.value)}
            <LinearProgress
              variant="determinate"
              key={progress.status}
              value={progress.value}
              color={
                (progress.value <= 50 && 'error') ||
                (progress.value >= 51 && progress.value <= 80  && 'warning') ||
                'success'
              }
              sx={{ height: 8, bgcolor: (theme) => alpha(theme.palette.grey[500], 0.16) }}
            />
          </Stack>
        ))}
      </Stack>

      <Stack direction="row" justifyContent="space-between" sx={{ px: 3, pb: 2, pt: 2 }}>
        {data.map((progress) => (
          <Stack key={progress.status} alignItems="center">
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: 0.5,
                  bgcolor: 'success.main',
                  ...(progress.value <= 50 && { bgcolor: 'error.main' }),
                  ...(progress.value >= 51 && progress.value <= 80  && { bgcolor: 'warning.main' }),
                }}
              />

              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                {progress.status}
              </Typography>
            </Stack>

            <Typography variant="h6">{fShortenNumber(progress.quantity)}</Typography>
          </Stack>
        ))}
      </Stack>
    </Card>
  );
}
