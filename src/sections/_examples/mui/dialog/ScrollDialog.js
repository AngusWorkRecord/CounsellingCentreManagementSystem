import { useState, useRef, useEffect } from 'react';
// @mui
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import { tr, useUiLanguage } from '../../../../locales/translate';

// ----------------------------------------------------------------------

export default function ScrollDialog() {
  useUiLanguage();
  const [open, setOpen] = useState(false);

  const [scroll, setScroll] = useState('paper');

  const handleClickOpen = (scrollType) => () => {
    setOpen(true);
    setScroll(scrollType);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const descriptionElementRef = useRef(null);

  useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement) {
        descriptionElement.focus();
      }
    }
  }, [open]);

  return (
    <div>
      <Button variant="outlined" onClick={handleClickOpen('paper')} sx={{ mr: 2 }}>
        scroll=paper
      </Button>

      <Button variant="outlined" onClick={handleClickOpen('body')}>
        scroll=body
      </Button>

      <Dialog open={open} onClose={handleClose} scroll={scroll}>
        <DialogTitle sx={{ pb: 2 }}>{tr("Subscribe")}</DialogTitle>

        <DialogContent dividers={scroll === 'paper'}>
          <DialogContentText
            id="scroll-dialog-description"
            ref={descriptionElementRef}
            tabIndex={-1}
          >
            {[...new Array(50)]
              .map(
                () => `Cras mattis consectetur purus sit amet fermentum.
Cras justo odio, dapibus ac facilisis in, egestas eget quam.
Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
Praesent commodo cursus magna, vel scelerisque nisl consectetur et.`
              )
              .join('\n')}
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>{tr("Cancel")}</Button>

          <Button variant="contained" onClick={handleClose}>{tr("Subscribe")}</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
