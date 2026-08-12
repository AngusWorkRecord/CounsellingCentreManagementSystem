import PropTypes from 'prop-types';
import { Box, Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import Iconify from '../../../../components/iconify';

const ALL = '全部';
const selectSx = {
  minWidth: { xs: 1, sm: 180 },
  '& .MuiOutlinedInput-root': { bgcolor: 'background.paper' },
};

export default function CaseFilters({ filters, options, onChange, onReset }) {
  const update = (field) => (event) => onChange(field, event.target.value);
  const selects = [
    ['sessionMode', '值班类别', [ALL, ...options.sessionModes]],
    ['category', '个案类别', [ALL, ...options.categories]],
    ['status', '状态', [ALL, '接案未完成', '待简要报告', '待详细报告', '全部完成']],
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, border: 1, borderColor: 'divider', borderRadius: 2 }}>
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems={{ lg: 'flex-end' }}>
        <TextField
          value={filters.search}
          onChange={update('search')}
          placeholder="搜索个案编号 / 案主简称 / 辅导员"
          sx={{ minWidth: { lg: 330 }, flexGrow: 1 }}
          InputProps={{ startAdornment: <Iconify icon="eva:search-fill" sx={{ mr: 1, color: 'text.disabled' }} /> }}
        />

        {selects.map(([field, label, values]) => (
          <Box key={field} sx={selectSx}>
            <Typography variant="subtitle2" sx={{ mb: 0.75 }}>{label}</Typography>
            <TextField select fullWidth value={filters[field]} onChange={update(field)}>
              {values.map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
            </TextField>
          </Box>
        ))}

        <Stack direction="row" spacing={1.5} sx={{ pb: { lg: 0.1 } }}>
          <Button variant="outlined" startIcon={<Iconify icon="eva:funnel-outline" />}>筛选</Button>
          <Button color="inherit" variant="outlined" startIcon={<Iconify icon="eva:refresh-fill" />} onClick={onReset}>重置</Button>
        </Stack>
      </Stack>
    </Box>
  );
}

CaseFilters.propTypes = {
  filters: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  options: PropTypes.shape({
    categories: PropTypes.arrayOf(PropTypes.string).isRequired,
    sessionModes: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
};
