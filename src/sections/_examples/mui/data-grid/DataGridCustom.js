import PropTypes from 'prop-types';
import { useState } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import { Stack, Typography, Box, Rating, LinearProgress, IconButton } from '@mui/material';
import { DataGrid, GridToolbar, getGridNumericOperators } from '@mui/x-data-grid';
import { tr, useUiLanguage } from '../../../../locales/translate';
// utils
import { fPercent } from '../../../../utils/formatNumber';
// components
import Label from '../../../../components/label';
import Iconify from '../../../../components/iconify';
import { CustomAvatar } from '../../../../components/custom-avatar';

// ----------------------------------------------------------------------

const columns = [
  // OPTIONS
  // https://mui.com/x/api/data-grid/grid-col-def/#main-content
  // - hide: false (default)
  // - editable: false (default)
  // - filterable: true (default)
  // - sortable: true (default)
  // - disableColumnMenu: false (default)

  // FIELD TYPES
  // --------------------
  // 'string' (default)
  // 'number'
  // 'date'
  // 'dateTime'
  // 'boolean'
  // 'singleSelect'

  {
    field: 'id',
    hide: true,
  },
  {
    field: 'avatar',
    get headerName() { return tr("Avatar"); },
    align: 'center',
    headerAlign: 'center',
    width: 64,
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
    renderCell: (params) => <CustomAvatar name={params.row.name} sx={{ width: 36, height: 36 }} />,
  },
  {
    field: 'name',
    get headerName() { return tr("Name"); },
    flex: 1,
    editable: true,
  },
  {
    field: 'email',
    get headerName() { return tr("Email"); },
    flex: 1,
    editable: true,
    renderCell: (params) => (
      <Typography variant="body2" sx={{ textDecoration: 'underline' }} noWrap>
        {params.row.email}
      </Typography>
    ),
  },
  {
    field: 'lastLogin',
    type: 'dateTime',
    get headerName() { return tr("Last login"); },
    align: 'right',
    headerAlign: 'right',
    width: 200,
  },
  {
    field: 'rating',
    type: 'number',
    get headerName() { return tr("Rating"); },
    width: 160,
    disableColumnMenu: true,
    renderCell: (params) => (
      <Rating size="small" value={params.row.rating} precision={0.5} readOnly />
    ),
  },
  {
    field: 'status',
    type: 'singleSelect',
    get headerName() { return tr("Status"); },
    valueOptions: ['online', 'away', 'busy'],
    align: 'center',
    headerAlign: 'center',
    width: 120,
    renderCell: (params) => RenderStatus(params.row.status),
  },
  {
    field: 'isAdmin',
    type: 'boolean',
    align: 'center',
    headerAlign: 'center',
    width: 120,

    renderCell: (params) =>
      params.row.isAdmin ? (
        <Iconify icon="eva:checkmark-circle-2-fill" sx={{ color: 'primary.main' }} />
      ) : (
        '-'
      ),
  },
  {
    field: 'performance',
    type: 'number',
    get headerName() { return tr("Performance"); },
    align: 'center',
    headerAlign: 'center',
    width: 160,
    renderCell: (params) => (
      <Stack spacing={1} direction="row" alignItems="center" sx={{ px: 1, width: 1, height: 1 }}>
        <LinearProgress
          value={params.row.performance}
          variant="determinate"
          color={
            (params.row.performance < 30 && 'error') ||
            (params.row.performance > 30 && params.row.performance < 70 && 'warning') ||
            'primary'
          }
          sx={{ width: 1, height: 6 }}
        />
        <Typography variant="caption" sx={{ width: 80 }}>
          {fPercent(params.row.performance)}
        </Typography>
      </Stack>
    ),
  },
  {
    field: 'action',
    headerName: ' ',
    align: 'right',
    width: 80,
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
    renderCell: (params) => (
      <IconButton onClick={() => console.log('ID', params.row.id)}>
        <Iconify icon="eva:more-vertical-fill" />
      </IconButton>
    ),
  },
];

// ----------------------------------------------------------------------

DataGridCustom.propTypes = {
  data: PropTypes.array,
};

export default function DataGridCustom({ data }) {
  useUiLanguage();
  const [selectionModel, setSelectionModel] = useState([]);

  if (columns.length > 0) {
    const ratingColumn = columns.find((column) => column.field === 'rating');
    const ratingColIndex = columns.findIndex((col) => col.field === 'rating');

    const ratingFilterOperators = getGridNumericOperators().map((operator) => ({
      ...operator,
      InputComponent: RatingInputValue,
    }));
    columns[ratingColIndex] = {
      ...ratingColumn,
      filterOperators: ratingFilterOperators,
    };
  }

  const selected = data.filter((row) => selectionModel.includes(row.id));

  console.log('SELECTED', selected);

  return (
    <DataGrid
      checkboxSelection
      disableSelectionOnClick
      rows={data}
      columns={columns}
      pagination
      onSelectionModelChange={(newSelectionModel) => {
        setSelectionModel(newSelectionModel);
      }}
      components={{
        Toolbar: GridToolbar,
      }}
    />
  );
}

// ----------------------------------------------------------------------

function RenderStatus(getStatus) {
  useUiLanguage();
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  return (
    <Label
      variant={isLight ? 'soft' : 'filled'}
      color={(getStatus === 'busy' && 'error') || (getStatus === 'away' && 'warning') || 'success'}
      sx={{ mx: 'auto' }}
    >
      {getStatus}
    </Label>
  );
}

// ----------------------------------------------------------------------

RatingInputValue.propTypes = {
  item: PropTypes.object,
  applyValue: PropTypes.func,
};

function RatingInputValue({ item, applyValue }) {
  useUiLanguage();
  return (
    <Box sx={{ p: 1, height: 1, alignItems: 'flex-end', display: 'flex' }}>
      <Rating
        size="small"
        precision={0.5}
        placeholder={tr("Filter value")}
        value={Number(item.value)}
        onChange={(event, newValue) => {
          applyValue({ ...item, value: newValue });
        }}
      />
    </Box>
  );
}
