import PropTypes from 'prop-types';
// @mui
import { Stack, InputAdornment, TextField, MenuItem, Button } from '@mui/material';
// components
import Iconify from '../../../../../components/iconify'

// ----------------------------------------------------------------------

SurveyTableToolbar.propTypes = {
  isFiltered: PropTypes.bool,
  filterName: PropTypes.string,
  filterLocation: PropTypes.string,
  onFilterName: PropTypes.func,
  onFilterLocation: PropTypes.func,
  onResetFilter: PropTypes.func,
  options: PropTypes.arrayOf(PropTypes.string),
};

export default function SurveyTableToolbar({
  isFiltered,
  filterName,
  filterLocation,
  options,
  onFilterName,
  onFilterLocation,
  onResetFilter,
}) {
  return (
    <Stack
      spacing={2}
      alignItems="center"
      direction={{
        xs: 'column',
        sm: 'row',
      }}
      sx={{ px: 2.5, py: 3 }}
    >
      <TextField
        fullWidth
        select
        label="Location"
        value={filterLocation}
        onChange={onFilterLocation}
        size="small"
        SelectProps={{
          MenuProps: {
            PaperProps: {
              sx: {
                maxHeight: 260,
              },
            },
          },
        }}
        sx={{
          maxWidth: { sm: 240 },
          textTransform: 'capitalize',
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={option}
            value={option}
            sx={{
              mx: 1,
              borderRadius: 0.75,
              typography: 'body2',
              textTransform: 'capitalize',
            }}
          >
            {option}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        fullWidth
        value={filterName}
        onChange={onFilterName}
        placeholder="Search..."
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
        }}
      />

      {isFiltered && (
        <Button
          color="error"
          sx={{ flexShrink: 0 }}
          onClick={onResetFilter}
          startIcon={<Iconify icon="eva:trash-2-outline" />}
        >
          Clear
        </Button>
      )}
    </Stack>
  );
}
