import { Helmet } from 'react-helmet-async';
import { Container, Typography } from '@mui/material';
import CaseCreateForm from '../../sections/@dashboard/counselling/cases/create/CaseCreateForm';

export default function CounsellingCaseCreatePage() {
  return (
    <>
      <Helmet><title>新增个案 | 辅导中心</title></Helmet>
      <Container maxWidth="lg">
        <Typography variant="h3" sx={{ mb: 3 }}>新增个案</Typography>
        <CaseCreateForm />
      </Container>
    </>
  );
}
