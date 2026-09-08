import { Stack, Paper, Button, Tooltip, IconButton, InputBase } from '@mui/material';
import { tr, useUiLanguage } from '../../../../locales/translate';
// @mui
// auth
import { useAuthContext } from '../../../../auth/useAuthContext';
// components
import Iconify from '../../../../components/iconify';
import { CustomAvatar } from '../../../../components/custom-avatar';

// ----------------------------------------------------------------------

export default function KanbanDetailsCommentInput() {
  useUiLanguage();
  const { user } = useAuthContext();

  return (
    <Stack direction="row" spacing={2} sx={{ py: 3, px: 2.5 }}>
      <CustomAvatar src={user?.photoURL} alt={user?.UserFirstName} name={user?.UserFirstName} />

      <Paper variant="outlined" sx={{ p: 1, flexGrow: 1 }}>
        <InputBase fullWidth multiline rows={2} placeholder={tr("Type a message")} sx={{ px: 1 }} />

        <Stack direction="row" alignItems="center">
          <Stack direction="row" flexGrow={1}>
            <Tooltip title={tr("Add photo")}>
              <IconButton size="small">
                <Iconify icon="ic:round-add-photo-alternate" />
              </IconButton>
            </Tooltip>

            <IconButton size="small">
              <Iconify icon="eva:attach-2-fill" />
            </IconButton>
          </Stack>

          <Button variant="contained">{tr("Comment")}</Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
