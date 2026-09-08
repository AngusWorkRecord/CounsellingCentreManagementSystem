import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  IconButton,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { uiMessage } from '../../../../../locales/uiMessage';
import { tr, useUiLanguage } from '../../../../../locales/translate';
import { domainLabel } from '../../../../../locales/domainLabels';
import Label from '../../../../../components/label';
import Iconify from '../../../../../components/iconify';
import ConfirmDialog from '../../../../../components/confirm-dialog';
import MenuPopover from '../../../../../components/menu-popover';
import { TablePaginationCustom, useTable } from '../../../../../components/table';

// 中文原文：个案编号、日期、案主简称、值班类别、个案类别、辅导员、辅导时长、简要报告、详细报告、款项、操作
const columns = ['Case Number', 'Date', 'Client Initials', 'Session Mode', 'Case Category', 'Counsellor', 'Duration', 'Brief Report', 'Detailed Report', 'Payment', 'Actions'];

export default function CaseTable({ cases, deletingId, onDelete, onEdit, onView }) {
  useUiLanguage();
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [deleteCase, setDeleteCase] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const {
    dense,
    page,
    rowsPerPage,
    setPage,
    onChangeDense,
    onChangePage,
    onChangeRowsPerPage,
  } = useTable({ defaultRowsPerPage: 5 });

  const pageCount = Math.max(1, Math.ceil(cases.length / rowsPerPage));
  const visibleCases = cases.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  useEffect(() => {
    if (page >= pageCount) setPage(pageCount - 1);
  }, [page, pageCount, setPage]);

  const closeMenu = () => setMenuAnchor(null);

  const handleMenuAction = (action) => {
    if (selectedCase) action(selectedCase.id);
    closeMenu();
  };

  const handleConfirmDelete = async () => {
    setDeleteError('');
    try {
      await onDelete(deleteCase.id);
      setDeleteCase(null);
      setSelectedCase(null);
    } catch (error) {
      // 中文原文：无法删除个案，请稍后再试
      setDeleteError(error.message || 'Unable to delete the case. Please try again later.');
    }
  };

  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
      <TableContainer>
        <Table size={dense ? 'small' : 'medium'} sx={{ minWidth: 1330 }}>
          <TableHead>
            <TableRow>
              {columns.map((column) => <TableCell key={column}>{tr(column)}</TableCell>)}
            </TableRow>
          </TableHead>
          <TableBody>
            {!cases.length && (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 8 }}>
                  <Iconify icon="eva:inbox-outline" width={36} sx={{ color: 'text.disabled', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {/* 中文原文：没有符合筛选条件的个案记录 */}{tr("No cases match the selected filters")}</Typography>
                </TableCell>
              </TableRow>
            )}
            {visibleCases.map((item) => (
              <TableRow key={item.id} hover>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{item.id}</TableCell>
                <TableCell>{item.date}</TableCell>
                <TableCell>{item.initials}</TableCell>
                <TableCell>{domainLabel(item.sessionMode)}</TableCell>
                <TableCell>{domainLabel(item.category)}</TableCell>
                <TableCell>{item.counsellor}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{item.duration}</TableCell>
                <TableCell>
                  {item.briefReportCompleted ? (
                    <Label color="success">{item.caseNumber}</Label>
                  ) : (
                    <Button size="small" variant="outlined">{tr("Complete Now")}</Button>
                  )}
                </TableCell>
                <TableCell sx={{ maxWidth: 220 }}>
                  {item.detailedReportCompleted ? (
                    <Button
                      component="a"
                      href={item.reportUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="small"
                      title={item.reportUrl}
                      sx={{ maxWidth: 200, justifyContent: 'flex-start', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {item.reportUrl}
                    </Button>
                  ) : (
                    <Button size="small" variant="outlined">{tr("Complete Now")}</Button>
                  )}
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{tr("RM")}{item.amount}</TableCell>
                <TableCell>
                  <Stack direction="row" alignItems="center" sx={{ whiteSpace: 'nowrap' }}>
                    <IconButton
                      size="small"
                      color={menuAnchor && selectedCase?.id === item.id ? 'primary' : 'default'}
                      onClick={(event) => {
                        setSelectedCase(item);
                        setMenuAnchor(event.currentTarget);
                      }}
                    >
                      <Iconify icon="eva:more-vertical-fill" />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <MenuPopover open={menuAnchor} onClose={closeMenu} arrow="right-top" sx={{ width: 160 }}>
        <MenuItem onClick={() => handleMenuAction(onView)}>
          <Iconify icon="eva:eye-outline" />
          {/* 中文原文：查看详情 */}{tr("View Details")}</MenuItem>
        <MenuItem onClick={() => handleMenuAction(onEdit)}>
          <Iconify icon="eva:edit-2-outline" />
          {/* 中文原文：编辑 */}{tr("Edit")}</MenuItem>
        <MenuItem
          sx={{ color: 'error.main' }}
          onClick={() => {
            setDeleteCase(selectedCase);
            setDeleteError('');
            closeMenu();
          }}
        >
          <Iconify icon="eva:trash-2-outline" />
          {/* 中文原文：删除 */}{tr("Delete")}</MenuItem>
      </MenuPopover>

      <ConfirmDialog
        open={Boolean(deleteCase)}
        onClose={() => {
          if (deletingId == null) {
            setDeleteCase(null);
            setDeleteError('');
          }
        }}
        title={tr("Delete Case")}
        content={
          <>
            {/* 中文原文：确定要删除这个个案吗？删除后将不会显示在系统中。 */}{tr("Are you sure you want to delete this case? It will no longer appear in the system.")}{deleteError && <Alert severity="error" sx={{ mt: 2 }}>{uiMessage(deleteError)}</Alert>}
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            disabled={deletingId != null}
            onClick={handleConfirmDelete}
          >
            {/* 中文原文：删除中…、删除 */}
            {deletingId != null ? tr("Deleting…") : tr("Delete")}
          </Button>
        }
      />

      <TablePaginationCustom
        component="div"
        count={cases.length}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        onPageChange={onChangePage}
        onRowsPerPageChange={onChangeRowsPerPage}
        dense={dense}
        denseLabel="Compact view"
        onChangeDense={onChangeDense}
        labelRowsPerPage="Rows per page:"
        labelDisplayedRows={({ from, to, count }) =>
          `${count === 0 ? 0 : from}–${count === 0 ? 0 : to} of ${count}`
        }
        getItemAriaLabel={(type) => (type === 'previous' ? 'Previous page' : 'Next page')}
      />
    </Box>
  );
}

CaseTable.propTypes = {
  cases: PropTypes.array.isRequired,
  deletingId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onView: PropTypes.func.isRequired,
};
