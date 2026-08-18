import PropTypes from 'prop-types';
import { Box, Card, CardHeader } from '@mui/material';
import Chart, { useChart } from '../../../../components/chart';
import ChartEmptyState from './ChartEmptyState';
import { groupCount } from '../utils';

CaseCategoryDistributionChart.propTypes = {
  onSelect: PropTypes.func.isRequired,
  sessions: PropTypes.array.isRequired,
};

export default function CaseCategoryDistributionChart({ onSelect, sessions }) {
  const data = groupCount(sessions, 'case_category').sort((a, b) => b.value - a.value);
  const options = useChart({
    chart: {
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const selected = data[config.dataPointIndex];
          if (selected) {
            onSelect({
              title: `${selected.label}个案概览`,
              sessions: sessions.filter((session) => session.case_category === selected.label),
            });
          }
        },
      },
    },
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

