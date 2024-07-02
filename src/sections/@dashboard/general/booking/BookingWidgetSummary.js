import PropTypes from 'prop-types';
// @mui
import { Card, Typography, Box } from '@mui/material';
// utils
import { fShortenNumber } from '../../../../utils/formatNumber';

// ----------------------------------------------------------------------

BookingWidgetSummary.propTypes = {
  icon: PropTypes.node,
  sx: PropTypes.object,
  title: PropTypes.string,
  desc: PropTypes.string,
  total: PropTypes.number,
};

export default function BookingWidgetSummary({ title, total, desc, icon, sx, ...other }) {
  return (
    <Card
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 2,
        pl: 2,
        ...sx,
      }}
      {...other}
    >
      <div>
        <Typography variant="h3">{fShortenNumber(total)}</Typography>

        <Typography variant="h5">{title}</Typography>

        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
          {desc}
        </Typography>
      </div>

      <Box
        sx={{
          width: 80,
          height: 80,
          lineHeight: 0,
          borderRadius: '50%',
          bgcolor: 'background.neutral',
          justifyContent: "center",
        }}
      >
        <div style={{justifyContent:"center"}}>
          {icon}
        </div>
      </Box>
    </Card>
  );
}
