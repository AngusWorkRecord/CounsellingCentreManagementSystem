import { useState, useCallback, useMemo } from 'react'
import * as Yup from 'yup';
import PropTypes from 'prop-types'

// form
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

// components
import { Box, Stack, Typography, TextField, Grid, Button, Divider, IconButton, Paper, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import Iconify from '../../../../components/iconify';

// utils
import { isArrayNotEmpty, isStringNullOrEmpty } from '../../../../utils/Helpers';

// form
import FormProvider, { RHFTextField, RHFRadioGroup, } from '../../../../components/hook-form';

// ----------------------------------------------------------------------

LocationSettingForm.propTypes = {
    locationData: PropTypes.array,
    setLocationData: PropTypes.func,
    isEdit: PropTypes.bool,
}

export default function LocationSettingForm({ locationData, setLocationData, isEdit, ...others }) {
    // data setting

    const handleAddLocation = () => {
        const object = {
            label: '',
            type: 'Physical',
            info: '',
            isDirty: false,
        }

        const list = [...locationData, object]
        setLocationData(list)
    }

    const handleRemoveLocation = (index) => {
        console.log(index)
        locationData.splice(index, 1)
        setLocationData([...locationData])
    }

    const handleLocationChange = (item, index, value) => {
        const list = [...locationData]
        switch (item) {
            case 'type':
                list[index].type = value
                setLocationData(list)
                break;

            case 'label':
                list[index].label = value
                list[index].isDirty = true
                setLocationData(list)
                break;

            case 'info':
                list[index].info = value
                list[index].isDirty = true
                setLocationData(list)
                break;

            default: break;
        }
    }

    return (
        <Box sx={{ py: 2, }}>
            <Box sx={{ py: 2 }}>
                <Typography variant="subtitle1" sx={{ color: 'rgba(11, 11, 11, .7)' }}>
                    Location Settings
                </Typography>
            </Box>

            <Divider />
            {
                !isArrayNotEmpty(locationData) &&
                <Button onClick={handleAddLocation} sx={{ my: 2 }} fullWidth variant="outlined">
                    The list is empty. Click to create Location
                </Button>
            }
            {
                isArrayNotEmpty(locationData) &&
                <Stack spacing={2} sx={{ my: 2 }}>
                    {
                        locationData.map((el, idx) => (
                            <Paper variant="outlined" sx={{ p: 2 }} key={`Location_${idx}`}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={2}>
                                        <ToggleButtonGroup
                                            color="primary"
                                            value={el.type}
                                            exclusive
                                            onChange={(event) => handleLocationChange('type', idx, event.target.value)}
                                            aria-label="Type"
                                            size="small"
                                            fullWidth
                                        >
                                            <ToggleButton value="Physical">
                                                Physical
                                            </ToggleButton>
                                            <ToggleButton value="Virtual">
                                                Virtual
                                            </ToggleButton>
                                        </ToggleButtonGroup>
                                    </Grid>
                                    <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="Location Label"
                                            placeholder="eg: UCSI Hotel"
                                            value={el.label}
                                            sx={{ my: 'auto' }}
                                            onChange={(event) => handleLocationChange('label', idx, event.target.value)}
                                            error={el.isDirty && isStringNullOrEmpty(el.label)}
                                            helperText={el.isDirty && isStringNullOrEmpty(el.label) ? "Label is required" : ""}
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={5} sx={{ display: 'flex' }}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="Info"
                                            placeholder="eg: 1st floor, Meeting Room Rafflesia"
                                            sx={{ my: 'auto' }}
                                            value={el.info}
                                            onChange={(event) => handleLocationChange('info', idx, event.target.value)}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={1} sx={{ display: 'flex' }}>
                                        <IconButton variant="contained" color="error" onClick={() => handleRemoveLocation(idx)} sx={{ m: 'auto' }}>
                                            <Iconify icon="tabler:trash" />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            </Paper>
                        ))
                    }

                    <Button onClick={handleAddLocation} sx={{ my: 2 }} variant="outlined">
                        Insert Location
                    </Button>
                </Stack>

            }
            <Divider />
        </Box>
    )
}