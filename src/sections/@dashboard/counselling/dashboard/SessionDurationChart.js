import PropTypes from 'prop-types';
import { Box, Card, CardHeader } from '@mui/material';
import Chart, { useChart } from '../../../../components/chart';
import ChartEmptyState from './ChartEmptyState';
import { toNumber } from '../utils';

SessionDurationChart.propTypes = {
  onSelect: PropTypes.func.isRequired,
  sessions: PropTypes.array.isRequired,
};

function buildLabels(sessions) {
  const totals = sessions.reduce((counts, session) => {
    const initials = session.client_initials || '未知';
    counts[initials] = (counts[initials] || 0) + 1;
    return counts;
  }, {});

  return sessions.map((session) => {
    const initials = session.client_initials || '未知';
    if (totals[initials] === 1) return initials;
    const suffix = String(session.case_number || session.id || '').split('/').pop();
    return `${initials}-${suffix || '个案'}`;
  });
}

export default function SessionDurationChart({ onSelect, sessions }) {
  const options = useChart({
    chart: {
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const session = sessions[config.dataPointIndex];
          if (session) {
            onSelect({
              title: `${session.client_initials || '个案'}辅导概览`,
              sessions: [session],
            });
          }
        },
      },
    },
    xaxis: { categories: buildLabels(sessions) },
    yaxis: { min: 0, title: { text: '分钟' } },
    colors: ['#10A7B5'],
    dataLabels: { enabled: true },
    legend: { show: false },
    tooltip: { y: { formatter: (value) => `${value} 分钟` } },
    plotOptions: { bar: { columnWidth: '45%' } },
  });

  return (
    <Card sx={{ height: 1 }}>
      <CardHeader title="D. 个案辅导时长（分钟）" />
      <Box sx={{ px: 2, pb: 2, '& .apexcharts-series': { cursor: 'pointer' } }} dir="ltr">
        {sessions.length ? (
          <Chart
            type="bar"
            series={[{ name: '时长', data: sessions.map((session) => toNumber(session.duration_minutes)) }]}
            options={options}
            height={300}
          />
        ) : (
          <ChartEmptyState />
        )}
      </Box>
    </Card>
  );
}

