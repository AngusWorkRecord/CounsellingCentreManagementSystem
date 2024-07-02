import { useState, useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'

// form
import * as Yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

// @mui
import { Box, Card, Stack, Typography, TextField, Grid, Button, Tooltip, InputAdornment } from '@mui/material';
import { DesktopDateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

// helpers / functions/
import { isArrayNotEmpty } from '../../../../utils/Helpers';
import useCopyToClipboard from '../../../../hooks/useCopyToClipboard';
import { useSnackbar } from '../../../../components/snackbar';

// form
import FormProvider, { RHFTextField, } from '../../../../components/hook-form';

// components
import ConfirmDialog from '../../../../components/confirm-dialog/ConfirmDialog';
import LocationSettingForm from './LocationSettingForm';

BasicInfoForm.propTypes = {
    formData: PropTypes.object,
    isEdit: PropTypes.bool,
    handlePrevStep: PropTypes.func,
    handleNextStep: PropTypes.func,
}

export default function BasicInfoForm({ formData, isEdit, handlePrevStep, handleNextStep }) {
    const [eventName, setEventName] = useState("")
    const [startDateTime, setStartDateTime] = useState(new Date());
    const [finishDateTime, setFinishDateTime] = useState(new Date());
    const [locations, setLocations] = useState([])

    const { enqueueSnackbar } = useSnackbar();
    const { copy } = useCopyToClipboard();
    const onCopy = (text) => {
        if (text) {
            enqueueSnackbar('Copied!');
            copy(text);
        }
    };


    // form setting
    const BasicInfoSchema = Yup.object().shape({
        eventName: Yup.string().required(`Name for the conference event is required.`),
        startDate: Yup.string().required(`The Start Time is required`),
        finishDate: Yup.string().required(`The Finish Time is required`),
        price: Yup.number().moreThan(0, 'Price should not be RM 0.00'),
    });

    const defaultValues = useMemo(
        () => ({
            eventName: formData?.EventName || '',
            startDate: formData?.startDate || new Date(),
            finishDate: formData?.endDate || new Date(),
            price: formData?.EventPrice || 0,
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
        setValue,
        handleSubmit,
        control,
        watch,
        formState: { errors, isValid, isSubmitting, isSubmitSuccessful },
    } = methods;

    const values = watch();

    const onNext = (data) => {
        const isValidate = methods.formState.isValid

        if (isValidate)
            handleNextStep()

    }

    return (
        <Card sx={{ p: 2, }} elevation={1}>
            <FormProvider methods={methods} onSubmit={handleSubmit(onNext)} >
                <Stack spacing={2}>

                    <Stack spacing={1}>
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                            Conference Event Name
                        </Typography>
                        <RHFTextField size="small" name="eventName" label="Conference Event" />
                    </Stack>

                    {
                        isEdit &&
                        <Stack direction="row" spacing={1}>
                            <Typography variant="subtitle2" sx={{ color: 'text.secondary', my: 'auto' }}>
                                Page URL
                            </Typography>
                            <Tooltip title="Click to copy">
                                <Button
                                    variant="text"
                                    sx={{ textTransform: "lowercase" }}
                                    endIcon={<ContentCopyIcon />}
                                    onClick={() => { onCopy(`https://localhost:3000/Conference/${eventName}`) }}
                                >
                                    {`https://localhost:3000/Conference/${eventName}`}
                                </Button>
                            </Tooltip>
                        </Stack>

                    }

                    <Grid container>
                        <Grid item xs={12} md={6} >
                            <Stack spacing={1}>
                                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                                    Start At
                                </Typography>
                                <Controller
                                    name="startDate"
                                    control={control}
                                    render={({ field, fieldState: { error } }, ...restField) => (
                                        <DesktopDateTimePicker
                                            value={startDateTime}
                                            onChange={(newValue) => {
                                                setStartDateTime(newValue);
                                            }}
                                            renderInput={(params) => <TextField size="small" {...params} margin="normal" fullWidth error={!!error} helperText={error?.message} />}
                                            {...restField}

                                        />
                                    )}
                                />
                            </Stack>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Stack spacing={1} >
                                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                                    Finish At
                                </Typography>
                                <Controller
                                    name="finishDate"
                                    control={control}
                                    render={({ field, fieldState: { error }, ...restField }) => (
                                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                                            <DesktopDateTimePicker
                                                value={finishDateTime}
                                                onChange={(newValue) => {
                                                    setFinishDateTime(newValue);
                                                }}
                                                renderInput={(params) => <TextField size="small" {...params} margin="normal" fullWidth error={!!error} helperText={error?.message} />}
                                                {...restField}
                                            />
                                        </LocalizationProvider>
                                    )}
                                />
                            </Stack>
                        </Grid>
                    </Grid>

                    <Stack spacing={1}>
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                            Entrace Fee
                        </Typography>
                        <RHFTextField
                            name="price"
                            label="Entrace Fee"
                            placeholder="0.00"
                            onChange={(event) => setValue('price', Number(event.target.value), { shouldValidate: true })}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Box component="span" sx={{ color: 'text.disabled' }}>
                                            RM
                                        </Box>
                                    </InputAdornment>
                                ),
                                type: 'number',
                            }}
                        />
                    </Stack>

                    <Stack>
                        <LocationSettingForm
                            isEdit={false}
                            locationData={locations}
                            setLocationData={setLocations}
                        />
                    </Stack>

                </Stack>
                <Stack direction="column" alignItems="flex-end" sx={{ my: 2, }}>
                    <div>
                        <Button
                            type="submit"
                            variant="contained"
                            sx={{ mt: 1, mr: 1 }}
                        >
                            Next
                        </Button>
                        {/* <Button
                        onClick={handlePrevStep}
                        sx={{ mt: 1, mr: 1 }}
                    >
                        Back
                    </Button> */}
                    </div>
                </Stack>
            </FormProvider>
        </Card>
    )
}