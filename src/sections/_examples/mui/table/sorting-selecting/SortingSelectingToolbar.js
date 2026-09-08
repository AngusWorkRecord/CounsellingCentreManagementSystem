import { Tooltip, Typography, IconButton, Stack } from '@mui/material';
import { tr, useUiLanguage } from '../../../../../locales/translate';
// components
import Iconify from '../../../../../components/iconify';

// ----------------------------------------------------------------------

export default function SortingSelectingToolbar() {
  useUiLanguage();
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 3 }}>
      <Typography variant="h6">{tr("Sorting & Selecting")}</Typography>

      <Tooltip title={tr("Filter list")}>
        <IconButton>
          <Iconify icon="ic:round-filter-list" />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}
