import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import { Box, Card, CardHeader } from '@mui/material';
import Chart, { useChart } from '../../../../components/chart';
import ChartEmptyState from './ChartEmptyState';
import { groupCount } from '../utils';

SessionModeDistributionChart.propTypes = {
  onSelect: PropTypes.func.isRequired,
  sessions: PropTypes.array.isRequired,
};

export default function SessionModeDistributionChart({ onSelect, sessions }) {
  const theme = useTheme();
  const data = groupCount(sessions, 'session_mode');
  const options = useChart({
    chart: {
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const selected = data[config.dataPointIndex];
          if (selected) {
            onSelect({
              title: `${selected.label}个案概览`,
              sessions: sessions.filter((session) => session.session_mode === selected.label),
            });
          }
        },
      },
    },
    labels: data.map((item) => item.label),
    colors: [theme.palette.primary.main, theme.palette.info.main, theme.palette.success.main],
    legend: { position: 'right', horizontalAlign: 'center' },
    dataLabels: { enabled: true, formatter: (value) => `${Math.round(value)}%` },
    tooltip: { y: { formatter: (value) => `${value} 宗` } },
    plotOptions: { pie: { donut: { size: '56%' } } },
  });

  return (
    <Card sx={{ height: 1 }}>
      <CardHeader title="A. 值班类别分布" />
      <Box sx={{ px: 2, pb: 2, '& .apexcharts-series': { cursor: 'pointer' } }} dir="ltr">
        {data.length ? (
          <Chart type="donut" series={data.map((item) => item.value)} options={options} height={300} />
        ) : (
          <ChartEmptyState />
        )}
      </Box>
    </Card>
  );
}

