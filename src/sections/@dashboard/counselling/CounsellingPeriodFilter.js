import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { isAfter, isValid } from 'date-fns';
import { DatePicker } from '@mui/x-date-pickers';
import {
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import Iconify from '../../../components/iconify';

CounsellingPeriodFilter.propTypes = {
  customEnd: PropTypes.instanceOf(Date).isRequired,
  customStart: PropTypes.instanceOf(Date).isRequired,
  mode: PropTypes.oneOf(['month', 'year', 'custom']).isRequired,
  month: PropTypes.string.isRequired,
  monthOptions: PropTypes.arrayOf(PropTypes.string).isRequired,
  onCustomApply: PropTypes.func.isRequired,
  onModeChange: PropTypes.func.isRequired,
  onMonthChange: PropTypes.func.isRequired,
  onYearChange: PropTypes.func.isRequired,
  year: PropTypes.string.isRequired,
  yearOptions: PropTypes.arrayOf(PropTypes.string).isRequired,
};

function formatMonthLabel(month) {
  const [year, monthNumber] = month.split('-');
  return `${year}年${Number(monthNumber)}月`;
}

export default function CounsellingPeriodFilter({
  mode,
  month,
  year,
  customStart,
  customEnd,
  monthOptions,
  yearOptions,
  onModeChange,
  onMonthChange,
  onYearChange,
  onCustomApply,
}) {
  const [draftStart, setDraftStart] = useState(customStart);
  const [draftEnd, setDraftEnd] = useState(customEnd);

  useEffect(() => {
    setDraftStart(customStart);
    setDraftEnd(customEnd);
  }, [customEnd, customStart]);

  const hasValidDates =
    draftStart && draftEnd && isValid(draftStart) && isValid(draftEnd);
  const isRangeError = hasValidDates && isAfter(draftStart, draftEnd);

  const handleStartChange = (value) => {
    setDraftStart(value);
    if (value && draftEnd && isValid(value) && isValid(draftEnd) && !isAfter(value, draftEnd)) {
      onCustomApply(value, draftEnd);
    }
  };

  const handleEndChange = (value) => {
    setDraftEnd(value);
    if (draftStart && value && isValid(draftStart) && isValid(value) && !isAfter(draftStart, value)) {
      onCustomApply(draftStart, value);
    }
  };

  return (
    <Stack
  direction={{ xs: 'column', md: 'row' }}
  spacing={1.5}
  alignItems={{ xs: 'stretch', md: 'center' }}
>
      <ToggleButtonGroup
        exclusive
        size="small"
        value={mode}
        onChange={(_, value) => value && onModeChange(value)}
        aria-label="筛选期间模式"
      >
        <ToggleButton value="month">月</ToggleButton>
        <ToggleButton value="year">年</ToggleButton>
        <ToggleButton value="custom">Custom</ToggleButton>
      </ToggleButtonGroup>

      {mode === 'month' && (
        <TextField
          select
          size="small"
          label="选择月份"
          value={month}
          onChange={(event) => onMonthChange(event.target.value)}
          sx={{ minWidth: 220 }}
          InputProps={{
            startAdornment: <Iconify icon="eva:calendar-outline" width={22} sx={{ mr: 1 }} />,
          }}
        >
          {monthOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {formatMonthLabel(option)}
            </MenuItem>
          ))}
        </TextField>
      )}

      {mode === 'year' && (
        <TextField
          select
          size="small"
          label="选择年份"
          value={year}
          onChange={(event) => onYearChange(event.target.value)}
          sx={{ minWidth: 220 }}
          InputProps={{
            startAdornment: <Iconify icon="eva:calendar-outline" width={22} sx={{ mr: 1 }} />,
          }}
        >
          {yearOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}年
            </MenuItem>
          ))}
        </TextField>
      )}

      {mode === 'custom' && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'flex-start' }}>
          <DatePicker
            label="开始日期"
            value={draftStart}
            onChange={handleStartChange}
            renderInput={(params) => (
              <TextField {...params} size="small" error={Boolean(isRangeError)} />
            )}
          />
          <DatePicker
            label="结束日期"
            value={draftEnd}
            onChange={handleEndChange}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                error={Boolean(isRangeError)}
                helperText={isRangeError ? '结束日期不能早于开始日期' : ''}
              />
            )}
          />
        </Stack>
      )}
    </Stack>
  );
}
