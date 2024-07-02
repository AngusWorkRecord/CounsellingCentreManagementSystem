import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

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
import { SurveyTableRow, SurveyTableToolbar } from './components/TableComponent';

// path
import { PATH_CONFERENCE_MANAGEMENT } from '../../../routes/paths';

// _data | _mocks
import { _survey } from './components/_mock/_survey';
import ConfirmDialog from '../../../components/confirm-dialog';

// auth
import { useAuthContext } from '../../../auth/useAuthContext';

const TABLE_TABS = ['active', 'archived'];

const TABLE_HEAD = [
    { id: 'FormTitle', label: 'Title', align: 'left' },
    { id: 'FormType', label: 'Type', align: 'left' },
    // { id: 'Respondent', label: 'Respondent', align: 'center' },
    { id: 'isArchived', label: 'Status', align: 'left' },
    { id: '' },
];

const LOCATION_OPTIONS = [
    'Destination Awareness',
    'Government Commitment',
    'Sarawak Business Event(BE) Brand',
    'Inter-organizational Collaboration',
    'Service Quality and Standards',
    'Business Events(BE) Sector Advancement',
    'Organization and HR Development',
    'Social Legacy',
    'Environment Conservation',
    'Community Buy-in'
];

// ----------------------------------------------------------------------

export default function SurveyManagementIndexPage() {
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

    const theme = useTheme();
    const { themeStretch } = useSettingsContext();

    const navigate = useNavigate();

    const [tableData, setTableData] = useState(_survey);

    const [openConfirm, setOpenConfirm] = useState(false);

    const [filterName, setFilterName] = useState('');

    const [filterLocation, setFilterLocation] = useState('All');

    const [filterStatus, setFilterStatus] = useState('active');

    const dataFiltered = applyFilter({
        inputData: tableData,
        comparator: getComparator(order, orderBy),
        filterName,
        filterLocation,
        filterStatus,
    });

    const dataInPage = dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const denseHeight = dense ? 52 : 72;

    const isFiltered = filterName !== '' || filterLocation !== 'all' || filterStatus !== 'active';

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

    // TODOS: Add delete APIs on this
    const handleDeleteRow = (id) => {
        setTableData(prev => {
            const index = tableData.findIndex((row) => row.FormID === id);
            prev[index].isArchived = "archived"

            setSelected([]);
            return prev
        })

        if (page > 0) {
            if (dataInPage.length < 2) {
                setPage(page - 1);
            }
        }
    };

    // TODOS: Add delete APIs on this
    const handleDeleteRows = (selectedRows) => {
        try {
            setTableData(prev => {
                const selectedIDs = selected.map(x => Number(x))
                // const deleteRows = prev.filter((row) => selectedIDs.includes(Number(row.FormID)));
                // prev.forEach((row) => {
                //     if (selectedIDs.includes(Number(row.FormID))) {
                //         return row.isArchived = "archived"
                //     }
                // })

                setSelected([])
                setOpenConfirm(false)
                return prev
            })

        }
        catch (error) {
            console.error(error)
        }

        if (page > 0) {
            if (selectedRows.length === dataInPage.length) {
                setPage(page - 1);
            } else if (selectedRows.length === dataFiltered.length) {
                setPage(0);
            } else if (selectedRows.length > dataInPage.length) {
                const newPage = Math.ceil((tableData.length - selectedRows.length) / rowsPerPage) - 1;
                setPage(newPage);
            }
        }
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
                <title> Dashboard | Survey Management </title>
            </Helmet>

            <Container maxWidth={themeStretch ? false : 'xl'}>
                <Grid container spacing={3}>

                    <Grid item xs={12} md={12}>
                        <Grid container>
                            <Grid item xs={12} md={12}>
                                <CustomBreadcrumbs
                                    heading="Survey Management"
                                    links={[
                                        { name: 'Dashboard', href: PATH_CONFERENCE_MANAGEMENT.root },
                                        { name: 'Survey Management', href: PATH_CONFERENCE_MANAGEMENT.survey.root },

                                    ]}
                                    action={
                                        <Button
                                            component={RouterLink}
                                            to={PATH_CONFERENCE_MANAGEMENT.survey.form}
                                            variant="contained"
                                            startIcon={<Iconify icon="eva:plus-fill" />}
                                        >
                                            Create Survey
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

                    <SurveyTableToolbar
                        isFiltered={isFiltered}
                        filterName={filterName}
                        filterLocation={filterLocation}
                        options={LOCATION_OPTIONS}
                        onFilterName={handleFilterName}
                        onFilterLocation={handleFilterLocation}
                        onResetFilter={handleResetFilter}
                    />

                    <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
                        <TableSelectedAction
                            dense={dense}
                            numSelected={selected.length}
                            rowCount={dataFiltered.length}
                            onSelectAllRows={(checked) =>
                                onSelectAllRows(
                                    checked,
                                    dataFiltered.map((row) => row.FormID)
                                )
                            }
                            action={
                                <Tooltip title="Archive">
                                    <IconButton color="primary" onClick={handleOpenConfirm}>
                                        <Iconify icon="eva:trash-2-outline" />
                                    </IconButton>
                                </Tooltip>
                            }
                        />

{console.log("dataFiltered", dataFiltered)}
                        <Scrollbar>
                            <Table size={dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
                                <TableHeadCustom
                                    order={order}
                                    orderBy={orderBy}
                                    headLabel={TABLE_HEAD}
                                    rowCount={dataFiltered.length}
                                    numSelected={selected.length}
                                    onSort={onSort}
                                    onSelectAllRows={(checked) =>
                                        onSelectAllRows(
                                            checked,
                                            dataFiltered.map((row) => row.FormID)
                                        )
                                    }
                                />

                             <TableBody> 
                                    {dataFiltered
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((row) => (
                                            <SurveyTableRow
                                                key={row.FormID}
                                                row={row}
                                                selected={selected.includes(row.FormID)}
                                                onSelectRow={() => onSelectRow(row.FormID)}
                                                onDeleteRow={() => handleDeleteRow(row.FormID)}
                                                onEditRow={() => handleEditRow(row.FormTitle)}
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
                title="Confirm to Achieve"
                content="Are you sure want to archive it?"
                action={
                    <Button variant="contained" color="primary" onClick={handleDeleteRows}>
                        Confirm
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
            (data) => data.FormTitle.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
        );
    }

    if (filterStatus !== 'all') {
        inputData = inputData.filter((data) => data.isArchived === filterStatus);
    }

    if (filterLocation !== 'All') {
        inputData = inputData.filter((data) => data.FormType === filterLocation);
    }

    return inputData;
}
