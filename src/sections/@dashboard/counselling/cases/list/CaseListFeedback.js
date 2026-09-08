import PropTypes from 'prop-types';
import { Alert, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { uiMessage } from '../../../../../locales/uiMessage';
import { tr, useUiLanguage } from '../../../../../locales/translate';

export default function CaseListFeedback({ error, loading, onReload }) {
  useUiLanguage();
  if (error) {
    return (
      <Alert
        severity="error"
        sx={{ mb: 3 }}
        action={<Button color="inherit" size="small" onClick={onReload}>{tr("Reload")}</Button>}
      >
        {uiMessage(error)}
      </Alert>
    );
  }

  if (loading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 420 }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          {/* 中文原文：正在读取辅导个案资料… */}{tr("Loading counselling case data…")}</Typography>
      </Stack>
    );
  }

  return null;
}

CaseListFeedback.propTypes = {
  error: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired,
  onReload: PropTypes.func.isRequired,
};
