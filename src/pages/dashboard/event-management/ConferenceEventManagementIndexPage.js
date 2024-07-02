import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

// @mui
import { useTheme } from '@mui/material/styles';
import { Container, Grid, Button, Card, Tabs, Tab, Divider, Table, TableContainer, TableBody, Tooltip, IconButton, } from '@mui/material';

// components
import { useSettingsContext } from '../../../components/settings';
import Iconify from '../../../components/iconify';
import Scrollbar from '../../../components/scrollbar';
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs/CustomBreadcrumbs';
import {
    useTable,
    getComparator,
    emptyRows,
    TableNoData,
    TableEmptyRows,
    TableHeadCustom,
    TableSelectedAction,
    TablePaginationCustom,
} from '../../../components/table';
import { EventTableRow, EventTableToolbar } from './components/TableComponent';
import {
    EcommerceWidgetSummary,
} from '../../../sections/@dashboard/general/e-commerce';
import ConfirmDialog from '../../../components/confirm-dialog';

// redux
import { useSelector, useDispatch } from "../../../redux/store"
// import { fetchFormTypes } from '../../../redux/slices/form';

// auth
import { useAuthContext } from '../../../auth/useAuthContext';

// path
import { PATH_CONFERENCE_MANAGEMENT } from '../../../routes/paths';

// _data | _mocks
import { _events } from './components/_mock/_event';

const TABLE_TABS = ['all', 'ongoing', 'incoming'];

const TABLE_HEAD = [
    { id: 'EventName', label: 'Name', align: 'left' },
    { id: 'EventType', label: 'Event/Conference', align: 'left' },
    { id: 'EventStartDatetime', label: 'Basic Info', align: 'left' },
    { id: 'Participants', label: 'Participants', align: 'center' },
    { id: 'Status', label: 'Status', align: 'left' },
    { id: '' },
];

const LOCATION_OPTIONS = [
    'All',
    'Physical & Virtual',
    'Physical',
    'Virtual',
];

// ----------------------------------------------------------------------

export default function ConferenceEventManagementIndexPage() {
    const { user } = useAuthContext();
    const {
        dense,
        page,
        order,
        orderBy,
        rowsPerPage,
        setPage,
        //
        selected,
        setSelected,
        onSelectRow,
        onSelectAllRows,
        //
        onSort,
        onChangeDense,
        onChangePage,
        onChangeRowsPerPage,
    } = useTable();

    // redux management
    const dispatch = useDispatch();
    // const { formTypes } = useSelector((state) => state.formStructure);

    // useEffect(() => {
    //     dispatch(fetchFormTypes());

    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [dispatch]);

    // useEffect(() => {
    //     console.log(formTypes)

    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [formTypes]);
    // redux management


    const theme = useTheme();
    const { themeStretch } = useSettingsContext();

    const navigate = useNavigate();

    const [tableData, setTableData] = useState(_events);

    const [openConfirm, setOpenConfirm] = useState(false);

    const [filterName, setFilterName] = useState('');

    const [filterLocation, setFilterLocation] = useState('All');

    const [filterStatus, setFilterStatus] = useState('all');

    const dataFiltered = applyFilter({
        inputData: tableData,
        comparator: getComparator(order, orderBy),
        filterName,
        filterLocation,
        filterStatus,
    });

    const dataInPage = dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const denseHeight = dense ? 52 : 72;

    const isFiltered = filterName !== '' || filterLocation !== 'All' || filterStatus !== 'all';

    const isNotFound =
        (!dataFiltered.length && !!filterName) ||
        (!dataFiltered.length && !!filterLocation) ||
        (!dataFiltered.length && !!filterStatus);

    const handleOpenConfirm = () => {
        setOpenConfirm(true);
    };

    const handleCloseConfirm = () => {
        setOpenConfirm(false);
    };

    const handleFilterStatus = (event, newValue) => {
        setPage(0);
        setFilterStatus(newValue);
    };

    const handleFilterName = (event) => {
        setPage(0);
        setFilterName(event.target.value);
    };

    const handleFilterLocation = (event) => {
        setPage(0);
        setFilterLocation(event.target.value);
    };

    const handleDeleteRow = (id) => {
        setTableData(prev => {
            const index = tableData.findIndex(row => Number(row.EventID) === Number(id))
            prev[index].Status = "cancelled"

            setSelected([]);
            return prev
        })
        // const deleteRow = tableData.filter((row) => row.EventID !== id);
        // setSelected([]);
        // setTableData(deleteRow);

        if (page > 0) {
            if (dataInPage.length < 2) {
                setPage(page - 1);
            }
        }
    };

    const handleDeleteRows = (selectedRows) => {
        console.log(selectedRows)
        // const deleteRows = tableData.filter((row) => !selectedRows.includes(row.EventID));
        // setSelected([]);
        // setTableData(deleteRows);

        // if (page > 0) {
        //     if (selectedRows.length === dataInPage.length) {
        //         setPage(page - 1);
        //     } else if (selectedRows.length === dataFiltered.length) {
        //         setPage(0);
        //     } else if (selectedRows.length > dataInPage.length) {
        //         const newPage = Math.ceil((tableData.length - selectedRows.length) / rowsPerPage) - 1;
        //         setPage(newPage);
        //     }
        // }
    };

    const handleEditRow = (id) => {
        // navigate(PATH_DASHBOARD.user.edit(paramCase(id)));
    };

    const handleResetFilter = () => {
        setFilterName('');
        setFilterLocation('All');
        setFilterStatus('all');
    };



    return (
        <>
            <Helmet>
                <title> Dashboard | Conference Management </title>
            </Helmet>

            <Container maxWidth={themeStretch ? false : 'xl'}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <EcommerceWidgetSummary
                            title="Happening Today"
                            percent={0.6}
                            total={4876}
                            chart={{
                                colors: [theme.palette.warning.main],
                                series: [40, 70, 75, 70, 50, 28, 7, 64, 38, 27],
                            }}
                        />
                    </Grid>


                    <Grid item xs={12} md={3}>
                        <EcommerceWidgetSummary
                            title="Incoming"
                            percent={2.6}
                            total={765}
                            chart={{
                                colors: [theme.palette.primary.main],
                                series: [22, 8, 35, 50, 82, 84, 77, 12, 87, 43],
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <EcommerceWidgetSummary
                            title="This Month"
                            percent={-0.1}
                            total={18765}
                            chart={{
                                colors: [theme.palette.info.main],
                                series: [56, 47, 40, 62, 73, 30, 23, 54, 67, 68],
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={12}>
                        <Grid container>
                            <Grid item xs={12} md={12}>
                                <CustomBreadcrumbs
                                    heading="Conference Management"
                                    links={[
                                        { name: 'Dashboard', href: PATH_CONFERENCE_MANAGEMENT.root },
                                        { name: 'Conference Management', href: PATH_CONFERENCE_MANAGEMENT.conference.root },

                                    ]}
                                    action={
                                        <Button
                                            component={RouterLink}
                                            to={PATH_CONFERENCE_MANAGEMENT.conference.form}
                                            variant="contained"
                                            startIcon={<Iconify icon="eva:plus-fill" />}
                                        >
                                            Create Conference
                                        </Button>
                                    }
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>

                <Card>
                    <Tabs
                        value={filterStatus}
                        onChange={handleFilterStatus}
                        sx={{
                            px: 2,
                            bgcolor: 'background.neutral',
                        }}
                    >
                        {TABLE_TABS.map((tab) => (
                            <Tab key={tab} label={tab} value={tab} />
                        ))}
                    </Tabs>

                    <Divider />

                    <EventTableToolbar
                        isFiltered={isFiltered}
                        filterName={filterName}
                        filterLocation={filterLocation}
                        options={LOCATION_OPTIONS}
                        onFilterName={handleFilterName}
                        onFilterLocation={handleFilterLocation}
                        onResetFilter={handleResetFilter}
                    />

                    <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
                        {/* <TableSelectedAction
                            dense={dense}
                            numSelected={selected.length}
                            rowCount={dataFiltered.length}
                            onSelectAllRows={(checked) =>
                                onSelectAllRows(
                                    checked,
                                    dataFiltered.map((row) => row.EventID)
                                )
                            }
                            action={
                                <Tooltip title="Archived">
                                    <IconButton color="primary" onClick={handleOpenConfirm}>
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
                                    rowCount={dataFiltered.length}
                                    numSelected={selected.length}
                                    onSort={onSort}
                                    onSelectAllRows={null}  // disabled checkbox to select all
                                // onSelectAllRows={(checked) =>
                                //     onSelectAllRows(
                                //         checked,
                                //         dataFiltered.map((row) => row.EventID)
                                //     )
                                // }
                                />

                                <TableBody>
                                    {dataFiltered
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((row) => (
                                            <EventTableRow
                                                key={row.EventID}
                                                row={row}
                                                selected={selected.includes(row.EventID)}
                                                onSelectRow={() => onSelectRow(row.EventID)}
                                                onDeleteRow={() => handleDeleteRow(row.EventID)}
                                                onEditRow={() => handleEditRow(row.EventName)}
                                            />
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
                        dense={dense}
                        onChangeDense={onChangeDense}
                    />
                </Card>

            </Container>

            <ConfirmDialog
                open={openConfirm}
                onClose={handleCloseConfirm}
                title="Resend Survey"
                content="Are you sure want to send again?"
                action={
                    <Button variant="contained" color="primary" onClick={handleDeleteRows}>
                        Archived
                    </Button>
                }
            />
        </>
    );
}

function applyFilter({ inputData, comparator, filterName, filterStatus, filterLocation }) {
    const stabilizedThis = inputData.map((el, index) => [el, index]);

    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });

    inputData = stabilizedThis.map((el) => el[0]);

    if (filterName) {
        inputData = inputData.filter(
            (data) => data.EventName.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
        );
    }

    if (filterStatus !== 'all') {
        inputData = inputData.filter((data) => data.Status === filterStatus);
    }

    if (filterLocation !== 'All') {
        inputData = inputData.filter((data) => data.EventLocationType === filterLocation);
    }

    return inputData;
}
