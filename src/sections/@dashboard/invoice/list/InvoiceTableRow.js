import PropTypes from 'prop-types';
import { useState } from 'react';
// @mui
import {
  Link,
  Stack,
  Button,
  Divider,
  Checkbox,
  TableRow,
  MenuItem,
  TableCell,
  IconButton,
  Typography,
} from '@mui/material';
// utils
import { fDate } from '../../../../utils/formatTime';
import { fCurrency } from '../../../../utils/formatNumber';
// components
import Label from '../../../../components/label';
import Iconify from '../../../../components/iconify';
import { CustomAvatar } from '../../../../components/custom-avatar';
import MenuPopover from '../../../../components/menu-popover';
import ConfirmDialog from '../../../../components/confirm-dialog';

// ----------------------------------------------------------------------

InvoiceTableRow.propTypes = {
  row: PropTypes.object,
  selected: PropTypes.bool,
  onEditRow: PropTypes.func,
  onViewRow: PropTypes.func,
  onDeleteRow: PropTypes.func,
  onSelectRow: PropTypes.func,
};

export default function InvoiceTableRow({
  row,
  selected,
  onSelectRow,
  onViewRow,
  onEditRow,
  onDeleteRow,
}) {
  const { no, event, type, delegrate2, status } = row;

  const [openConfirm, setOpenConfirm] = useState(false);

  const [openPopover, setOpenPopover] = useState(null);

  const handleOpenConfirm = () => {
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const handleOpenPopover = (events) => {
    setOpenPopover(events.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  return (
    <>
      <TableRow hover selected={selected}>


        {/* <TableCell>
          <Stack direction="row" alignItems="center" spacing={2}>
            <CustomAvatar name={invoiceTo.name} />

            <div>
              <Typography variant="subtitle2" noWrap>
                {invoiceTo.name}
              </Typography>

              <Link
                noWrap
                variant="body2"
                onClick={onViewRow}
                sx={{ color: 'text.disabled', cursor: 'pointer' }}
              >
                {`INV-${invoiceNumber}`}
              </Link>
            </div>
          </Stack>
        </TableCell> */}

        {/* <TableCell align="left">{no}</TableCell> */}

        <TableCell onClick={() => {
            onViewRow();
          }} align="left">{event}</TableCell>

        <TableCell onClick={() => {
            onViewRow();
          }} align="left">{delegrate2}</TableCell>

        <TableCell align="left">
          <Label
            variant="soft"
            color={
              (type === 'International Convention' && 'success') ||
              (type === 'National Convention' && 'warning') ||
              (type === 'Regional Convention' && 'error') ||
              'default'
            }
          >
            {type}
          </Label>
        </TableCell>

        <TableCell onClick={() => {
            onViewRow();
          }} align="center">{status}</TableCell>

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
        sx={{ width: 160 }}
      >
        <MenuItem
          onClick={() => {
            onViewRow();
            handleClosePopover();
          }}
        >
          <Iconify icon="eva:eye-fill" />
          View
        </MenuItem>

        <MenuItem
          onClick={() => {
            onEditRow();
            handleClosePopover();
          }}
        >
          <Iconify icon="eva:edit-fill" />
          Edit
        </MenuItem>

        <Divider sx={{ borderStyle: 'dashed' }} />

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
      </MenuPopover>

      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Delete
          </Button>
        }
      />
    </>
  );
}
