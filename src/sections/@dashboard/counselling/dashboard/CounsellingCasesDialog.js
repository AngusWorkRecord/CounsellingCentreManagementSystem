import PropTypes from 'prop-types';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { tr, useUiLanguage } from '../../../../locales/translate';
import Iconify from '../../../../components/iconify';
import CounsellingCasePreviewCard from './CounsellingCasePreviewCard';

export default function CounsellingCasesDialog({ onClose, onView, open, sessions, title }) {
  useUiLanguage();
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" scroll="paper">
      <DialogTitle sx={{ pr: 6 }}>
        <Typography variant="h4">{typeof title === 'function' ? title() : title}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {/* 中文原文：共 X 宗个案 */}{sessions.length} {tr("case")}{sessions.length === 1 ? '' : tr("s")}
        </Typography>
        <IconButton onClick={onClose} sx={{ position: 'absolute', top: 12, right: 12 }}>
          <Iconify icon="eva:close-fill" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ py: 2.5 }}>
        <Stack spacing={2}>
          {sessions.map((session, index) => (
            <CounsellingCasePreviewCard
              key={session.id || session.submission_id || index}
              session={session}
              onView={onView}
            />
          ))}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

CounsellingCasesDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  onView: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  sessions: PropTypes.array.isRequired,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
};
