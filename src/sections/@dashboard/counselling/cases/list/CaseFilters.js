import PropTypes from 'prop-types';
import { Box, Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import Iconify from '../../../../../components/iconify';

// 中文原文：全部
const ALL = 'All';
const selectSx = {
  minWidth: { xs: 1, sm: 180 },
  '& .MuiOutlinedInput-root': { bgcolor: 'background.paper' },
};

export default function CaseFilters({ filters, options, onChange, onReset }) {
  const update = (field) => (event) => onChange(field, event.target.value);
  const selects = [
    // 中文原文：值班类别、个案类别、状态、接案未完成、待简要报告、待详细报告、全部完成
    ['sessionMode', 'Session Mode', [ALL, ...options.sessionModes]],
    ['category', 'Case Category', [ALL, ...options.categories]],
    ['status', 'Status', [ALL, 'Intake Incomplete', 'Brief Report Pending', 'Detailed Report Pending', 'Completed']],
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, border: 1, borderColor: 'divider', borderRadius: 2 }}>
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems={{ lg: 'flex-end' }}>
        <TextField
          value={filters.search}
          onChange={update('search')}
          placeholder="Search case number / client initials / counsellor"
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
          {/* 中文原文：筛选、重置 */}
          <Button variant="outlined" startIcon={<Iconify icon="eva:funnel-outline" />}>Filter</Button>
          <Button color="inherit" variant="outlined" startIcon={<Iconify icon="eva:refresh-fill" />} onClick={onReset}>Reset</Button>
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
