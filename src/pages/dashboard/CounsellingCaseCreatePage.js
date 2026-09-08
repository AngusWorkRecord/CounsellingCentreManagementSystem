import { Helmet } from 'react-helmet-async';
import { Container, Typography } from '@mui/material';
import { tr, useUiLanguage } from '../../locales/translate';
import CaseCreateForm from '../../sections/@dashboard/counselling/cases/create/CaseCreateForm';

export default function CounsellingCaseCreatePage() {
  useUiLanguage();
  return (
    <>
      {/* 中文原文：新增个案 | 辅导中心 */}
      <Helmet><title>{tr("Create Case | Counselling Centre")}</title></Helmet>
      <Container maxWidth="lg">
        {/* 中文原文：新增个案 */}
        <Typography variant="h3" sx={{ mb: 3 }}>{tr("Create Case")}</Typography>
        <CaseCreateForm />
      </Container>
    </>
  );
}
