import PropTypes from 'prop-types';
import { Card, Stack } from '@mui/material';
import CaseFilters from './CaseFilters';
import CaseSummary from './CaseSummary';
import CaseTable from './CaseTable';
import PendingFollowUp from './PendingFollowUp';

export default function CaseListContent({ caseFilter, cases, onEditCase, onViewCase, pendingCases, summary }) {
  return (
    <>
      <Card sx={{ p: { xs: 1.5, md: 2.5 }, mb: 3 }}>
        <CaseFilters {...caseFilter} />
        <CaseSummary {...summary} />
      </Card>
      <Stack spacing={3}>
        <CaseTable cases={cases} onEdit={onEditCase} onView={onViewCase} />
        <PendingFollowUp cases={pendingCases} />
      </Stack>
    </>
  );
}

CaseListContent.propTypes = {
  caseFilter: PropTypes.object.isRequired,
  cases: PropTypes.array.isRequired,
  onEditCase: PropTypes.func.isRequired,
  onViewCase: PropTypes.func.isRequired,
  pendingCases: PropTypes.array.isRequired,
  summary: PropTypes.object.isRequired,
};
