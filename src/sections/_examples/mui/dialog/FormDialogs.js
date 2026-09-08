import { useState } from 'react';
// @mui
import {
  Button,
  Dialog,
  TextField,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import { tr, useUiLanguage } from '../../../../locales/translate';

// ----------------------------------------------------------------------

export default function FormDialogs() {
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
      <Button variant="outlined" color="warning" onClick={handleClickOpen}>{tr("Form Dialogs")}</Button>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{tr("Subscribe")}</DialogTitle>
        <DialogContent>
          <DialogContentText>{tr("To subscribe to this website, please enter your email address here. We will send updates occasionally.")}</DialogContentText>
          <TextField
            autoFocus
            fullWidth
            type="email"
            margin="dense"
            variant="outlined"
            label={tr("Email Address")}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">{tr("Cancel")}</Button>
          <Button onClick={handleClose} variant="contained">{tr("Subscribe")}</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
