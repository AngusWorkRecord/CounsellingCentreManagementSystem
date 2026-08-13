import PropTypes from 'prop-types';
import { Box, Card, CardHeader } from '@mui/material';
import Chart, { useChart } from '../../../../components/chart';
import ChartEmptyState from './ChartEmptyState';
import { groupCount } from '../utils';

CounsellorWorkloadChart.propTypes = {
  onSelect: PropTypes.func.isRequired,
  sessions: PropTypes.array.isRequired,
};

export default function CounsellorWorkloadChart({ onSelect, sessions }) {
  const data = groupCount(sessions, 'counsellor').sort((a, b) => b.value - a.value);
  const options = useChart({
    chart: {
      toolbar: { show: false },
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const selected = data[config.dataPointIndex];
          if (selected) {
            onSelect({
              title: `${selected.label}负责的个案`,
              sessions: sessions.filter((session) => session.counsellor === selected.label),
            });
          }
        },
      },
    },
    xaxis: { categories: data.map((item) => item.label), min: 0, tickAmount: 4 },
    dataLabels: { enabled: true },
    legend: { show: false },
    tooltip: { y: { formatter: (value) => `${value} 宗` } },
    plotOptions: { bar: { horizontal: true, barHeight: '45%' } },
  });

  return (
    <Card sx={{ height: 1 }}>
      <CardHeader title="C. 每位辅导员处理个案数" />
      <Box sx={{ px: 2, pb: 2, '& .apexcharts-series': { cursor: 'pointer' } }} dir="ltr">
        {data.length ? (
          <Chart type="bar" series={[{ name: '个案数', data: data.map((item) => item.value) }]} options={options} height={300} />
        ) : (
          <ChartEmptyState />
        )}
      </Box>
    </Card>
  );
}

