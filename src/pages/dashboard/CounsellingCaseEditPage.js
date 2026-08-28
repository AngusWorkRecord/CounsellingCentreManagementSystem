import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, CircularProgress, Container, Stack, Typography } from '@mui/material';
import { PATH_DASHBOARD } from '../../routes/paths';
import { getCounsellingSessionById } from '../../services/counsellingSessionService';
import CaseCreateForm from '../../sections/@dashboard/counselling/cases/create/CaseCreateForm';

export default function CounsellingCaseEditPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const validId = /^[1-9]\d*$/.test(id);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSession() {
      setLoading(true);
      setError('');
      setSession(null);

      if (!validId) {
        setLoading(false);
        return;
      }

      try {
        setSession(await getCounsellingSessionById(id, { signal: controller.signal }));
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          // 中文原文：无法读取个案资料
          setError(requestError.message || 'Unable to retrieve case data');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadSession();
    return () => controller.abort();
  }, [id, reloadKey, validId]);

  const goBack = () => navigate(PATH_DASHBOARD.general.counsellingCases);

  return (
    <>
      {/* 中文原文：编辑个案 | 辅导中心 */}
      <Helmet><title>Edit Case | Counselling Centre</title></Helmet>
      <Container maxWidth="lg">
        {/* 中文原文：编辑个案 */}
        <Typography variant="h3" sx={{ mb: 3 }}>Edit Case</Typography>

        {loading && (
          <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 420 }}>
            <CircularProgress />
            {/* 中文原文：正在读取个案资料… */}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Loading case data…</Typography>
          </Stack>
        )}

        {!loading && !validId && (
          <Alert severity="warning" action={<Button color="inherit" onClick={goBack}>Back to List</Button>}>
            {/* 中文原文：返回列表；无效的个案 ID。 */}Invalid case ID.
          </Alert>
        )}

        {!loading && validId && error && (
          <Alert
            severity="error"
            action={<Button color="inherit" onClick={() => setReloadKey((value) => value + 1)}>Reload</Button>}
          >
            {error}
          </Alert>
        )}

        {!loading && validId && !error && session && <CaseCreateForm currentSession={session} />}
      </Container>
    </>
  );
}
