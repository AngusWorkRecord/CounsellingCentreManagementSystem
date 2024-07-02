import { useState, useCallback, useMemo } from 'react'
import * as Yup from 'yup';
import PropTypes from 'prop-types'

// form
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

// components
import { Box, Card, Stack, Typography, TextField, Grid, Button, Tooltip, Checkbox, FormControlLabel, Divider, IconButton, Paper } from '@mui/material';
import { isArrayNotEmpty, isStringNullOrEmpty } from '../../../../utils/Helpers';
import Iconify from '../../../../components/iconify';

// form
import FormProvider, { RHFTextField, RHFRadioGroup, } from '../../../../components/hook-form';

// ----------------------------------------------------------------------

TrackerSettingForm.propTypes = {
    formData: PropTypes.array,
    isEdit: PropTypes.bool,
    handlePrevStep: PropTypes.func,
    handleNextStep: PropTypes.func,
}

export default function TrackerSettingForm({ formData, isEdit, handlePrevStep, handleNextStep }) {
    // data setting
    const [trackerForms, setTrackerForms] = useState([])

    const handleAddTrackerForm = () => {
        const object = {
            name: '',
            url: ''
        }

        const list = [...trackerForms, object]
        setTrackerForms(list)
    }

    const handleRemoveTracker = (index) => {
        console.log(index)
        trackerForms.splice(index, 1)
        setTrackerForms([...trackerForms])
    }

    const handleTrackerChange = (item, index, value) => {
        const list = [...trackerForms]
        switch (item) {
            case 'name':
                list[index].name = value
                setTrackerForms(list)
                break;

            case 'url':
                list[index].url = value
                setTrackerForms(list)
                break;

            default: break;
        }
    }

    const onPrev = (data) => {
        handlePrevStep()
    }

    const onNext = (data) => {
        handleNextStep()
    }

    return (
        <Card sx={{ p: 2, }} elevation={1}>
            <Box sx={{ py: 2 }}>
                <Typography variant='subtitle2' sx={{ fontStyle: 'italic' }}>
                    **Disclaimer: Please use Google Sheets/Google Docs to create the Trackers.
                    The feature is representing the label for the Google Sheets URL for updates and tracking purposes.
                </Typography>
            </Box>

            <Divider />
            {
                !isArrayNotEmpty(trackerForms) &&
                <Button onClick={handleAddTrackerForm} sx={{ my: 2 }} fullWidth variant="outlined">
                    The list is empty. Click to create Tracker
                </Button>
            }
            {
                isArrayNotEmpty(trackerForms) &&
                <Stack spacing={2} sx={{ my: 2 }}>
                    {
                        trackerForms.map((el, idx) => (
                            <Paper variant="outlined" sx={{ p: 2 }} key={`Tracker_${idx}`}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={5}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            name="trackerLabel"
                                            label="Tracker Label"
                                            value={el.name}
                                            onChange={(event) => handleTrackerChange('name', idx, event.target.value)}
                                            error={isStringNullOrEmpty(el.name)}
                                            helperText={isStringNullOrEmpty(el.name) ? "Label is required" : ""}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={5}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            name="trackerURL"
                                            label="URL (Google Sheet or any other)"
                                            value={el.url}
                                            onChange={(event) => handleTrackerChange('url', idx, event.target.value)}
                                            error={isStringNullOrEmpty(el.name)}
                                            helperText={isStringNullOrEmpty(el.name) ? "Url is required" : ""}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={2} sx={{ display: 'flex' }}>
                                        <Button variant="contained" color="error" onClick={() => handleRemoveTracker(idx)} sx={{ m: 'auto' }} fullWidth>
                                            <Iconify icon="tabler:trash" /> Delete
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Paper>
                        ))
                    }

                    <Button onClick={handleAddTrackerForm} sx={{ my: 2 }} variant="outlined">
                        Create Tracker/Drive for this Event/Conference
                    </Button>
                </Stack>



            }

            <Divider />
            <Stack direction="column" alignItems="flex-end" sx={{ my: 2, }}>
                <div>
                    <Button
                        onClick={onPrev}
                        sx={{ mt: 1, mr: 1 }}
                    >
                        Back
                    </Button>
                    <Button
                        variant="contained"
                        onClick={onNext}
                        sx={{ mt: 1, mr: 1 }}
                    >
                        Submit
                    </Button>

                </div>
            </Stack>
        </Card >
    )
}