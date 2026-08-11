import PropTypes from 'prop-types';
import { Box, Card, CardHeader } from '@mui/material';
import Chart, { useChart } from '../../../components/chart';
import ChartEmptyState from './ChartEmptyState';
import { groupCount } from './utils';

CaseCategoryDistributionChart.propTypes = { sessions: PropTypes.array.isRequired };

export default function CaseCategoryDistributionChart({ sessions }) {
  const data = groupCount(sessions, 'case_category');
  const options = useChart({
    xaxis: { categories: data.map((item) => item.label), labels: { rotate: -35 } },
    yaxis: { min: 0, forceNiceScale: true, labels: { formatter: (value) => Math.round(value) } },
    dataLabels: { enabled: true, formatter: (value) => Math.round(value) },
    legend: { show: false },
    tooltip: { y: { formatter: (value) => `${value} 宗` } },
    plotOptions: { bar: { columnWidth: '45%' } },
  });

  return (
    <Card sx={{ height: 1 }}>
      <CardHeader title="B. 个案类别分布" />
      <Box sx={{ px: 2, pb: 2 }} dir="ltr">
        {data.length ? (
          <Chart type="bar" series={[{ name: '个案数', data: data.map((item) => item.value) }]} options={options} height={300} />
        ) : (
          <ChartEmptyState />
        )}
      </Box>
    </Card>
  );
}

