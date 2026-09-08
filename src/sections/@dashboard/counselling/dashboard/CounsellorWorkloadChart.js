import PropTypes from 'prop-types';
import { Box, Card, CardHeader } from '@mui/material';
import { tr, useUiLanguage } from '../../../../locales/translate';
import Chart, { useChart } from '../../../../components/chart';
import ChartEmptyState from './ChartEmptyState';
import { groupCount } from '../utils';

CounsellorWorkloadChart.propTypes = {
  onSelect: PropTypes.func.isRequired,
  sessions: PropTypes.array.isRequired,
};

export default function CounsellorWorkloadChart({ onSelect, sessions }) {
  useUiLanguage();
  const data = groupCount(sessions, 'counsellor').sort((a, b) => b.value - a.value);
  const chartHeight = Math.max(300, data.length * 44);
  const options = useChart({
    chart: {
      toolbar: { show: false },
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const selected = data[config.dataPointIndex];
          if (selected) {
            onSelect({
              // 中文原文：负责的个案
              title: () => tr("Cases Assigned to {{p0}}", { p0: selected.label }),
              sessions: sessions.filter((session) => session.counsellor === selected.label),
            });
          }
        },
      },
    },
    xaxis: { categories: data.map((item) => item.label), min: 0, tickAmount: 4 },
    dataLabels: { enabled: true },
    legend: { show: false },
    tooltip: { y: { formatter: (value) => tr("{{p0}} cases", { p0: value }) } },
    plotOptions: { bar: { horizontal: true, barHeight: '45%' } },
  });

  return (
    <Card sx={{ height: 1 }}>
      {/* 中文原文：每位辅导员处理个案数 */}<CardHeader title={tr("C. Cases per Counsellor")} />
      <Box
        sx={{
          px: 2,
          pb: 2,
          maxHeight: 332,
          overflowX: 'hidden',
          overflowY: data.length > 6 ? 'auto' : 'hidden',
          '& .apexcharts-series': { cursor: 'pointer' },
        }}
        dir="ltr"
      >
        {data.length ? (
          <Chart
            type="bar"
            series={[{ name: 'Number of Cases', data: data.map((item) => item.value) }]}
            options={options}
            height={chartHeight}
          />
        ) : (
          <ChartEmptyState />
        )}
      </Box>
    </Card>
  );
}

