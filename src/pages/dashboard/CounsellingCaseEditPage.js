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
          setError(requestError.message || '无法读取个案资料');
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
      <Helmet><title>编辑个案 | 辅导中心</title></Helmet>
      <Container maxWidth="lg">
        <Typography variant="h3" sx={{ mb: 3 }}>编辑个案</Typography>

        {loading && (
          <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 420 }}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>正在读取个案资料…</Typography>
          </Stack>
        )}

        {!loading && !validId && (
          <Alert severity="warning" action={<Button color="inherit" onClick={goBack}>返回列表</Button>}>
            无效的个案 ID。
          </Alert>
        )}

        {!loading && validId && error && (
          <Alert
            severity="error"
            action={<Button color="inherit" onClick={() => setReloadKey((value) => value + 1)}>重新加载</Button>}
          >
            {error}
          </Alert>
        )}

        {!loading && validId && !error && session && <CaseCreateForm currentSession={session} />}
      </Container>
    </>
  );
}
