import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Box, Button, Divider, Stack, Typography } from '@mui/material';
import Iconify from '../../../../components/iconify';
import { TablePaginationCustom, useTable } from '../../../../components/table';

const reminderColors = {
  首次提醒: 'warning',
  第二次提醒: 'error',
  最后提醒: 'error',
};

export default function PendingFollowUp({ cases }) {
  const [sentReminders, setSentReminders] = useState(() => new Set());
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

  const reminderKey = (item) => `${item.id}:${item.reminderStage}`;
  const handleSendReminder = (item) => {
    setSentReminders((current) => new Set(current).add(reminderKey(item)));
  };

  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{ p: { xs: 2, md: 3 }, pb: dense ? { xs: 1, md: 1.5 } : undefined }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: dense ? 1 : 2 }}>
          <Iconify icon="eva:bell-outline" color="warning.main" />
          <Typography variant="h6">详细报告待跟进提醒</Typography>
        </Stack>
        {!cases.length && (
          <Stack alignItems="center" spacing={1} sx={{ py: 3, color: 'text.secondary' }}>
            <Iconify icon="eva:checkmark-circle-2-outline" width={32} color="success.main" />
            <Typography variant="body2">当前没有达到提醒时间的详细报告</Typography>
          </Stack>
        )}
        {visibleCases.map((item, index) => {
          const sent = sentReminders.has(reminderKey(item));
          const color = reminderColors[item.reminderStage] || 'warning';

          return (
            <Box key={item.id}>
              {index > 0 && <Divider sx={{ my: dense ? 0.75 : 1.5 }} />}
              <Stack
                direction={{ xs: 'column', lg: 'row' }}
                alignItems={{ lg: 'center' }}
                spacing={{ xs: dense ? 1 : 2, lg: dense ? 2 : 4 }}
                sx={{ p: dense ? 1.25 : 2, border: 1, borderColor: `${color}.light`, bgcolor: `${color}.lighter`, borderRadius: 1.5 }}
              >
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: `${color}.main`, flexShrink: 0 }} />
                <Box sx={{ minWidth: 225 }}>
                  <Typography variant="subtitle2">{item.id}</Typography>
                  <Typography variant="body2">案主简称：{item.initials}</Typography>
                </Box>
                <Info label="辅导员" value={item.counsellor} />
                <Info label="辅导结束" value={item.sessionEndedAt ? item.sessionEndedAt.toLocaleString() : '-'} />
                <Info label="逾期时长" value={item.elapsedSinceEnd} />
                <Info label="提醒等级" value={item.reminderStage} color={`${color}.main`} />
                <Info label="详细报告" value="待完成" color="error.main" />
                <Info label="提醒状态" value={sent ? '已提醒' : '未提醒'} color={sent ? 'success.main' : 'warning.main'} />
                <Box sx={{ flexGrow: 1 }} />
                <Button
                  variant="outlined"
                  disabled={sent}
                  onClick={() => handleSendReminder(item)}
                  startIcon={<Iconify icon={sent ? 'eva:checkmark-outline' : 'eva:paper-plane-outline'} />}
                >
                  {sent ? '已提醒' : '发送提醒'}
                </Button>
              </Stack>
            </Box>
          );
        })}
      </Box>

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
        labelDisplayedRows={({ from, to, count }) => `显示第 ${count === 0 ? 0 : from}–${count === 0 ? 0 : to} 条，共 ${count} 条`}
        getItemAriaLabel={(type) => (type === 'previous' ? '上一页' : '下一页')}
      />
    </Box>
  );
}

function Info({ label, value, color }) {
  return (
    <Box sx={{ minWidth: 110 }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="subtitle2" color={color}>{value}</Typography>
    </Box>
  );
}

Info.propTypes = {
  color: PropTypes.string,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};
PendingFollowUp.propTypes = { cases: PropTypes.array.isRequired };
