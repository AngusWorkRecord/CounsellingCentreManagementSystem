import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Container } from '@mui/material';
import { PATH_DASHBOARD } from '../../routes/paths';
import {
  CaseListContent,
  CaseListFeedback,
  CaseListHeader,
  useCounsellingCaseList,
} from '../../sections/@dashboard/counselling/cases';

export default function CounsellingCaseListPage() {
  const navigate = useNavigate();
  const caseList = useCounsellingCaseList();

  return (
    <>
      <Helmet><title>个案列表 | 辅导中心</title></Helmet>
      <Container maxWidth={false}>
        <CaseListHeader
          filteredCount={caseList.filteredCount}
          onCreateCase={() => navigate(PATH_DASHBOARD.general.counsellingCaseCreate)}
          periodFilter={caseList.periodFilter}
          periodLabel={caseList.periodLabel}
        />
        <CaseListFeedback
          error={caseList.error}
          loading={caseList.loading}
          onReload={caseList.reload}
        />
        {!caseList.loading && !caseList.error && (
          <CaseListContent
            caseFilter={caseList.caseFilter}
            cases={caseList.cases}
            pendingCases={caseList.pendingCases}
            summary={caseList.summary}
            onViewCase={(id) =>
              navigate(PATH_DASHBOARD.general.counsellingCaseDetail(id))
            }
          />
        )}
      </Container>
    </>
  );
}
