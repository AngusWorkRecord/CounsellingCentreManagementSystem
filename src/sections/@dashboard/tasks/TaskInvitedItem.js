import PropTypes from 'prop-types';
import { useState } from 'react';
// @mui
import {
  Avatar,
  Button,
  Divider,
  Tooltip,
  ListItem,
  MenuItem,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';
// components
import Iconify from '../../../components/iconify';
import MenuPopover from '../../../components/menu-popover';

// ----------------------------------------------------------------------

FileInvitedItem.propTypes = {
  person: PropTypes.shape({
    UserFullName: PropTypes.string,
    UserEmail: PropTypes.string,
    avatar: PropTypes.string,
    permission: PropTypes.string,
  }),
};

export default function FileInvitedItem({ person }) {
  const [permission, setPermission] = useState(person.permission);

  const [openPopover, setOpenPopover] = useState(null);

  const handleOpenPopover = (event) => {
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  const handleChangePermission = (newPermission) => {
    setPermission(newPermission);
  };

  return (
    <>
      <ListItem disableGutters>
        <ListItemAvatar>
          <Avatar alt={person.UserFullName} src={person.avatar} />
        </ListItemAvatar>

        <ListItemText
          primary={person.UserFullName}
          secondary={
            <Tooltip title={person.UserEmail}>
              <span>{person.UserEmail}</span>
            </Tooltip>
          }
          primaryTypographyProps={{ noWrap: true, typography: 'subtitle2' }}
          secondaryTypographyProps={{ noWrap: true }}
          sx={{ flexGrow: 1, pr: 1 }}
        />

        <Button
          size="small"
          color="inherit"
          startIcon={<Iconify icon="eva:edit-fill" />}
          onClick={handleOpenPopover}
          sx={{
            flexShrink: 0,
            textTransform: 'unset',
            fontWeight: 'fontWeightMedium',
            '& .MuiButton-endIcon': {
              ml: 0,
            },
            ...(openPopover && {
              bgcolor: 'action.selected',
            }),
          }}
        >
            edit
        </Button>
      </ListItem>

      <MenuPopover open={openPopover} onClose={handleClosePopover} sx={{ width: 160 }}>
        <>
          <MenuItem
            onClick={() => {
              // handleClosePopover();
              // handleChangePermission('view');
            }}
            sx={{
              ...(permission === 'view' && {
                bgcolor: 'action.selected',
              }),
            }}
          >
            <Iconify icon="eva:eye-fill" />
            view profile
          </MenuItem>

          {/* <MenuItem
            onClick={() => {
              handleClosePopover();
              handleChangePermission('edit');
            }}
            sx={{
              ...(permission === 'edit' && {
                bgcolor: 'action.selected',
              }),
            }}
          >
            <Iconify icon="eva:edit-fill" />
            Can edit
          </MenuItem> */}

          <Divider sx={{ borderStyle: 'dashed' }} />

          <MenuItem
            onClick={() => {
              handleClosePopover();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="eva:trash-2-outline" />
            Remove
          </MenuItem>
        </>
      </MenuPopover>
    </>
  );
}
