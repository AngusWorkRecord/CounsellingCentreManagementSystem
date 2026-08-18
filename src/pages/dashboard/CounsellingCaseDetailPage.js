import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import Iconify from '../../components/iconify';
import { PATH_DASHBOARD } from '../../routes/paths';
import { getCounsellingSessionById } from '../../services/counsellingSessionService';
import { CaseDetailContent } from '../../sections/@dashboard/counselling/cases/detail';

export default function CounsellingCaseDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSession() {
      setLoading(true);
      setError('');
      setSession(null);

      if (!/^[1-9]\d*$/.test(id)) {
        setLoading(false);
        return;
      }

      try {
        setSession(await getCounsellingSessionById(id, { signal: controller.signal }));
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setError(requestError.message || '无法读取辅导个案资料');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadSession();
    return () => controller.abort();
  }, [id, reloadKey]);

  const validId = /^[1-9]\d*$/.test(id);
  const goBack = () => navigate(PATH_DASHBOARD.general.counsellingCases);

  return (
    <>
      <Helmet><title>个案详情 | 辅导中心</title></Helmet>
      <Container maxWidth={false}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Box>
          
            <Typography variant="h3" gutterBottom>个案详情</Typography>
            
          </Box>
          <Stack alignItems={{ xs: 'stretch', sm: 'flex-end' }} spacing={1.5}>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button variant="outlined" size="large" startIcon={<Iconify icon="eva:arrow-back-fill" />} onClick={goBack}>
                返回个案列表
              </Button>
              {session?.report_url && (
                <Button
                  component="a"
                  href={session.report_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="contained"
                  size="large"
                  startIcon={<Iconify icon="eva:file-text-outline" />}
                >
                  查看详细报告
                </Button>
              )}
            </Stack>
          </Stack>
        </Stack>

        {loading && (
          <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 420 }}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>正在读取个案资料…</Typography>
          </Stack>
        )}

        {!loading && error && (
          <Alert
            severity="error"
            action={<Button color="inherit" size="small" onClick={() => setReloadKey((value) => value + 1)}>重新加载</Button>}
          >
            {error}
          </Alert>
        )}

        {!loading && !error && (!validId || !session) && (
          <Alert
            severity="warning"
            action={<Button color="inherit" size="small" onClick={goBack}>返回列表</Button>}
          >
            找不到 ID 为“{id || '-'}”的辅导个案。
          </Alert>
        )}

        {!loading && !error && validId && session && (
          <CaseDetailContent session={session} onBack={goBack} />
        )}
      </Container>
    </>
  );
}
