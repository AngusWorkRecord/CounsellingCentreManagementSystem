import { useState, useCallback, useMemo } from 'react'
import * as Yup from 'yup';
import PropTypes from 'prop-types'

// form
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

// components
import { Box, Card, Stack, Typography, TextField, Grid, Button, Tooltip, Checkbox, FormControlLabel, Paper, CardContent, CardHeader, Switch } from '@mui/material';
import { UploadAvatar, Upload, UploadBox } from '../../../../components/upload';

import Editor from '../../../../components/editor';

// form
import FormProvider, { RHFTextField, RHFRadioGroup, } from '../../../../components/hook-form';

DescriptionForm.propTypes = {
    formData: PropTypes.object,
    isEdit: PropTypes.bool,
    handlePrevStep: PropTypes.func,
    handleNextStep: PropTypes.func,
}

export default function DescriptionForm({ formData, isEdit, handlePrevStep, handleNextStep }) {
    const [description, setDescription] = useState('');
    const [files, setFiles] = useState([]);

    // form setting
    const BasicInfoSchema = Yup.object().shape({
        // type: Yup.mixed().required(`Please select Conference or Event..`),
        // startDate: Yup.string().required(`The Start Time is required`),
        // finishDate: Yup.string().required(`The Finish Time is required`),
        // physicalLocationName: Yup.string().when("isPhysicalChecked", {
        //     is: true,
        //     then: Yup.string().required("The physical location must be filled in!")
        // })
    });

    const defaultValues = useMemo(
        () => ({
            // type: formData?.EventType || '',
            // eventName: formData?.EventName || '',
            // startDate: formData?.startDate || new Date(),
            // finishDate: formData?.endDate || new Date(),
            // physicalLocationName: formData?.EventPhysicalLocation || '',
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [formData]
    );

    const methods = useForm({
        resolver: yupResolver(BasicInfoSchema),
        defaultValues,
    });

    const {
        reset,  // call reset() to reset the form
        handleSubmit,
        control,
        formState: { errors, isValid, isSubmitting, isSubmitSuccessful },
    } = methods;

    const onPrev = (data) => {
        handlePrevStep()
    }

    const onNext = (data) => {
        handleNextStep()
    }

    const handleQuillEditorChange = (value) => {
        // string handling before the quill save into the state
        setDescription(value)
    }

    const handleDropMultiFile = useCallback(
        (acceptedFiles) => {
            setFiles([
                ...files,
                ...acceptedFiles.map((newFile) =>
                    Object.assign(newFile, {
                        preview: URL.createObjectURL(newFile),
                    })
                ),
            ]);
        },
        [files]
    );

    const handleRemoveFile = (inputFile) => {
        const filesFiltered = files.filter((fileFiltered) => fileFiltered !== inputFile);
        setFiles(filesFiltered);
    };

    const handleRemoveAllFiles = () => {
        setFiles([]);
    };

    return (
        <Box sx={{ p: 2, }} >
            <FormProvider methods={methods} onSubmit={handleSubmit(onNext)} >
                <Card sx={{ mb: 2, boxShadow: 'none' }} elevation={0}>
                    <CardHeader title="Event Contents & Description" />
                    <CardContent>
                        <Paper elevation={0}>
                            <Typography variant="subtitle1" sx={{ color: 'text.secondary', p: 1 }}>
                                Description
                            </Typography>
                            <Editor
                                id="full-editor"
                                value={description}
                                onChange={(value) => handleQuillEditorChange(value)}
                            />
                        </Paper>
                    </CardContent>
                </Card>

                <Card elevation={0} sx={{ boxShadow: 'none' }}>
                    <CardHeader title="Upload Brochures" />
                    <CardContent>
                        <Upload
                            multiple
                            thumbnail={false}
                            files={files}
                            onDrop={handleDropMultiFile}
                            onRemove={handleRemoveFile}
                            onRemoveAll={handleRemoveAllFiles}
                            onUpload={() => console.log('ON UPLOAD')}
                        />
                    </CardContent>
                </Card>

                <Stack direction="column" alignItems="flex-end" sx={{ my: 2, }}>
                    <div>
                        <Button
                            onClick={onPrev}
                            sx={{ mt: 1, mr: 1 }}
                        >
                            Back
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            sx={{ mt: 1, mr: 1 }}
                        >
                            Next
                        </Button>
                    </div>
                </Stack>
            </FormProvider>
        </Box>
    )
}