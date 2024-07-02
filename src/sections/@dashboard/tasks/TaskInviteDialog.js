import PropTypes from 'prop-types';
// @mui
import {
  Tab,
  Tabs,
  Card,
  List,
  Table,
  Stack,
  Dialog,
  Button,
  Tooltip,
  Divider,
  TextField,
  TableBody,
  Container,
  IconButton,
  TableContainer,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';
import { useState, useEffect } from 'react';
// components
import Iconify from '../../../components/iconify';
import Scrollbar from '../../../components/scrollbar';
import ConfirmDialog from '../../../components/confirm-dialog';
//
import {
  useTable,
  emptyRows,
  TableNoData,
  TableToolbar,
  getComparator,
  TableEmptyRows,
  TableRowCustom,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from '../../../components/table';
import { useSettingsContext } from '../../../components/settings';
import TaskInvitedItem from './TaskInvitedItem';
import { useDispatch, useSelector } from '../../../redux/store';
// ----------------------------------------------------------------------

TaskInviteDialog.propTypes = {
  open: PropTypes.bool,
  paper: PropTypes.object,
  onClose: PropTypes.func,
  shared: PropTypes.array,
  onCopyLink: PropTypes.func,
  inviteEmail: PropTypes.string,
  onChangeInvite: PropTypes.func,
  onClickAssignTask: PropTypes.func,
};

const STATUS_OPTIONS = ['all', 'active', 'banned'];

const ROLE_OPTIONS = [
  'all',
  'ux designer',
  'full stack designer',
  'backend developer',
  'project manager',
  'leader',
  'ui designer',
  'ui/ux designer',
  'front end developer',
  'full stack developer',
];

const TABLE_HEAD = [
  { id: 'UserPicture', type: 'Avatar', subtext: '', label: '', align: 'left', width: '5%' },
  {
    id: 'UserFullName',
    type: 'Typography',
    subtext: '',
    label: 'Editor',
    align: 'left',
    width: '30%',
  },
  {
    id: 'UserEmailAddress',
    type: 'Typography',
    subtext: '',
    label: 'Email',
    align: 'left',
    width: '15%',
  },
  {
    id: 'UserInstituition',
    type: 'Typography',
    subtext: '',
    label: 'Institution',
    align: 'left',
    width: '15%',
  },
  {
    id: 'UserExpertise',
    type: 'Typography',
    subtext: '',
    label: 'Expert Field',
    align: 'center',
    width: '20%',
  },
  { id: '', type: 'Additional', subtext: '', label: 'Action', align: 'left', width: '10%' },
];

export default function TaskInviteDialog({
  paper,
  shared,
  inviteEmail,
  onCopyLink,
  onChangeInvite,
  open,
  onClose,
  onClickAssignTask,
  ...other
}) {
  const {
    dense,
    page,
    order,
    orderBy,
    rowsPerPage,
    setPage,
    selected,
    setSelected,
    onSelectRow,
    onSelectAllRows,
    onSort,
    onChangeDense,
    onChangePage,
    onChangeRowsPerPage,
    defaultOrderBy,
  } = useTable();

  const dispatch = useDispatch();

  const dataArr = [];

  shared.map((elem) => dataArr.push(false));

  const { themeStretch } = useSettingsContext();

  const hasShared = shared && !!shared.length;

  const [tableData, setTableData] = useState(shared);

  const [openConfirm, setOpenConfirm] = useState(dataArr);

  const [filterName, setFilterName] = useState('');

  const [filterRole, setFilterRole] = useState('all');

  const [filterStatus, setFilterStatus] = useState('all');

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(order, orderBy),
    filterName,
    filterRole,
    filterStatus,
  });

  const dataInPage = dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const denseHeight = dense ? 52 : 72;

  const isFiltered = filterName !== '' || filterRole !== 'all' || filterStatus !== 'all';

  const isNotFound =
    (!dataFiltered.length && !!filterName) ||
    (!dataFiltered.length && !!filterRole) ||
    (!dataFiltered.length && !!filterStatus);

  const handleFilterStatus = (event, newValue) => {
    setPage(0);
    setFilterStatus(newValue);
  };

  const handleFilterName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const handleFilterRole = (event) => {
    setPage(0);
    setFilterRole(event.target.value);
  };

  const handleResetFilter = () => {
    setFilterName('');
    setFilterRole('all');
    setFilterStatus('all');
  };

  const onClickAssign = (user, paperdetail) => {
    onClickAssignTask(user, paperdetail);
    handleCloseConfirm();
  };

  const handleOpenConfirm = (index) => {
    console.log('index', index)
    const openDetailsTemp = [];
    dataFiltered.map((elem, idx) =>
      idx === index ? openDetailsTemp.push(true) : openDetailsTemp.push(false)
    );
    setOpenConfirm(openDetailsTemp);
    console.log(openDetailsTemp)
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  return (
    <Dialog fullWidth maxWidth="lg" open={open} onClose={onClose} {...other}>
      <DialogTitle> Invite Reviewer </DialogTitle>

      <DialogContent sx={{ overflow: 'unset' }} fullWidth>
        <Container>
          <Card>
            {/* <Tabs
              value={filterStatus}
              onChange={handleFilterStatus}
              sx={{
                px: 2,
                bgcolor: 'background.neutral',
              }}
            >
              {STATUS_OPTIONS.map((tab) => (
                <Tab key={tab} label={tab} value={tab} />
              ))}
            </Tabs> */}

            <Divider />

            <TableToolbar
              isFiltered={isFiltered}
              filterName={filterName}
              optionsRole={ROLE_OPTIONS}
              onFilterName={handleFilterName}
              onResetFilter={handleResetFilter}
            />

            <TableContainer sx={{ position: 'relative', overflow: 'unset', margin: 0 }}>
              {/* <TableSelectedAction
                dense={dense}
                numSelected={selected.length}
                rowCount={tableData.length}
                onSelectAllRows={(checked) =>
                  onSelectAllRows(
                    checked,
                    tableData.map((row) => row.StaffID)
                  )
                }
                action={
                  <Tooltip title="Delete">
                    <IconButton color="primary">
                      <Iconify icon="eva:trash-2-outline" />
                    </IconButton>
                  </Tooltip>
                }
              /> */}

              <Scrollbar>
                <Table size={dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
                  <TableHeadCustom
                    order={order}
                    orderBy={orderBy}
                    headLabel={TABLE_HEAD}
                    rowCount={tableData.length}
                    numSelected={selected.length}
                    onSort={onSort}
                  />
                  <TableBody>
                    {dataFiltered
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row, index) => (
                        <>
                          {console.log("userssss", row)}
                          <TableRowCustom
                            key={row.UserID}
                            row={row}
                            headLabel={TABLE_HEAD}
                            selected={selected.includes(row.UserID)}
                            onSelectRow={() => onSelectRow(row.UserID)}
                            additionalRow={
                              <>
                                <Button
                                  variant="contained"
                                  size="small"
                                  sx={{ margin: 0.5 }}
                                  onClick={() => handleOpenConfirm(index)}
                                  startIcon={<Iconify icon="material-symbols:add" />}
                                >
                                  Add
                                </Button>
                              </>
                            }
                          // onEditRow={() => handleEditRow(row.StaffID)}
                          />
                          <ConfirmDialog
                            open={openConfirm[index]}
                            onClose={handleCloseConfirm}
                            title="Invitation comfirmation"
                            content={`Are you sure want to assign to ${row.UserFullName} to be editor members of ${paper.PaperTitle}?`}
                            action={
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={() => onClickAssign(row, paper)}
                              >
                                Add
                              </Button>
                            }
                          />
                        </>
                      ))}

                    <TableEmptyRows
                      height={denseHeight}
                      emptyRows={emptyRows(page, rowsPerPage, tableData.length)}
                    />

                    <TableNoData isNotFound={isNotFound} />
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>

            <TablePaginationCustom
              count={dataFiltered.length}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={onChangePage}
              onRowsPerPageChange={onChangeRowsPerPage}
              //
              dense={dense}
              onChangeDense={onChangeDense}
            />
          </Card>
        </Container>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between' }}>
        {onCopyLink && (
          <Button startIcon={<Iconify icon="eva:link-2-fill" />} onClick={onCopyLink}>
            Copy link
          </Button>
        )}

        {onClose && (
          <Button variant="outlined" color="inherit" onClick={onClose}>
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

function applyFilter({ inputData, comparator, filterName, filterStatus, filterRole }) {
  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (filterName) {
    inputData = inputData.filter(
      (user) => user.UserFullName.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
    );
  }

  if (filterStatus !== 'all') {
    inputData = inputData.filter((user) => user.StaffStatus === filterStatus);
  }

  if (filterRole !== 'all') {
    inputData = inputData.filter((user) => user.RoleID === filterRole);
  }

  return inputData;
}
