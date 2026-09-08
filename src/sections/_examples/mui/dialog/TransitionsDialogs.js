import { forwardRef, useState } from 'react';
// @mui
import {
  Slide,
  Dialog,
  Button,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';
import { tr, useUiLanguage } from '../../../../locales/translate';

// ----------------------------------------------------------------------

const Transition = forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

export default function TransitionsDialogs() {
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
      <Button variant="outlined" color="success" onClick={handleClickOpen}>{tr("Transitions Dialogs")}</Button>

      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle id="alert-dialog-slide-title">{tr("Use Google's location service?")}</DialogTitle>

        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">{tr("Let Google help apps determine location. This means sending anonymous location data to Google, even when no apps are running.")}</DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button color="inherit" onClick={handleClose}>{tr("Disagree")}</Button>

          <Button variant="contained" onClick={handleClose}>{tr("Agree")}</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
