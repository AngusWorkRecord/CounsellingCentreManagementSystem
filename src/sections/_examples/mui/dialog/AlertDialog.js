import { useState } from 'react';
// @mui
import {
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';
import { tr, useUiLanguage } from '../../../../locales/translate';

// ----------------------------------------------------------------------

export default function AlertDialog() {
  useUiLanguage();
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button color="info" variant="outlined" onClick={handleClickOpen}>{tr("Open alert dialog")}</Button>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{tr("Use Google's location service?")}</DialogTitle>

        <DialogContent>
          <DialogContentText id="alert-dialog-description">{tr("Let Google help apps determine location. This means sending anonymous location data to Google, even when no apps are running.")}</DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>{tr("Disagree")}</Button>
          <Button onClick={handleClose} autoFocus>{tr("Agree")}</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
