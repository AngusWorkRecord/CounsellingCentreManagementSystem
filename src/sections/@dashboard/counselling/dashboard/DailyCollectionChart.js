import PropTypes from 'prop-types';
import { Box, Card, CardHeader } from '@mui/material';
import Chart, { useChart } from '../../../../components/chart';
import ChartEmptyState from './ChartEmptyState';
import { formatCurrency, getSessionDateKey, toNumber } from '../utils';

DailyCollectionChart.propTypes = {
  onSelect: PropTypes.func.isRequired,
  sessions: PropTypes.array.isRequired,
};

export default function DailyCollectionChart({ onSelect, sessions }) {
  const datedSessions = sessions
    .map((session) => ({ session, date: getSessionDateKey(session.counselling_date) }))
    .filter((item) => item.date);
  const months = new Set(datedSessions.map((item) => item.date.slice(0, 7)));
  const groupByMonth = months.size > 1;
  const totals = new Map();
  datedSessions.forEach(({ date, session }) => {
    const key = groupByMonth ? date.slice(0, 7) : date;
    totals.set(key, (totals.get(key) || 0) + toNumber(session.amount_received_rm));
  });
  const data = Array.from(totals, ([key, value]) => ({ key, value })).sort((a, b) =>
    a.key.localeCompare(b.key)
  );
  const showDataLabels = data.length <= 12;
  const options = useChart({
    chart: {
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const selected = data[config.dataPointIndex];
          if (selected) {
            onSelect({
              title: `${selected.key} 收款个案`,
              sessions: datedSessions
                .filter((item) => groupByMonth
                  ? item.date.startsWith(selected.key)
                  : item.date === selected.key)
                .map((item) => item.session),
            });
          }
        },
      },
    },
    xaxis: {
      categories: data.map((item) => groupByMonth ? item.key : item.key.slice(5)),
      labels: {
        rotate: data.length > 12 ? -35 : 0,
        hideOverlappingLabels: true,
      },
    },
    yaxis: { min: 0, labels: { formatter: (value) => formatCurrency(value) } },
    colors: ['#10A7B5'],
    dataLabels: { enabled: showDataLabels, formatter: (value) => formatCurrency(value) },
    legend: { position: 'bottom', horizontalAlign: 'center' },
    tooltip: { y: { formatter: (value) => formatCurrency(value) } },
    stroke: { curve: 'straight', width: 3 },
    markers: { size: data.length > 12 ? 3 : 5 },
  });

  return (
    <Card sx={{ height: 1 }}>
      <CardHeader
        title={`F. ${groupByMonth ? '每月' : '每日'}收到款项`}
        subheader="（RM）"
      />
      <Box
        sx={{
          px: 2,
          pb: 2,
          '& .apexcharts-series, & .apexcharts-marker': { cursor: 'pointer' },
        }}
        dir="ltr"
      >
        {data.length ? (
          <Chart type="line" series={[{ name: '金额（RM）', data: data.map((item) => item.value) }]} options={options} height={330} />
        ) : (
          <ChartEmptyState height={330} />
        )}
      </Box>
    </Card>
  );
}

