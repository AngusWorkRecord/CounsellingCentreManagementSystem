import { Helmet } from 'react-helmet-async';
import { Container } from '@mui/material';
import { tr, useUiLanguage } from '../../locales/translate';
import {
  CounsellingDashboardContent,
  CounsellingDashboardFeedback,
  CounsellingDashboardHeader,
  useCounsellingDashboard,
} from '../../sections/@dashboard/counselling';

export default function CounsellingDashboardPage() {
  useUiLanguage();
  const dashboard = useCounsellingDashboard();

  return (
    <>
      {/* 中文原文：辅导个案管理 | Dashboard */}
      <Helmet><title>{tr("Counselling Case Management | Dashboard")}</title></Helmet>
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
            dateRange={dashboard.dateRange}
            metrics={dashboard.metrics}
            sessions={dashboard.filteredSessions}
          />
        )}
      </Container>
    </>
  );
}
