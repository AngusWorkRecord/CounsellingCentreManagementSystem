import { useState, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import { Stack, Button, TextField, Typography, FormControl, FormControlLabel, RadioGroup, Radio, IconButton, Checkbox, } from "@mui/material";
import { isArrayNotEmpty, isStringNullOrEmpty } from '../../../utils/Helpers';
import { CloseIcon } from '../../../theme/overrides/CustomIcons';

MultiSelectComponent.propTypes = {
    QuestionID: PropTypes.number,
    QuestionLabel: PropTypes.string,
    QuestionPlaceholder: PropTypes.string,
    QuestionOptions: PropTypes.array,
    onLabelChange: PropTypes.func,
    onAddOption: PropTypes.func,
    onRemoveOption: PropTypes.func,
    onChangeOptionLabel: PropTypes.func,
}

export default function MultiSelectComponent({
    QuestionID,
    QuestionLabel,
    QuestionPlaceholder,
    QuestionOptions,
    onLabelChange,
    onAddOption,
    onRemoveOption,
    onChangeOptionLabel,
    ...others
}) {
    const [isDirty, setIsDirty] = useState(false)

    const handleChange = (event) => {
        setIsDirty(true)
        try {
            onLabelChange(event.target.value)
        }
        catch (error) {
            console.error(error)
        }
    }

    const handleUpdateOptionLabel = (index, value) => {
        onChangeOptionLabel(index, value)
    }

    return (
        <Stack>
            <Stack direction="row" justifyContent="flex-start" alignItems="center" spacing={2} sx={{ width: '100%' }}>
                <TextField
                    value={QuestionLabel}
                    placeholder={QuestionPlaceholder}
                    fullWidth
                    onChange={handleChange}
                    error={isDirty && isStringNullOrEmpty(QuestionLabel)}
                    helperText={isDirty && isStringNullOrEmpty(QuestionLabel) ? "Question Label is required." : ""}
                    {...others}
                />
            </Stack>
            <FormControl sx={{ mt: 3, py: 2, width: '100%' }}>
                {
                    isArrayNotEmpty(QuestionOptions) && QuestionOptions.map((option, optionIndex) => (
                        <Stack direction="row" justifyContent="flex-start" alignItems="center" spacing={1} sx={{ width: '100%' }} key={optionIndex}>
                            <FormControlLabel value={option.value} control={<Checkbox />} />
                            <TextField
                                value={isStringNullOrEmpty(option.label) ? "" : option.label}
                                placeholder="Untitled Answer"
                                onChange={(e) => { handleUpdateOptionLabel(optionIndex, e.target.value) }}
                                variant="standard"
                                fullWidth
                                required
                                error={option.isDirty && isStringNullOrEmpty(option.label)}
                                helperText={option.isDirty && isStringNullOrEmpty(option.label) ? "The option label is required." : ""}
                            />
                            {
                                optionIndex > 0 &&
                                <IconButton aria-label="remove_option" size="medium" onClick={() => { onRemoveOption(optionIndex) }}>
                                    <CloseIcon fontSize="inherit" />
                                </IconButton>
                            }
                        </Stack>
                    ))
                }
                {
                    isArrayNotEmpty(QuestionOptions) && QuestionOptions.length < 10 &&
                    <Stack direction="row" justifyContent="flex-start" alignItems="center" spacing={1} sx={{ width: '100%', cursor: "pointer" }} onClick={onAddOption}>
                        <FormControlLabel value='' control={<Checkbox />} disabled />
                        <Typography sx={{ cursor: 'pointer' }}>Add new option</Typography>
                    </Stack>
                }

            </FormControl>

        </Stack>
    )
}