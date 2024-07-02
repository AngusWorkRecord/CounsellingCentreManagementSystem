import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
// @mui
import { Card, CardHeader, Typography, Stack, LinearProgress, Container } from '@mui/material';
// utils
import { PATH_DASHBOARD } from '../../../../routes/paths';
import { fPercent, fCurrency } from '../../../../utils/formatNumber';


// ----------------------------------------------------------------------

EcommerceSalesOverview.propTypes = {
  id: PropTypes.string,
  data: PropTypes.array,
  title: PropTypes.string,
  subheader: PropTypes.string,
};

export default function EcommerceSalesOverview({ id, title, subheader, data, ...other }) {

  

  return (
    <Container maxWidth={false}>
      <Card {...other}>
        <CardHeader title={title} subheader={subheader} />

        <Stack spacing={4} sx={{ p: 3, }}>
          {data.map((progress) => (
            <ProgressItem key={progress.label} progress={progress} />
          ))}
        </Stack>
      </Card>
    </Container>
  );
}

// ----------------------------------------------------------------------

ProgressItem.propTypes = {
  progress: PropTypes.shape({
    id: PropTypes.string,
    amount: PropTypes.number,
    label: PropTypes.string,
    date: PropTypes.string,
    location: PropTypes.string,
    capacity: PropTypes.string,
    value: PropTypes.number,
  }),
};

function ProgressItem({ progress }) {

  const navigate = useNavigate();

  const handleViewRow = (iddetail) => {
    navigate(PATH_DASHBOARD.general.view(iddetail));
  };

  return (
    <Stack spacing={2}>
      <Stack  onClick={() => handleViewRow(progress.id)} direction="row" alignItems="center" justifyContent="space-between">
        <Stack>
          <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
            {progress.label}
          </Typography>
          <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
            {progress.date}
          </Typography>
          <Typography variant="caption" sx={{ flexGrow: 1 }}>
            {progress.location}
          </Typography>
          <Typography variant="caption" sx={{ flexGrow: 1 }}>
            {progress.capacity}
          </Typography>
        </Stack>
        <Typography variant="subtitle2">{fCurrency(progress.amount)}</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          &nbsp;({fPercent(progress.value)})
        </Typography>
      </Stack>

      <LinearProgress
        variant="determinate"
        value={progress.value}
        color={
          (progress.label === 'Total Income' && 'info') ||
          (progress.label === 'Total Expenses' && 'warning') ||
          'primary'
        }
      />
    </Stack>
  );
}
