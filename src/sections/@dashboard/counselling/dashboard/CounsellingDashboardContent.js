import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { formatCurrency, formatDuration } from '../utils';
import { PATH_DASHBOARD } from '../../../../routes/paths';
import CaseCategoryDistributionChart from './CaseCategoryDistributionChart';
import CounsellingAiInsights from './CounsellingAiInsights';
import CounsellingCasesDialog from './CounsellingCasesDialog';
import CounsellingMetricCard from './CounsellingMetricCard';
import CounsellorWorkloadChart from './CounsellorWorkloadChart';
import DailyCollectionChart from './DailyCollectionChart';
import SessionDurationChart from './SessionDurationChart';
import SessionModeDistributionChart from './SessionModeDistributionChart';

export default function CounsellingDashboardContent({ metrics, sessions }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const [selection, setSelection] = useState({ title: '', sessions: [] });

  useEffect(() => {
    setSelection({ title: '', sessions: [] });
  }, [sessions]);

  const handleSelect = (nextSelection) => {
    if (nextSelection.sessions.length) setSelection(nextSelection);
  };

  const handleClose = () => setSelection({ title: '', sessions: [] });
  const metricCards = [
    { title: '总个案数', value: metrics.totalCases, icon: 'solar:folder-with-files-bold-duotone', color: theme.palette.primary.main },
    { title: '总辅导时长', value: formatDuration(metrics.totalMinutes), icon: 'solar:clock-circle-bold-duotone', color: theme.palette.info.main },
    { title: '平均辅导时长', value: formatDuration(metrics.averageMinutes), icon: 'solar:stopwatch-bold-duotone', color: theme.palette.secondary.main },
    { title: '收到款项', value: formatCurrency(metrics.totalCollection), icon: 'solar:wallet-money-bold-duotone', color: theme.palette.primary.main },
  ];

  return (
    <>
      <Grid container spacing={3}>
        {metricCards.map((metric) => (
          <Grid item xs={12} sm={6} lg={3} key={metric.title}>
            <CounsellingMetricCard {...metric} />
          </Grid>
        ))}

        <Grid item xs={12} md={6} lg={4}>
          <SessionModeDistributionChart sessions={sessions} onSelect={handleSelect} />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <CaseCategoryDistributionChart sessions={sessions} onSelect={handleSelect} />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <CounsellorWorkloadChart sessions={sessions} onSelect={handleSelect} />
        </Grid>
        <Grid item xs={12}>
          <SessionDurationChart sessions={sessions} onSelect={handleSelect} />
        </Grid>
        <Grid item xs={12}>
          <DailyCollectionChart sessions={sessions} onSelect={handleSelect} />
        </Grid>
        <Grid item xs={12}><CounsellingAiInsights /></Grid>
      </Grid>

      <CounsellingCasesDialog
        open={Boolean(selection.sessions.length)}
        title={selection.title}
        sessions={selection.sessions}
        onClose={handleClose}
        onView={(id) => navigate(PATH_DASHBOARD.general.counsellingCaseDetail(id))}
      />
    </>
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
