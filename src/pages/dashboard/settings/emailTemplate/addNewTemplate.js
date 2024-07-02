import { Helmet } from 'react-helmet-async';
import { paramCase } from 'change-case';
import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
// @mui
import {
    Tab,
    Chip,
    Tabs,
    Card,
    Table,
    Button,
    Tooltip,
    Divider,
    TableBody,
    Container,
    IconButton,
    TableContainer,
} from '@mui/material';
// auth
import { useAuthContext } from '../../../../auth/useAuthContext';
// redux
import { useDispatch, useSelector } from '../../../../redux/store';
import { getTaskStatus } from '../../../../redux/slices/taskAssignment';
import { getMailsTemplate } from '../../../../redux/slices/mail';
import { getExpertises } from '../../../../redux/slices/user';
// routes
import { PATH_DASHBOARD } from '../../../../routes/paths';
// _mock_
import { _userList } from '../../../../_mock/arrays';
// components
import Iconify from '../../../../components/iconify';
import Scrollbar from '../../../../components/scrollbar';
import ConfirmDialog from '../../../../components/confirm-dialog';
import CustomBreadcrumbs from '../../../../components/custom-breadcrumbs';
import { useSettingsContext } from '../../../../components/settings';
import {
    useTable,
    getComparator,
    emptyRows,
    TableNoData,
    TableEmptyRows,
    TableRowCustom,
    TableHeadCustom,
    TableSelectedAction,
    TablePaginationCustom,
} from '../../../../components/table';
import useDoubleClick from '../../../../hooks/useDoubleClick';
import TaskDetailsDrawer from '../../../../sections/@dashboard/tasks/TaskDetailsDrawer';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = ['All', 'Editor', 'Reviewer', 'Author'];

const TABLE_HEAD = [
    {
        id: 'EmailTemplateInd',
        type: 'ListItemText',
        subtext: 'PaperManuscriptID',
        label: 'No.',
        align: 'left',
        width: '10%',
    },
    {
        id: 'EmailTemplateTitle',
        type: 'ListItemText',
        subtext: '',
        label: 'Template Title',
        align: 'left',
        width: '25%',
    }, {
        id: 'EmailTemplateDescription',
        type: 'ListItemText',
        subtext: '',
        label: 'Template Description',
        align: 'left',
        width: '35%',
    },
    { id: 'Type', type: 'Typography', subtext: '', label: 'Type', align: 'left', width: '5%' },
    {
        id: 'LastModifiedDate',
        type: 'Typography',
        subtext: '',
        label: 'Modified Date',
        align: 'left',
        width: '15%',
    },
    {
        id: 'Active',
        type: 'Typography',
        subtext: '',
        label: 'Active',
        align: 'left',
        width: '10%',
    }
];

// ----------------------------------------------------------------------

export default function EmailTemplatelisting() {
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
        defaultOrderBy,
    } = useTable();

    const { themeStretch } = useSettingsContext();

    const { user } = useAuthContext();

    const navigate = useNavigate();

    const dispatch = useDispatch();

    const [clicked, setClicked] = useState([]);

    // const { tasks, taskStatus } = useSelector((state) => state.tasks);

    const { mailTemplates, isLoading } = useSelector((state) => state.mail);
    console.log("mailTemplates", mailTemplates)
    const { expertises } = useSelector((state) => state.user);

    const [mailTemplatesData, setmailTemplatesData] = useState(mailTemplates);

    // const [taskStatusData, setTaskStatusData] = useState(taskStatus);

    const [expertisesData, setExpertisesData] = useState(expertises);

    const [openConfirm, setOpenConfirm] = useState(false);

    const [filterName, setFilterName] = useState('');

    const [filterStatus, setFilterStatus] = useState('20');

    const [openDetails, setOpenDetails] = useState([]);

    const dataFiltered = applyFilter({
        inputData: mailTemplatesData,
        comparator: getComparator(order, orderBy),
        filterName,
        filterStatus,
    });

    const dataInPage = dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const denseHeight = dense ? 52 : 72;

    const isFiltered = filterName !== '' || filterStatus !== '20';

    const isNotFound =
        (!dataFiltered.length && !!filterName) || (!dataFiltered.length && !!filterStatus);

    useEffect(() => {
        dispatch(getTaskStatus());
        dispatch(getExpertises());
        dispatch(getMailsTemplate());
    }, [dispatch, user]);

    useEffect(() => {
        if (mailTemplates.length) {
            setmailTemplatesData(mailTemplates);
            const openDetailsTemp = [];
            mailTemplates.map((task) => openDetailsTemp.push(false));
            setOpenDetails(openDetailsTemp);
        }

        // if (taskStatus.length) {
        //     setTaskStatusData(taskStatus);
        // }
        if (expertises.length) {
            setExpertisesData(expertises);
        }
    }, [mailTemplates, expertises]);
    // }, [mailTemplates, taskStatus, expertises]);

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

    const handleDeleteUser = (PaperID) => {
        // try {
        //   dispatch(deleteUsers(user?.PaperID, PaperID));
        // } catch (error) {
        //   console.error(error);
        // }
    };

    const handleOpenDetails = (index) => {
        const openDetailsTemp = [];
        dataFiltered.map((elem, idx) => (idx === index ? openDetailsTemp.push(true) : openDetailsTemp.push(false)));
        setOpenDetails(openDetailsTemp);
    };

    const handleCloseDetails = () => {
        setOpenDetails(false);
    };

    const handleClick = (paperData, index) => {
        setClicked(paperData);
        console.log(paperData);
        handleOpenDetails(index);
    };

    const handleDoubleClick = useDoubleClick({
        doubleClick: () => console.log('DOUBLE CLICK'),
    });

    // const handleEditRow = (id) => {
    //     navigate(PATH_DASHBOARD.tasks.edit(id));
    // };

    const handleResetFilter = () => {
        setFilterName('');
        setFilterStatus('20');
    };

    return (
        <>
            <Helmet>
                <title> Email Template</title>
            </Helmet>

            <Container maxWidth={false}>
                <CustomBreadcrumbs
                    heading="Email Template"
                    links={[
                        { name: 'Home', href: PATH_DASHBOARD.root },
                        { name: 'Email Template', href: PATH_DASHBOARD.tasks.root },
                    ]}
                    action={
                        <Button
                            component={RouterLink}
                            to={PATH_DASHBOARD.user.new}
                            variant="contained"
                            startIcon={<Iconify icon="eva:plus-fill" />}
                        >
                            New Template
                        </Button>
                    }
                />

                <Card>
                    {/* <Tabs
                        value={filterStatus}
                        onChange={handleFilterStatus}
                        sx={{
                            px: 2,
                            bgcolor: 'background.neutral',
                        }}
                    >
                        {taskStatusData.map((tab) => (
                            <Tab key={tab.PaperStatusID} label={tab.PaperStatus} value={tab.PaperStatusID} />
                        ))}
                    </Tabs> */}

                    <Divider />

                    <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
                        <TableSelectedAction
                            dense={dense}
                            numSelected={selected.length}
                            rowCount={mailTemplatesData.length}
                            onSelectAllRows={(checked) =>
                                onSelectAllRows(
                                    checked,
                                    mailTemplatesData.map((row) => row.PaperID)
                                )
                            }
                            action={
                                <Tooltip title="Delete">
                                    <IconButton color="primary" onClick={handleOpenConfirm}>
                                        <Iconify icon="eva:trash-2-outline" />
                                    </IconButton>
                                </Tooltip>
                            }
                        />

                        <Scrollbar>
                            <Table size={dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
                                <TableHeadCustom
                                    order={order}
                                    orderBy={orderBy}
                                    headLabel={TABLE_HEAD}
                                    rowCount={mailTemplatesData.length}
                                    numSelected={selected.length}
                                    onSort={onSort}
                                />

                                <TableBody>
                                    {dataFiltered
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((row, index) => (
                                            <>
                                            {console.log("EmailTemplateID",row)}
                                                <TableRowCustom
                                                    key={row.EmailTemplateID}
                                                    row={row}
                                                    headLabel={TABLE_HEAD}
                                                    selected={selected.includes(row.EmailTemplateID)}
                                                    onSelectRow={() => onSelectRow(row.EmailTemplateID)}
                                                    onClickRow={() => {
                                                        handleClick(row, index);
                                                        return handleDoubleClick;
                                                    }}
                                                    // onDeleteRow={() => ()}
                                                    // onEditRow={() => handleEditRow(row.PaperID)}
                                                />
                                                {/* <TaskDetailsDrawer
                                                    item={row}
                                                    category={expertisesData}
                                                    open={openDetails[index]}
                                                    onClose={handleCloseDetails}
                                                /> */}
                                            </>
                                        ))}

                                    <TableEmptyRows
                                        height={denseHeight}
                                        emptyRows={emptyRows(page, rowsPerPage, mailTemplatesData.length)}
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

            <ConfirmDialog
                open={openConfirm}
                onClose={handleCloseConfirm}
                title="Delete"
                content={
                    <>
                        Are you sure want to delete <strong> {selected.length} </strong> items?
                    </>
                }
                action={
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => {
                            //   handleDeleteRows(selected);
                            handleCloseConfirm();
                        }}
                    >
                        Delete
                    </Button>
                }
            />
        </>
    );
}

// ----------------------------------------------------------------------

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
            (task) => task.PaperTitle.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
        );
    }

    if (filterStatus !== '20') {
        inputData = inputData.filter((task) => task.PaperStatusID === filterStatus);
    }

    return inputData;
}
