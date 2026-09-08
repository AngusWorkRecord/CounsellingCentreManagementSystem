import { useState } from 'react';
// @mui
import { Paper, Button, ClickAwayListener, TextField } from '@mui/material';
import { tr, useUiLanguage } from '../../../../locales/translate';
// redux
import { useDispatch } from '../../../../redux/store';
import { createColumn } from '../../../../redux/slices/kanban';
// components
import Iconify from '../../../../components/iconify';

// ----------------------------------------------------------------------

export default function KanbanColumnAdd() {
  useUiLanguage();
  const dispatch = useDispatch();

  const [name, setName] = useState('');

  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChangeName = (event) => {
    setName(event.target.value);
  };

  const handleCreateColumn = async () => {
    try {
      if (name) {
        dispatch(createColumn({ name }));
        setName('');
      }
      handleClose();
    } catch (error) {
      console.error(error);
    }
  };

  const handleKeyUp = (event) => {
    if (event.key === 'Enter') {
      handleCreateColumn();
    }
  };

  return (
    <Paper sx={{ minWidth: 280, width: 280 }}>
      {open ? (
        <ClickAwayListener onClickAway={handleCreateColumn}>
          <TextField
            autoFocus
            fullWidth
            placeholder={tr("New section")}
            value={name}
            onChange={handleChangeName}
            onKeyUp={handleKeyUp}
            InputProps={{
              sx: { typography: 'h6' },
            }}
          />
        </ClickAwayListener>
      ) : (
        <Button
          fullWidth
          size="large"
          color="inherit"
          variant="outlined"
          startIcon={<Iconify icon="eva:plus-fill" />}
          onClick={handleOpen}
        >{tr("Add section")}</Button>
      )}
    </Paper>
  );
}
