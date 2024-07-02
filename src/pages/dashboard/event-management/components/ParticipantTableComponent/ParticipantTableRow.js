import PropTypes from 'prop-types';
import { useState } from 'react';
// @mui
import {
  Stack,
  Button,
  Checkbox,
  TableRow,
  MenuItem,
  TableCell,
  IconButton,
  Typography,
  Link,
} from '@mui/material';
// components
import Label from '../../../../../components/label';
import Iconify from '../../../../../components/iconify';
import MenuPopover from '../../../../../components/menu-popover';
import ConfirmDialog from '../../../../../components/confirm-dialog';

// ----------------------------------------------------------------------

ParticipantTableRow.propTypes = {
  row: PropTypes.object,
  selected: PropTypes.bool,
  onEditRow: PropTypes.func,
  onDeleteRow: PropTypes.func,
  onSelectRow: PropTypes.func,
};

export default function ParticipantTableRow({ row, selected, onEditRow, onSelectRow, onDeleteRow }) {
  const {
    ParticipantID,
    ParticipantName,
    PreferName,
    isRequiredCertificate,
    Institution,
    AttendanceType,
    ContactNumber,
    EmailAddress,
    EventID,
    UserID,
    PaymentType,
    PaymentReferenceCode,
    PaymentAttachment,
  } = row;

  const [openConfirm, setOpenConfirm] = useState(false);

  const [openPopover, setOpenPopover] = useState(null);

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

  return (
    <>
      <TableRow hover selected={selected} key={ParticipantID}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell>
          <Stack spacing={0}>
            <Typography variant="subtitle1" noWrap>
              {`${ParticipantName}`}
            </Typography>
            {`(Prefer: ${PreferName})`}
          </Stack>
        </TableCell>

        <TableCell align="left">
          <Link variant='text' target="_blank" href={`mailto: ${EmailAddress}`}>
            {EmailAddress}
          </Link>
          <br />
          {ContactNumber}
        </TableCell>
        {/* <TableCell align="left">{Institution}</TableCell> */}
        <TableCell align="left">{AttendanceType}</TableCell>

        {/* <TableCell align="center">
          <Label
            variant="soft"
            color={(isRequiredCertificate === false && 'error') || 'success'}
            sx={{ textTransform: 'capitalize' }}
          >
            {isRequiredCertificate === true ? "Yes" : "No"}
          </Label>
        </TableCell> */}

        <TableCell align="right">
          <IconButton color={openPopover ? 'inherit' : 'default'} onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <MenuPopover
        open={openPopover}
        onClose={handleClosePopover}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        {/* <MenuItem
          onClick={() => {
            handleOpenConfirm();
            handleClosePopover();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="eva:trash-2-outline" />
          Delete
        </MenuItem> */}

        <MenuItem
          onClick={() => {
            handleOpenConfirm();
            handleClosePopover();
          }}
        >
          <Iconify icon="carbon:send-alt-filled" />
          Send Again
        </MenuItem>
      </MenuPopover>

      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        title="Resend Survey Questionnaire"
        content="Are you sure want to send again?"
        action={
          <Button variant="contained" color="primary" onClick={onEditRow}>
            Send Again
          </Button>
        }
      />
    </>
  );
}
