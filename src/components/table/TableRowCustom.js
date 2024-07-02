import PropTypes from 'prop-types';
import { useState } from 'react';
// @mui
import {
  Chip,
  Stack,
  Avatar,
  Button,
  Tooltip,
  Checkbox,
  TableRow,
  MenuItem,
  TableCell,
  IconButton,
  Typography,
  AvatarGroup,
  ListItemText,
} from '@mui/material';
// components
import Label from '../label';
import Iconify from '../iconify';
import MenuPopover from '../menu-popover';
import ConfirmDialog from '../confirm-dialog';

// ----------------------------------------------------------------------

TableRowCustom.propTypes = {
  row: PropTypes.object,
  index_id: PropTypes.number,
  selected: PropTypes.bool,
  headLabel: PropTypes.array,
  onEditRow: PropTypes.func,
  onClickRow: PropTypes.func,
  onDeleteRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  additionalRow: PropTypes.node,
  additionalComponents: PropTypes.func,
  onViewRow: PropTypes.func,
  isEditable: PropTypes.bool,
  isDeleteable: PropTypes.bool,
  handleOpenDialog: PropTypes.func,
};

export default function TableRowCustom({
  row,
  index_id,
  selected,
  headLabel,
  onEditRow,
  onClickRow,
  onSelectRow,
  onDeleteRow,
  additionalRow,
  additionalComponents,
  onViewRow,
  isEditable,
  isDeleteable,
  handleOpenDialog,
}) {
  const {
    UserEmail,
    ProfilePictureName,
    UserFullName,
    UserInstituition,
    UserExpertise,
    MediaType,
    StaffRole,
    isVerified,
    StaffStatus,
    StatusID,
  } = row;

  const avatarUrl = `${ProfilePictureName}${MediaType}`;

  const [openConfirm, setOpenConfirm] = useState(false);

  const [openPopover, setOpenPopover] = useState(null);

  const [openDetails, setOpenDetails] = useState(false);

  const handleOpenDetails = () => {
    setOpenDetails(true);
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
  };

  const handleOpenConfirm = () => {
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const handleOpenPopover = (event) => {
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  const handleColor = (type, usertype, value) => {
    let color = 'primary'
    if (type === "") {
      switch (value) {
        case 1:
          color = 'secondary'
          break;

        case 2:
          color = 'error'
          break;

        case 3:
          color = 'info'
          break;

        case 4:
          color = 'success'
          break;

        case 5:
          color = 'warning'
          break;

        default:
          break;
      }
    }
    else {
      switch (usertype) {
        case 'Editor':
          color = 'secondary'
          break;

        case 'Reviewer':
          color = 'warning'
          break;

        case 'Author':
          color = 'info'
          break;

        default:
          break;
      }
    }
    return color;
  };

  return (
    <>
      <TableRow hover selected={selected}>
        {headLabel.map((el, index) => (
          <>
            {el.type === 'IconButton' && (
              <TableCell key={`ic_${el.id}_${index}`} align={row.align}>
                <IconButton
                  color={openPopover ? 'primary' : 'default'}
                  onClick={handleOpenPopover}
                >
                  <Iconify icon="eva:more-vertical-fill" />
                </IconButton>
              </TableCell>
            )}

            {el.type === 'Checkbox' && (
              <TableCell key={`ic_${el.id}_${index}`} align={row.align}>
                <Checkbox checked={selected} onClick={onSelectRow} />
              </TableCell>
            )}

            {el.type === 'AvatarGroup' && (
              <TableCell key={`ac_${el.id}_${index}`} align={row.align} onClick={onClickRow && onClickRow}>
                <AvatarGroup
                  max={4}
                  sx={{
                    '& .MuiAvatarGroup-avatar': {
                      width: 24,
                      height: 24,
                      '&:first-of-type': {
                        fontSize: 12,
                      },
                    },
                  }}
                >
                  {row[el.id] &&
                    JSON.parse(row[el.id]).map((person) => (
                      <Avatar key={person.UserID} alt={person.UserFullName} src={person.avatar}>
                        <Tooltip title={person.UserFullName}>
                          <span>{person.UserFullName}</span>
                        </Tooltip>
                      </Avatar>
                    ))}{' '}
                </AvatarGroup>
              </TableCell>
            )}

            {el.type === 'AvatarGroupNonJSON' && (
              <TableCell key={`ac_${el.id}_${index}`} align={row.align} onClick={onClickRow && onClickRow}>
                <AvatarGroup
                  max={4}
                  sx={{
                    '& .MuiAvatarGroup-avatar': {
                      width: 24,
                      height: 24,
                      '&:first-of-type': {
                        fontSize: 12,
                      },
                    },
                  }}
                >
                  {row[el.id] &&
                    <Avatar key={row[el.id]} alt={row[el.id]} src={row[el.id]}>
                      <Tooltip title={row[el.id]}>
                        <span>{row[el.id]}</span>
                      </Tooltip>
                    </Avatar>
                  }
                </AvatarGroup>
                <Typography
                  variant="soft"
                  noWrap
                  sx={{
                    textTransform: 'capitalize',
                  }}
                >
                  {row[el.id]}
                </Typography>
              </TableCell>
            )}

            {el.type === 'ind' && (
              <TableCell key={`ac_${el.id}_${index}`} align={row.align} onClick={onClickRow && onClickRow}>
                <Typography variant="subtitle2" noWrap>
                  {index_id}
                </Typography>
              </TableCell>
            )}

            {el.type === 'Avatar' && (
              <TableCell key={`ac_${el.id}_${index}`} align={row.align} onClick={onClickRow && onClickRow}>
                <Avatar alt={row[el.id]} src={row[el.id]} />
              </TableCell>
            )}

            {el.type === 'Chip' && (
              <TableCell key={`cc_${el.id}_${index}`} align={row.align} onClick={onClickRow && onClickRow}>
                {row[el.id] &&
                  JSON.parse(row[el.id]).map((papercategory) => (
                    <Chip
                      size="small"
                      variant="soft"
                      label={papercategory}
                      key={`cc_${papercategory}`}
                    />
                  ))}
              </TableCell>
            )}

            {el.type === 'ListItemText' && (
              <TableCell key={`cc_${el.id}_${index}`} align={row.align} onClick={onClickRow && onClickRow}>
                <ListItemText
                  primary={row[el.id]}
                  secondary={
                    <Tooltip title={row[el.subtext]}>
                      <span>{row[el.subtext]}</span>
                    </Tooltip>
                  }
                  primaryTypographyProps={{ noWrap: true, typography: 'subtitle2' }}
                  secondaryTypographyProps={{ noWrap: true, fontSize: '0.8rem' }}
                  sx={{ flexGrow: 1, pr: 1 }}
                />
              </TableCell>
            )}

            {el.type === 'Typography' && (
              <TableCell key={`cc_${el.id}_${index}`} align={row.align} onClick={onClickRow && onClickRow}>
                <Typography variant="subtitle2" noWrap>
                  {row[el.id]}
                </Typography>
              </TableCell>
            )}

            {el.type === 'ColorChip' && (
              <TableCell key={`cc_${el.id}_${index}`} align={row.align} onClick={onClickRow && onClickRow}>
                {
                  row[el.id] &&
                  JSON.parse(row[el.id]).map((papercategory, i) => (
                    <Chip
                      size="small"
                      color={handleColor(el.subtext, papercategory, i % JSON.parse(row[el.id]).length)}
                      variant="soft"
                      label={papercategory}
                      key={`c_${papercategory}`}
                    />
                  ))
                }
              </TableCell>
            )}

            {el.type === 'TypographyColor' && (
              <TableCell key={`cc_${el.id}_${index}`} align={row.align} onClick={onClickRow && onClickRow}>
                <Typography
                  variant="soft"
                  noWrap
                  sx={{
                    textTransform: 'capitalize',
                    color: row[el.TextColor],
                    backgroundColor: row[el.Color],
                  }}
                >
                  {row[el.id]}
                </Typography>
              </TableCell>
            )}

            {el.type === 'ActionButton' && (
              <TableCell key={`ac_${el.id}_${index}`} align={row.align} onClick={onClickRow && onClickRow}>
                <Button
                  variant="contained"
                  size="small"
                  disabled={row[el.disable]}
                  sx={{ margin: 0.5, backgroundColor: row[el.color], }}
                  onClick={() => handleOpenDialog()}
                // startIcon={<Iconify icon="material-symbols:file-present-outline" />}
                >
                  {row[el.id]}
                </Button>
              </TableCell>
            )}

            {el.type === 'LabelButton' && (
              <TableCell key={`ac_${el.id}_${index}`} align={row.align} onClick={onClickRow && onClickRow}>
                <Button
                  variant="contained"
                  size="small"
                  disabled={row[el.disable]}
                  sx={{ margin: 0.5, backgroundColor: row[el.color], }}
                >
                  {row[el.id]}
                </Button>
              </TableCell>
            )}

            {el.type === 'Additional' && additionalRow}

            {el.action && (
              <TableCell key={`ac_${el.id}_${index}`} align={row.align} onClick={onClickRow && onClickRow}>
                <IconButton color={openPopover ? 'primary' : 'default'} onClick={handleOpenPopover}>
                  <Iconify icon="eva:more-vertical-fill" />
                </IconButton>
              </TableCell>
            )}

            {/* <TableCell key={`ac_${el.id}_${index}`} align={row.align} onClick={onClickRow && onClickRow}>
              <Stack direction="row" alignItems="center" spacing={2}>
                {el.type === 'AvatarGroup' ? (

                ): null}
                {el.type === 'AvatarGroupNonJSON' ? (
                  <>

                  </>
                ) : null}

                {el.type === 'ind' ? (
                  <Typography variant="subtitle2" noWrap>
                    {index_id}
                  </Typography>
                ) : null}

                {el.type === 'Avatar' ? <Avatar alt={row[el.id]} src={row[el.id]} /> : null}

                {el.type === 'Chip'
                  ? row[el.id] &&
                  JSON.parse(row[el.id]).map((papercategory) => (
                    <Chip
                      size="small"
                      variant="soft"
                      label={papercategory}
                      key={`cc_${papercategory}`}
                    />
                  ))
                  : null}

                {el.type === 'ColorChip'
                  ? row[el.id] &&
                  JSON.parse(row[el.id]).map((papercategory, i) => (
                    <Chip
                      size="small"
                      color={handleColor(el.subtext, papercategory, i % JSON.parse(row[el.id]).length)}
                      variant="soft"
                      label={papercategory}
                      key={`c_${papercategory}`}
                    />
                  ))
                  : null}

                {el.type === 'ListItemText' ? (
                  <ListItemText
                    primary={row[el.id]}
                    secondary={
                      <Tooltip title={row[el.subtext]}>
                        <span>{row[el.subtext]}</span>
                      </Tooltip>
                    }
                    primaryTypographyProps={{ noWrap: true, typography: 'subtitle2' }}
                    secondaryTypographyProps={{ noWrap: true, fontSize: '0.8rem' }}
                    sx={{ flexGrow: 1, pr: 1 }}
                  />
                ) : null}

                {el.type === 'Typography' ? (
                  <Typography variant="subtitle2" noWrap>
                    {row[el.id]}
                  </Typography>
                ) : null}

                {el.type === 'TypographyColor' ? (
                  <Typography
                    variant="soft"
                    noWrap
                    sx={{
                      textTransform: 'capitalize',
                      color: row[el.TextColor],
                      backgroundColor: row[el.Color],
                    }}
                  >
                    {row[el.id]}
                  </Typography>
                ) : null}

                {el.type === 'ActionButton' ? (
                  <Button
                    variant="contained"
                    size="small"
                    disabled={row[el.disable]}
                    sx={{ margin: 0.5, backgroundColor: row[el.color], }}
                    onClick={() => handleOpenDialog()}
                  // startIcon={<Iconify icon="material-symbols:file-present-outline" />}
                  >
                    {row[el.id]}
                  </Button>
                ) : null}

                {el.type === 'LabelButton' ? (
                  <Button
                    variant="contained"
                    size="small"
                    disabled={row[el.disable]}
                    sx={{ margin: 0.5, backgroundColor: row[el.color], }}
                  >
                    {row[el.id]}
                  </Button>
                ) : null}

                {el.type === 'Additional' ? additionalRow : null}
              </Stack>


            </TableCell> */}
            {/* } */}
          </>
        ))}

        {/* {if (el.id === 'Checkbox') {
                components = row[el.id]
              }
           else if (el.id === 'Avatar') {
            components = (
              <TableCell key="tc_" align={row.align}>
                <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar alt={row[el.id]} src={row[el.id]}/>
                </Stack>
              </TableCell>
            );
          } else if (el.id === 'ListItemText') {
            components = (
              <TableCell key="tc_" align={row.align}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <ListItemText
                    primary={row[el.id]}
                    secondary={
                      <Tooltip title={row[el.subtext]}>
                        <span>{row[el.subtext]}</span>
                      </Tooltip>
                    }
                    primaryTypographyProps={{ noWrap: true, typography: 'subtitle2' }}
                    secondaryTypographyProps={{ noWrap: true, fontSize: '0.8rem' }}
                    sx={{ flexGrow: 1, pr: 1 }}
                  />
                </Stack>
              </TableCell>
            );
          } else if (el.id === 'IconButton') {
            components = (
              <TableCell key="tc_" align={row.align}>
                <IconButton color={openPopover ? 'primary' : 'default'} onClick={handleOpenPopover}>
                  <Iconify icon="eva:more-vertical-fill" />
                </IconButton>
              </TableCell>
            );
          } else {
            components = (
              <TableCell key="tc_" align={row.align}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  {row[el.id]}
                  </Stack>
              </TableCell>
            );
          } */}

        {/* <TableCell>data[el.name]
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar alt={UserFullName} src={avatarUrl} />
          </Stack>
        </TableCell>
        <TableCell>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="subtitle2" noWrap>
              {UserFullName}
            </Typography>
          </Stack>
        </TableCell>
        <TableCell align="center">{UserEmail}</TableCell>

        <TableCell align="left" sx={{ textTransform: 'capitalize' }}>
          {UserInstituition}
        </TableCell>
        <TableCell align="center" sx={{ textTransform: 'capitalize' }}>
          {UserExpertise}
        </TableCell>
        <TableCell align="left">
          <Button
            variant="contained"
            size="small"
            sx={{ margin: 0.5 }}
            onClick={() => window.open(row.PaperFileURL, '_blank')}
            startIcon={<Iconify icon="material-symbols:add" />}
          >
            Add
          </Button>
        </TableCell> */}
      </TableRow >
      <MenuPopover
        open={openPopover}
        onClose={handleClosePopover}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        {isDeleteable && (
          <MenuItem
            onClick={() => {
              handleOpenConfirm();
              handleClosePopover();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="eva:trash-2-outline" />
            Delete
          </MenuItem>
        )}
        {isEditable && (
          <MenuItem
            onClick={() => {
              onEditRow();
              handleClosePopover();
            }}
          >
            <Iconify icon="eva:edit-fill" />
            Edit
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            // onEditRow();
            if (onClickRow) {
              onClickRow();
            } else {
              onViewRow();
            }
            handleClosePopover();
          }}
        >
          <Iconify icon="eva:eye-outline" />
          View
        </MenuItem>
      </MenuPopover>
      {additionalComponents}
      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button Button variant="contained" color="error" onClick={onDeleteRow} >
            Delete
          </Button>
        }
      />
    </>
  );
}
