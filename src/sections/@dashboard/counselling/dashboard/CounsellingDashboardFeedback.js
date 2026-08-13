import PropTypes from 'prop-types';
import { Alert, Button, CircularProgress, Stack, Typography } from '@mui/material';

export default function CounsellingDashboardFeedback({ error, loading, onReload }) {
  if (error) {
    return (
      <Alert
        severity="error"
        sx={{ mb: 3 }}
        action={<Button color="inherit" size="small" onClick={onReload}>重新加载</Button>}
      >
        {error}
      </Alert>
    );
  }

  if (loading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 420 }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          正在读取辅导个案资料…
        </Typography>
      </Stack>
    );
  }

  return null;
}

CounsellingDashboardFeedback.propTypes = {
  error: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired,
  onReload: PropTypes.func.isRequired,
};
