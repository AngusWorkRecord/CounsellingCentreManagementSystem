import { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Card, Dialog, DialogContent, DialogTitle, Divider, FormControlLabel, Grid, IconButton, Link, Radio, Stack, Switch, Tab, Table, TableBody, TableContainer, Tabs, Tooltip, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { paramCase } from 'change-case';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

// components 
import { ParticipantTableRow, ParticipantTableToolbar } from './ParticipantTableComponent';
import {
    useTable,
    getComparator,
    emptyRows,
    TableNoData,
    TableEmptyRows,
    TableHeadCustom,
    TableSelectedAction,
    TablePaginationCustom,
} from '../../../../components/table';

import Iconify from '../../../../components/iconify';
import Scrollbar from '../../../../components/scrollbar';
import Label from '../../../../components/label';

// _mock_
import { _participant } from './ParticipantTableComponent/_mock/_participants';

// library
import { isStringNullOrEmpty } from '../../../../utils/Helpers';
import Markdown from '../../../../components/markdown/Markdown';

SurveyInfoDialog.propTypes = {
    open: PropTypes.bool,
    title: PropTypes.node,
    event: PropTypes.object,
    handleClose: PropTypes.func,
};

const STATUS_OPTIONS = ['all', 'unsent', 'sent'];

const TABLE_HEAD = [
    { id: 'ParticipantName', label: 'Participant', align: 'left' },
    { id: 'EmailAddress', label: 'Email', align: 'left' },
    // { id: 'Institution', label: 'Institution', align: 'left' },
    { id: 'AttendanceType', label: 'AttendanceType', align: 'left' },
    // { id: 'isRequiredCertificate', label: 'Certificate?', align: 'center' },
    { id: '', label: '', align: 'left' },
];

export default function SurveyInfoDialog({ open, handleClose, title, event, ...other }) {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const {
        FormID,
        FormTitle,
        FormType,
        FormDescription,
        isArchived,
        Respondent,
        FormQuestions,
        CreatedDate,
    } = event


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

    const navigate = useNavigate();

    const [tableData, setTableData] = useState(_participant);

    const [openConfirm, setOpenConfirm] = useState(false);

    const [filterName, setFilterName] = useState('');


    const [filterStatus, setFilterStatus] = useState('all');

    const dataFiltered = applyFilter({
        inputData: tableData,
        comparator: getComparator(order, orderBy),
        filterName,
        filterStatus,
    });

    const dataInPage = dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const isFiltered = filterName !== '' || filterStatus !== 'all';

    const isNotFound =
        (!dataFiltered.length && !!filterName) ||
        (!dataFiltered.length && !!filterStatus);

    const handleOpenConfirm = () => {
        setOpenConfirm(true);
    };

    const handleCloseConfirm = () => {
        setOpenConfirm(false);
    };

    const handleFilterStatus = (e, newValue) => {
        setPage(0);
        setFilterStatus(newValue);
    };

    const handleFilterName = (e) => {
        setPage(0);
        setFilterName(e.target.value);
    };

    const handleDeleteRow = (id) => {
        const deleteRow = tableData.filter((row) => row.FormID !== id);
        setSelected([]);
        setTableData(deleteRow);

        if (page > 0) {
            if (dataInPage.length < 2) {
                setPage(page - 1);
            }
        }
    };

    const handleDeleteRows = (selectedRows) => {
        const deleteRows = tableData.filter((row) => !selectedRows.includes(row.FormID));
        setSelected([]);
        setTableData(deleteRows);

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

    const handleResetFilter = () => {
        setFilterName('');
        setFilterStatus('all');
    };

    function renderEventType(type) {
        if (type === "Conference") return "primary"
        return "secondary"
    }

    function renderEventStatus(status) {
        if (status === "Finished") return "success"
        if (status === "Ongoing") return "info"
        if (status === "Incoming") return "error"
        return "primary"
    }

    return (
        <Dialog
            fullScreen={fullScreen}
            maxWidth="lg"
            fullWidth
            open={open}
            onClose={handleClose}
            aria-labelledby="responsive-dialog-title"
        >
            {
                !isStringNullOrEmpty(title) &&
                <DialogTitle id="responsive-dialog-title">
                    Title
                </DialogTitle>
            }
            <DialogContent>
                <Box sx={{ p: 3 }}>
                    <Grid container>
                        <Grid item xs={12} md={10}>
                            <Stack spacing={1}>

                                <Typography variant="h6">
                                    {FormTitle}
                                </Typography>

                                <Typography variant="caption" sx={{ fontSize: '10pt' }}>
                                    {CreatedDate}
                                </Typography>

                                <Box sx={{ padding: 1, }}>
                                    <Markdown children={FormDescription} />
                                </Box>
                            </Stack>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <Stack direction="row">
                                <FormControlLabel
                                    label="Archived"
                                    control={<Switch defaultChecked={isArchived === "active"} />}
                                />

                                <IconButton onClick={() => { }}>
                                    <Iconify icon="material-symbols:edit" />
                                </IconButton>
                            </Stack>
                        </Grid>
                    </Grid>

                    <Divider />

                    <Card sx={{ mt: 2 }}>
                        <Tabs
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
                        </Tabs>

                        <Divider />

                        <ParticipantTableToolbar
                            isFiltered={isFiltered}
                            filterName={filterName}
                            onFilterName={handleFilterName}
                            onResetFilter={handleResetFilter}
                        />

                        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
                            <TableSelectedAction
                                dense
                                numSelected={selected.length}
                                rowCount={tableData.length}
                                onSelectAllRows={(checked) =>
                                    onSelectAllRows(
                                        checked,
                                        tableData.map((row) => row.id)
                                    )
                                }
                                action={
                                    <Tooltip title="Send Survey Form">
                                        <IconButton color="primary" onClick={handleOpenConfirm}>
                                            <Iconify icon="carbon:send-alt-filled" />
                                        </IconButton>
                                    </Tooltip>
                                }
                            />

                            <Scrollbar>
                                <Table size='small' sx={{ minWidth: 800 }}>
                                    <TableHeadCustom
                                        order={order}
                                        orderBy={orderBy}
                                        headLabel={TABLE_HEAD}
                                        rowCount={tableData.length}
                                        numSelected={selected.length}
                                        onSort={onSort}
                                        onSelectAllRows={(checked) =>
                                            onSelectAllRows(
                                                checked,
                                                tableData.map((row) => row.ParticipantID)
                                            )
                                        }
                                    />

                                    <TableBody>
                                        {dataFiltered
                                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                            .map((row) => (
                                                <ParticipantTableRow
                                                    key={row.ParticipantID}
                                                    row={row}
                                                    selected={selected.includes(row.ParticipantID)}
                                                    onSelectRow={() => onSelectRow(row.ParticipantID)}
                                                    onDeleteRow={() => handleDeleteRow(row.ParticipantID)}
                                                    // onEditRow={() => { return }}
                                                />
                                            ))}

                                        <TableEmptyRows
                                            height={48}
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
                        // dense={dense}
                        // onChangeDense={onChangeDense}
                        />
                    </Card>
                </Box>
            </DialogContent>
        </Dialog>
    );
}


function applyFilter({ inputData, comparator, filterName, filterStatus }) {
    const stabilizedThis = inputData.map((el, index) => [el, index]);

    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });

    inputData = stabilizedThis.map((el) => el[0]);

    if (filterName) {
        inputData = inputData.filter(
            (user) => user.ParticipantName.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
        );
    }

    if (filterStatus !== 'all') {
        // inputData = inputData.filter((user) => user.status === filterStatus);
        return inputData
    }



    return inputData;
}

