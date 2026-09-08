import { useState } from 'react';
// @mui
import {
  Box,
  List,
  Avatar,
  Button,
  Dialog,
  Typography,
  DialogTitle,
  ListItemText,
  ListItemAvatar,
  ListItemButton,
} from '@mui/material';
import { tr, useUiLanguage } from '../../../../locales/translate';
// components
import Iconify from '../../../../components/iconify';

// ----------------------------------------------------------------------

const emails = ['username@gmail.com', 'user02@gmail.com'];

export default function SimpleDialog() {
  useUiLanguage();
  const [open, setOpen] = useState(false);

  const [selectedValue, setSelectedValue] = useState(emails[1]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = (value) => {
    setOpen(false);
    setSelectedValue(value);
  };

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="subtitle1" component="div">{tr("Selected:")}{selectedValue}
      </Typography>
      <br />
      <Button variant="outlined" onClick={handleClickOpen}>{tr("Open simple dialog")}</Button>

      <Dialog open={open} onClose={() => handleClose(selectedValue)}>
        <DialogTitle id="simple-dialog-title">{tr("Set backup account")}</DialogTitle>
        <List>
          {emails.map((email) => (
            <ListItemButton onClick={() => handleClose(email)} key={email}>
              <ListItemAvatar>
                <Avatar
                  sx={{
                    color: 'info.main',
                    backgroundColor: 'info.lighter',
                  }}
                >
                  <Iconify icon="eva:person-fill" />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={email} />
            </ListItemButton>
          ))}

          <ListItemButton autoFocus onClick={() => handleClose('addAccount')}>
            <ListItemAvatar>
              <Avatar>
                <Iconify icon="eva:plus-fill" />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary="Add account" />
          </ListItemButton>
        </List>
      </Dialog>
    </Box>
  );
}
