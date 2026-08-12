import { Helmet } from 'react-helmet-async';
import { Container } from '@mui/material';
import {
  CounsellingDashboardContent,
  CounsellingDashboardFeedback,
  CounsellingDashboardHeader,
  useCounsellingDashboard,
} from '../../sections/@dashboard/counselling';

export default function CounsellingDashboardPage() {
  const dashboard = useCounsellingDashboard();

  return (
    <>
      <Helmet><title>辅导个案管理 | Dashboard</title></Helmet>
      <Container maxWidth={false}>
        <CounsellingDashboardHeader
          filteredCount={dashboard.filteredCount}
          periodFilter={dashboard.periodFilter}
          periodLabel={dashboard.periodLabel}
        />
        <CounsellingDashboardFeedback
          error={dashboard.error}
          loading={dashboard.loading}
          onReload={dashboard.reload}
        />
        {!dashboard.loading && !dashboard.error && (
          <CounsellingDashboardContent
            metrics={dashboard.metrics}
            sessions={dashboard.filteredSessions}
          />
        )}
      </Container>
    </>
  );
}
