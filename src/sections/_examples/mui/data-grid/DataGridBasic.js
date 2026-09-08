import PropTypes from 'prop-types';
// @mui
import { DataGrid } from '@mui/x-data-grid';
import { IconButton } from '@mui/material';
import { tr, useUiLanguage } from '../../../../locales/translate';
// components
import Iconify from '../../../../components/iconify';

// ----------------------------------------------------------------------

const columns = [
  {
    field: 'id',
    headerName: 'ID',
    width: 120,
  },
  {
    field: 'firstName',
    get headerName() { return tr("First name"); },
    width: 160,
    editable: true,
  },
  {
    field: 'lastName',
    get headerName() { return tr("Last name"); },
    width: 160,
    editable: true,
  },
  {
    field: 'age',
    get headerName() { return tr("Age"); },
    type: 'number',
    width: 120,
    editable: true,
    align: 'center',
    headerAlign: 'center',
  },
  {
    field: 'fullName',
    get headerName() { return tr("Full name"); },
    get description() { return tr("This column has a value getter and is not sortable."); },
    flex: 1,
    valueGetter: (params) => `${params.row.firstName || ''} ${params.row.lastName || ''}`,
  },
  {
    field: 'action',
    headerName: ' ',
    width: 80,
    align: 'right',
    sortable: false,
    disableColumnMenu: true,
    renderCell: () => (
      <IconButton>
        <Iconify icon="eva:more-vertical-fill" />
      </IconButton>
    ),
  },
];

DataGridBasic.propTypes = {
  data: PropTypes.array,
};

export default function DataGridBasic({ data }) {
  useUiLanguage();
  return <DataGrid columns={columns} rows={data} checkboxSelection disableSelectionOnClick />;
}
