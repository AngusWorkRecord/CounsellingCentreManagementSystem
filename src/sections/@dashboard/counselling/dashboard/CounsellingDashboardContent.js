import PropTypes from 'prop-types';
import { Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { formatCurrency, formatDuration } from '../utils';
import CaseCategoryDistributionChart from './CaseCategoryDistributionChart';
import CounsellingAiInsights from './CounsellingAiInsights';
import CounsellingMetricCard from './CounsellingMetricCard';
import CounsellorWorkloadChart from './CounsellorWorkloadChart';
import DailyCollectionChart from './DailyCollectionChart';
import SessionDurationChart from './SessionDurationChart';
import SessionModeDistributionChart from './SessionModeDistributionChart';

export default function CounsellingDashboardContent({ metrics, sessions }) {
  const theme = useTheme();
  const metricCards = [
    { title: '总个案数', value: metrics.totalCases, icon: 'solar:folder-with-files-bold-duotone', color: theme.palette.primary.main },
    { title: '总辅导时长', value: formatDuration(metrics.totalMinutes), icon: 'solar:clock-circle-bold-duotone', color: theme.palette.info.main },
    { title: '平均辅导时长', value: formatDuration(metrics.averageMinutes), icon: 'solar:stopwatch-bold-duotone', color: theme.palette.secondary.main },
    { title: '收到款项', value: formatCurrency(metrics.totalCollection), icon: 'solar:wallet-money-bold-duotone', color: theme.palette.primary.main },
  ];

  return (
    <Grid container spacing={3}>
      {metricCards.map((metric) => (
        <Grid item xs={12} sm={6} lg={3} key={metric.title}>
          <CounsellingMetricCard {...metric} />
        </Grid>
      ))}

      <Grid item xs={12} md={6} xl={3}><SessionModeDistributionChart sessions={sessions} /></Grid>
      <Grid item xs={12} md={6} xl={3}><CaseCategoryDistributionChart sessions={sessions} /></Grid>
      <Grid item xs={12} md={6} xl={3}><CounsellorWorkloadChart sessions={sessions} /></Grid>
      <Grid item xs={12} md={6} xl={3}><SessionDurationChart sessions={sessions} /></Grid>
      <Grid item xs={12} lg={4}><DailyCollectionChart sessions={sessions} /></Grid>
      <Grid item xs={12} lg={8}><CounsellingAiInsights /></Grid>
    </Grid>
  );
}

CounsellingDashboardContent.propTypes = {
  metrics: PropTypes.shape({
    averageMinutes: PropTypes.number.isRequired,
    totalCases: PropTypes.number.isRequired,
    totalCollection: PropTypes.number.isRequired,
    totalMinutes: PropTypes.number.isRequired,
  }).isRequired,
  sessions: PropTypes.array.isRequired,
};
