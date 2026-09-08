import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import { Box, Card, CardHeader } from '@mui/material';
import { tr, useUiLanguage } from '../../../../locales/translate';
import { domainLabel } from '../../../../locales/domainLabels';
import Chart, { useChart } from '../../../../components/chart';
import ChartEmptyState from './ChartEmptyState';
import { groupCount } from '../utils';

SessionModeDistributionChart.propTypes = {
  onSelect: PropTypes.func.isRequired,
  sessions: PropTypes.array.isRequired,
};

export default function SessionModeDistributionChart({ onSelect, sessions }) {
  useUiLanguage();
  const theme = useTheme();
  const data = groupCount(sessions, 'session_mode');
  const options = useChart({
    chart: {
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const selected = data[config.dataPointIndex];
          if (selected) {
            onSelect({
              // 中文原文：个案概览
              title: () => tr("{{p0}} Case Overview", { p0: domainLabel(selected.label) }),
              sessions: sessions.filter((session) => session.session_mode === selected.label),
            });
          }
        },
      },
    },
    labels: data.map((item) => domainLabel(item.label)),
    colors: [theme.palette.primary.main, theme.palette.info.main, theme.palette.success.main],
    legend: { position: 'right', horizontalAlign: 'center' },
    dataLabels: { enabled: true, formatter: (value) => `${Math.round(value)}%` },
    tooltip: { y: { formatter: (value) => tr("{{p0}} cases", { p0: value }) } },
    plotOptions: { pie: { donut: { size: '56%' } } },
  });

  return (
    <Card sx={{ height: 1 }}>
      {/* 中文原文：值班类别分布 */}<CardHeader title={tr("A. Session Mode Distribution")} />
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

