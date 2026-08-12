import PropTypes from 'prop-types';
import { useEffect } from 'react';
import {
  Box,
  Button,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import Label from '../../../../../components/label';
import Iconify from '../../../../../components/iconify';
import { TablePaginationCustom, useTable } from '../../../../../components/table';

const columns = ['个案编号', '日期', '案主简称', '值班类别', '个案类别', '辅导员', '辅导时长', '简要报告', '详细报告', '款项', '操作'];

export default function CaseTable({ cases, onView }) {
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

  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
      <TableContainer>
        <Table size={dense ? 'small' : 'medium'} sx={{ minWidth: 1330 }}>
          <TableHead>
            <TableRow>
              {columns.map((column) => <TableCell key={column}>{column}</TableCell>)}
            </TableRow>
          </TableHead>
          <TableBody>
            {!cases.length && (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 8 }}>
                  <Iconify icon="eva:inbox-outline" width={36} sx={{ color: 'text.disabled', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    没有符合筛选条件的个案记录
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {visibleCases.map((item) => (
              <TableRow key={item.id} hover>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{item.id}</TableCell>
                <TableCell>{item.date}</TableCell>
                <TableCell>{item.initials}</TableCell>
                <TableCell>{item.sessionMode}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.counsellor}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{item.duration}</TableCell>
                <TableCell>
                  {item.briefReportCompleted ? (
                    <Label color="success">{item.caseNumber}</Label>
                  ) : (
                    <Button size="small" variant="outlined">立即填写</Button>
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
                    <Button size="small" variant="outlined">立即填写</Button>
                  )}
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>RM{item.amount}</TableCell>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={0.25} sx={{ whiteSpace: 'nowrap' }}>
                    <Button
                      size="small"
                      startIcon={<Iconify icon="eva:eye-outline" />}
                      onClick={() => onView(item.id)}
                    >
                      查看详情
                    </Button>
                    <Button size="small" startIcon={<Iconify icon="eva:edit-2-outline" />}>编辑</Button>
                    <IconButton size="small"><Iconify icon="eva:more-vertical-fill" /></IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePaginationCustom
        component="div"
        count={cases.length}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        onPageChange={onChangePage}
        onRowsPerPageChange={onChangeRowsPerPage}
        dense={dense}
        denseLabel="紧凑视图"
        onChangeDense={onChangeDense}
        labelRowsPerPage="每页行数："
        labelDisplayedRows={({ from, to, count }) =>
          `显示第 ${count === 0 ? 0 : from}–${count === 0 ? 0 : to} 条，共 ${count} 条`
        }
        getItemAriaLabel={(type) => (type === 'previous' ? '上一页' : '下一页')}
      />
    </Box>
  );
}

CaseTable.propTypes = {
  cases: PropTypes.array.isRequired,
  onView: PropTypes.func.isRequired,
};
