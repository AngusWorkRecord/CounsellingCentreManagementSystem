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
  const sortedSessions = [...sessions].sort(
    (a, b) => toNumber(b.duration_minutes) - toNumber(a.duration_minutes)
  );
  const showDataLabels = sortedSessions.length <= 12;
  const chartMinWidth = sortedSessions.length > 12 ? sortedSessions.length * 58 : '100%';
  const options = useChart({
    chart: {
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const session = sortedSessions[config.dataPointIndex];
          if (session) {
            onSelect({
              title: `${session.client_initials || '个案'}辅导概览`,
              sessions: [session],
            });
          }
        },
      },
    },
    xaxis: {
      categories: buildLabels(sortedSessions),
      labels: {
        rotate: -35,
        rotateAlways: sortedSessions.length > 12,
        hideOverlappingLabels: false,
        trim: false,
      },
    },
    yaxis: { min: 0, title: { text: '分钟' } },
    colors: ['#10A7B5'],
    dataLabels: { enabled: showDataLabels },
    grid: { padding: { bottom: 12 } },
    legend: { show: false },
    tooltip: { y: { formatter: (value) => `${value} 分钟` } },
    plotOptions: { bar: { columnWidth: '45%' } },
  });

  return (
    <Card sx={{ height: 1 }}>
      <CardHeader title="D. 个案辅导时长（分钟）" />
      <Box
        sx={{
          px: 2,
          pb: 2,
          maxWidth: 1,
          overflowX: 'auto',
          '& .apexcharts-series': { cursor: 'pointer' },
        }}
        dir="ltr"
      >
        {sortedSessions.length ? (
          <Box sx={{ minWidth: chartMinWidth }}>
            <Chart
              type="bar"
              series={[{ name: '时长', data: sortedSessions.map((session) => toNumber(session.duration_minutes)) }]}
              options={options}
              height={340}
            />
          </Box>
        ) : (
          <ChartEmptyState />
        )}
      </Box>
    </Card>
  );
}

