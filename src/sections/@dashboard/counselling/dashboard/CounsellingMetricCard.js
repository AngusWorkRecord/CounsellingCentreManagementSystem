import PropTypes from 'prop-types';
import { alpha, styled } from '@mui/material/styles';
import { Card, Stack, Typography } from '@mui/material';
import Iconify from '../../../../components/iconify';

const IconWrapper = styled('div')(({ theme, color }) => ({
  width: 72,
  height: 72,
  flexShrink: 0,
  display: 'flex',
  borderRadius: '50%',
  alignItems: 'center',
  justifyContent: 'center',
  color,
  backgroundColor: alpha(color, 0.12),
  [theme.breakpoints.down('sm')]: {
    width: 60,
    height: 60,
  },
}));

CounsellingMetricCard.propTypes = {
  color: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default function CounsellingMetricCard({ title, value, icon, color }) {
  return (
    <Card sx={{ p: 3, height: 1 }}>
      <Stack direction="row" spacing={2.5} alignItems="center">
        <IconWrapper color={color}>
          <Iconify icon={icon} width={38} />
        </IconWrapper>

        <Stack spacing={0.5} sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h4" sx={{ color, whiteSpace: 'nowrap' }}>
            {value}
          </Typography>
        </Stack>
      </Stack>
    </Card>
  );
}

