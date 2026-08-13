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
  const dailyTotals = new Map();
  sessions.forEach((session) => {
    const date = getSessionDateKey(session.counselling_date);
    if (date) dailyTotals.set(date, (dailyTotals.get(date) || 0) + toNumber(session.amount_received_rm));
  });
  const data = Array.from(dailyTotals, ([date, value]) => ({ date, value })).sort((a, b) =>
    a.date.localeCompare(b.date)
  );
  const options = useChart({
    chart: {
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const selected = data[config.dataPointIndex];
          if (selected) {
            onSelect({
              title: `${selected.date} 收款个案`,
              sessions: sessions.filter(
                (session) => getSessionDateKey(session.counselling_date) === selected.date
              ),
            });
          }
        },
      },
    },
    xaxis: { categories: data.map((item) => item.date.slice(5)) },
    yaxis: { min: 0, labels: { formatter: (value) => formatCurrency(value) } },
    colors: ['#10A7B5'],
    dataLabels: { enabled: true, formatter: (value) => formatCurrency(value) },
    legend: { position: 'bottom', horizontalAlign: 'center' },
    tooltip: { y: { formatter: (value) => formatCurrency(value) } },
    stroke: { curve: 'straight', width: 3 },
    markers: { size: 5 },
  });

  return (
    <Card sx={{ height: 1 }}>
      <CardHeader title="F. 每日收到款项" subheader="（RM）" />
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

