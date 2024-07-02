import { useState, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import { Stack, Button, TextField, Typography, FormControl, FormControlLabel, } from "@mui/material";
import { isStringNullOrEmpty } from '../../../utils/Helpers';

TextAnswerComponent.propTypes = {
    QuestionID: PropTypes.number,
    QuestionLabel: PropTypes.string,
    QuestionPlaceholder: PropTypes.string,
    onChange: PropTypes.func,
}

export default function TextAnswerComponent({ QuestionLabel, QuestionPlaceholder, onChange, ...others }) {
    const [isDirty, setIsDirty] = useState(false)

    const handleChange = (event) => {
        setIsDirty(true)
        try {
            onChange(event.target.value)
        }
        catch (error) {
            console.error(error)
        }
    }

    return (
        <Stack direction="row" justifyContent="flex-start" alignItems="center" spacing={2} sx={{ width: '100%' }}>
            <TextField
                value={QuestionLabel}
                placeholder={QuestionPlaceholder}
                fullWidth
                required
                onChange={handleChange}
                error={isDirty && isStringNullOrEmpty(QuestionLabel)}
                helperText={isDirty && isStringNullOrEmpty(QuestionLabel) ? "Question Label is required." : ""}
                {...others}
            />
        </Stack>
    )
}