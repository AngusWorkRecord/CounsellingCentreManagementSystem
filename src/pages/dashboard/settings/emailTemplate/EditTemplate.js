import { Helmet } from 'react-helmet-async';
import { paramCase } from 'change-case';
import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
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
    Dialog,
    DialogTitle,
    ListItemText,
    ListItem,
    List,
    AppBar,
    Toolbar,
    Slide,
    Typography,
    Stack,
    Box,
    DialogActions,
    DialogContent,
    DialogContentText,
    TextField,
    Grid
} from '@mui/material';
import { styled } from '@mui/material/styles';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
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
    // useTable,
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
import MailDetails from '../../../../sections/@dashboard/mail/details/MailDetails';
import Markdown from '../../../../components/markdown';
import FormProvider, {
    RHFSwitch,
    RHFSelect,
    RHFEditor,
    RHFUpload,
    RHFTextField,
    RHFRadioGroup,
    RHFAutocomplete,
} from '../../../../components/hook-form';
import { DraggableButtons } from '../../../components/drag-and-drop-button/drag-and-drop-button';
// ----------------------------------------------------------------------

EditEmailTemplate.propTypes = {
    openModal: PropTypes.bool,
    onClose: PropTypes.func,
    item: PropTypes.object,
    emailPlaceholderData: PropTypes.array,
};

const EmailTemplateSchema = Yup.object().shape({
    subject: Yup.string().required('Email subject is required'),
    message: Yup.string().required('Email content is required'),
});

export default function EditEmailTemplate({ openModal, onClose, item, emailPlaceholderData }) {
    // console.log("emailPlaceholderData", emailPlaceholderData)
    const defaultValues = {
        subject: item?.EmailTemplateSubject || "",
        message: item?.EmailTemplateContent || "",
    };

    const methods = useForm({
        resolver: yupResolver(EmailTemplateSchema),
        defaultValues,
    });

    const {
        reset,
        watch,
        setValue,
        handleSubmit,
        formState: { isSubmitting },
    } = methods;

    useEffect(() => {
        setValue("subject", item.EmailTemplateSubject);
        setValue("message", item.EmailTemplateContent);
    }, [item, setValue]);

    const { themeStretch } = useSettingsContext();

    const { user } = useAuthContext();

    const navigate = useNavigate();

    const dispatch = useDispatch();

    const [onEdit, setonEdit] = useState(false);

    const [openConfirmModal, setopenConfirmModal] = useState(false)

    if (item.EmailTemplateContent) {
        const matches = item.EmailTemplateContent.match(/@#(.+?)@#/);
        if (matches && matches.length >= 2) {
            const extractedString = matches[1];
            // console.log("matches", extractedString);
        }
    }

    // const [toUpload, settoUpload] = useState({
    //     subject: '',
    //     message: ''
    // });

    // const onChange = (event, type) => {
    //     const { name, value } = event.target;
    //     settoUpload((prevData) => ({
    //         ...prevData,
    //         [name]: value,
    //     }));
    //     setonEdit(true);
    // }

    const onSubmit = (event) => {
        // console.log("onsubmit")
        // console.log(methods.getValues())
        onClose()
    }

    const handleDelete = (event) => {
        // console.log("onDelete")
        setopenConfirmModal(true)
    }


    return (
        <>
            <Dialog fullWidth maxWidth="xl" open={openModal} onClose={onClose} >
                <DialogTitle style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        {item.EmailTemplateTitle ? item.EmailTemplateTitle : 'Email Template'}
                    </div>
                    <div>
                        <Button variant="outlined" color="warning" onClick={handleDelete}>
                            Delete
                        </Button>
                    </div>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={9}>
                            <Stack flexGrow={1}>
                                {/* <DetailsPage
                            subject={item.EmailTemplateSubject}
                            message={item.EmailTemplateContent}
                            setonEdit={onChange}
                            methods={methods}
                        /> */}
                                <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
                                    <Stack spacing={1} sx={{ mb: 3 }}>
                                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                                            Email Subject
                                        </Typography>
                                        <RHFTextField name="subject" />
                                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                                            Email Content
                                        </Typography>
                                        <RHFEditor simple name="message" />
                                    </Stack>
                                </FormProvider>
                            </Stack>
                        </Grid>
                        <Divider />
                        <Grid item xs={3}>
                            <Stack spacing={1} sx={{ mb: 3 }}>
                                <DraggableButtons buttonData={emailPlaceholderData} />
                            </Stack>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} autoFocus>
                        Close
                    </Button>
                    <Button
                        // onClick={onSubmit}
                        disabled={!onEdit}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog >
            <ConfirmDeleteDialog openConfirm={openConfirmModal} handleModal={setopenConfirmModal} title={item.EmailTemplateTitle} />
        </>
    )
}

DetailsPage.propTypes = {
    subject: PropTypes.string,
    message: PropTypes.string,
    setonEdit: PropTypes.func,
    methods: PropTypes.object,
};
function DetailsPage({ subject, message, setonEdit, methods }) {

    return (
        <FormProvider methods={methods} onSubmit={methods.handleSubmit("ok")} loading={methods.isSubmitting}>
            <Stack spacing={1} sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                    Email Subject
                </Typography>
                <RHFTextField name="subject" />
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                    Email Content
                </Typography>
                <RHFEditor simple name="message" />
            </Stack>
        </FormProvider>
    )
}


ConfirmDeleteDialog.propTypes = {
    openConfirm: PropTypes.bool,
    handleModal: PropTypes.func,
    title: PropTypes.string,
};
function ConfirmDeleteDialog({ openConfirm, handleModal, title }) {
    return (
        <Dialog
            open={openConfirm}
            onClose={() => handleModal(false)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                Confirm delete this template?
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {title}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => handleModal(false)}>Disagree</Button>
                <Button onClick={() => handleModal(false)} autoFocus>
                    Agree
                </Button>
            </DialogActions>
        </Dialog>
    )
}