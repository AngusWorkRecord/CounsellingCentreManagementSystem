import { useState, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import { Stack, Button, TextField, Typography, FormControl, FormControlLabel, RadioGroup, Radio, IconButton, Checkbox, } from "@mui/material";
import { isNumber } from 'lodash';
import { isArrayNotEmpty, isStringNullOrEmpty } from '../../../utils/Helpers';
import { CloseIcon } from '../../../theme/overrides/CustomIcons';

RangeComponent.propTypes = {
    QuestionID: PropTypes.number,
    QuestionLabel: PropTypes.string,
    QuestionPlaceholder: PropTypes.string,
    Range: PropTypes.array,
    MinRangeLabel: PropTypes.string,
    MaxRangeLabel: PropTypes.string,
    onLabelChange: PropTypes.func,
    onRangeLabelChange: PropTypes.func,
}

export default function RangeComponent({
    QuestionID,
    QuestionLabel,
    QuestionPlaceholder,
    Range,
    MinRangeLabel,
    MaxRangeLabel,
    onLabelChange,
    onRangeLabelChange,
    ...others
}) {
    const [isDirty, setIsDirty] = useState(false)

    function handleChange(event) {
        setIsDirty(true)
        onLabelChange(event.target.value)
    }

    function handleLabelChange(minOrMax, value) {
        setIsDirty(true)
        onRangeLabelChange(minOrMax, value)
    }

    return (
        <Stack>
            <Stack direction="row" justifyContent="flex-start" alignItems="center" spacing={2} sx={{ width: '100%' }}>
                <TextField
                    value={QuestionLabel}
                    placeholder={QuestionPlaceholder}
                    fullWidth
                    onChange={() => handleChange}
                    error={isDirty && isStringNullOrEmpty(QuestionLabel)}
                    helperText={isDirty && isStringNullOrEmpty(QuestionLabel) ? "Question Label is required." : ""}
                    {...others}
                />
            </Stack>

            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} sx={{ width: '100%', mt: 5 }}>
                <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                    {MinRangeLabel}
                </Typography>
                <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                    {MaxRangeLabel}
                </Typography>
            </Stack>
            <FormControl fullWidth >
                <RadioGroup row name={`range_${QuestionID}`} defaultValue={0} sx={{ justifyContent: 'space-around', paddingX: '1rem' }} >
                    {
                        isNumber(Range) && Range > 0 &&
                        Array.from({ length: Range }, (x, i) => (
                            <FormControlLabel
                                key={i + 1}
                                value={i + 1}
                                control={<Radio />}
                                label={i + 1}
                                labelPlacement="bottom"
                            />
                        ))
                    }
                </RadioGroup>
            </FormControl>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} sx={{ width: '100%', mt: 5 }}>
                <TextField
                    value={MinRangeLabel}
                    placeholder="Label for Min. Range"
                    fullWidth
                    onChange={(event) => handleLabelChange("min", event.target.value)}
                    error={isDirty && isStringNullOrEmpty(MinRangeLabel)}
                    helperText={isDirty && isStringNullOrEmpty(MinRangeLabel) ? "Min. Range Label is required." : ""}
                    size="small"
                />
                <TextField
                    value={MaxRangeLabel}
                    placeholder="Label for Max. Range"
                    fullWidth
                    onChange={(event) => handleLabelChange("max", event.target.value)}
                    error={isDirty && isStringNullOrEmpty(MaxRangeLabel)}
                    helperText={isDirty && isStringNullOrEmpty(MaxRangeLabel) ? "Max. Range Label is required." : ""}
                    size="small"
                />
            </Stack>
        </Stack>
    )
}