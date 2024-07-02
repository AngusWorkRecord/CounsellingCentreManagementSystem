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
    Grid
} from '@mui/material';
// auth
import { useAuthContext } from '../../../../auth/useAuthContext';
// redux
import { useDispatch, useSelector } from '../../../../redux/store';
import { getTaskStatus } from '../../../../redux/slices/taskAssignment';
import { getMailsTemplate, getDefaultMailsTemplate, getEmailPlaceHolderOptions } from '../../../../redux/slices/mail';
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
import EditEmailTemplate from './EditTemplate';
import AddEmailTemplate from './addNewTemplate';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = ['All', 'Editor', 'Reviewer', 'Author'];

const TABLE_HEAD = [
    {
        id: 'EmailTemplateInd',
        type: 'ind',
        subtext: 'PaperManuscriptID',
        label: 'No.',
        align: 'left',
        width: '5%',
    },
    {
        id: 'EmailTemplateTitle',
        type: 'ListItemText',
        subtext: '',
        label: 'Template Title',
        align: 'left',
        width: '30%',
    }, {
        id: 'EmailTemplateDescription',
        type: 'ListItemText',
        subtext: '',
        label: 'Template Description',
        align: 'left',
        width: '45%',
    },
    {
        id: 'LastModifiedDate',
        type: 'ListItemText',
        subtext: 'LastModifiedTime',
        label: 'Modified Date',
        align: 'left',
        width: '20%',
    }
];

const default_TABLE_HEAD = [
    {
        id: 'EmailTemplateInd',
        type: 'ind',
        subtext: 'PaperManuscriptID',
        label: 'No.',
        align: 'left',
        width: '5%',
    },
    {
        id: 'EmailSetting',
        type: 'ListItemText',
        subtext: '',
        label: 'Setting Name',
        align: 'left',
        width: '30%',
    },
    {
        id: 'EmailTemplateDescription',
        type: 'ListItemText',
        subtext: '',
        label: 'Template Description',
        align: 'left',
        width: '45%',
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

    const [clicked, setClicked] = useState({});

    const { mailTemplates, isLoading, mailDefault, emailPlaceholder } = useSelector((state) => state.mail);

    const { expertises } = useSelector((state) => state.user);

    const [mailTemplatesData, setmailTemplatesData] = useState(mailTemplates);

    const [mailDefaultData, setmailDefaultData] = useState(mailDefault);

    const [emailPlaceholderData, setemailPlaceholderData] = useState(emailPlaceholder);

    const [expertisesData, setExpertisesData] = useState(expertises);

    const [openConfirm, setOpenConfirm] = useState(false);

    const [filterName, setFilterName] = useState('');

    const [filterStatus, setFilterStatus] = useState('20');

    const [openDetails, setOpenDetails] = useState(false);

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
        dispatch(getDefaultMailsTemplate());
        dispatch(getEmailPlaceHolderOptions());
    }, [dispatch, user]);

    useEffect(() => {
        if (mailTemplates.length) {
            setmailTemplatesData(mailTemplates);
        }
        if (mailDefault.length) {
            setmailDefaultData(mailDefault);
        }
        if (expertises.length) {
            setExpertisesData(expertises);
        }
        if (emailPlaceholder.length) {
            setemailPlaceholderData(emailPlaceholder);
        }
    }, [mailTemplates, mailDefault, expertises, emailPlaceholder]);

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

    const handleCloseDetails = () => {
        setOpenDetails(false);
    };

    const handleClick = (paperData, index) => {
        setClicked(paperData);
        setOpenDetails(true);
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
                        // { name: 'Email Template', href: PATH_DASHBOARD.mailTemplate.root },
                    ]}
                    action={
                        <Button
                            component={RouterLink}
                            to={PATH_DASHBOARD.mailTemplate.list}
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
                            // onSelectAllRows={(checked) =>
                            //     onSelectAllRows(
                            //         checked,
                            //         mailTemplatesData.map((row) => row.PaperID)
                            //     )
                            // }
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
                                        .map((row, index) => (
                                            <>
                                                <TableRowCustom
                                                    key={row.EmailTemplateID}
                                                    row={row}
                                                    index_id={index + 1}
                                                    headLabel={TABLE_HEAD}
                                                    selected={selected.includes(row.EmailTemplateID)}
                                                    onSelectRow={() => onSelectRow(row.EmailTemplateID)}
                                                    onClickRow={() => {
                                                        handleClick(row, index);
                                                        return handleDoubleClick;
                                                    }}
                                                />
                                            </>
                                        ))
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}

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
                {/* <Grid item xs={4} sm={4} md={4}>
                        <Card>
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
                                    <Table size={dense ? 'small' : 'medium'} sx={{ minWidth: 500 }}>
                                        <TableHeadCustom
                                            order={order}
                                            orderBy={orderBy}
                                            headLabel={default_TABLE_HEAD}
                                            rowCount={mailTemplatesData.length}
                                            numSelected={selected.length}
                                            onSort={onSort}
                                        />

                                        <TableBody>
                                            {mailDefaultData
                                                // .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                                .map((row, index) => (
                                                    <>
                                                        <TableRowCustom
                                                            key={row.EmailTemplateID}
                                                            row={row}
                                                            index_id={index + 1}
                                                            headLabel={default_TABLE_HEAD}
                                                            selected={selected.includes(row.EmailTemplateID)}
                                                            onSelectRow={() => onSelectRow(row.EmailTemplateID)}
                                                            onClickRow={() => {
                                                                handleClick(row, index);
                                                                return handleDoubleClick;
                                                            }}
                                                        // onDeleteRow={() => ()}
                                                        // onEditRow={() => handleEditRow(row.PaperID)}
                                                        />
                                                        <EditEmailTemplate
                                                            openModal={openDetails}
                                                            onClose={handleCloseDetails}
                                                            item={clicked} />
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
                        </Card>
                    </Grid> */}

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
            <EditEmailTemplate
                openModal={openDetails}
                onClose={handleCloseDetails}
                item={clicked}
                emailPlaceholderData={emailPlaceholderData} />
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
