import PropTypes from 'prop-types';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import Iconify from '../../../../components/iconify';
import CounsellingCasePreviewCard from './CounsellingCasePreviewCard';

export default function CounsellingCasesDialog({ onClose, onView, open, sessions, title }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" scroll="paper">
      <DialogTitle sx={{ pr: 6 }}>
        <Typography variant="h4">{title}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          共 {sessions.length} 宗个案
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
  title: PropTypes.string.isRequired,
};
