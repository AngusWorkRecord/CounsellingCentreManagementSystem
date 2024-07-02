import { useState, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types';

// mui
import { Box, Button, Grid, IconButton, MenuItem, Stack, TextField, Paper, Typography, Switch, FormControlLabel, Divider, FormLabel } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

// import library
import { isArrayNotEmpty, isStringNullOrEmpty } from '../../../utils/Helpers'
import { FormStructureTemplate, QUESTION_TYPE } from './FormStructureTemplate';
import RangeComponent from './RangeComponent';
import Editor from '../../../components/editor/Editor';

// components
import Scrollbar from '../../../components/scrollbar';
import TextAnswerComponent from './TextAnswerComponent'
import MultiChoiceComponent from './MultiChoiceComponent';
import MultiSelectComponent from './MultiSelectComponent';

MainFormComponent.propTypes = {
    questions: PropTypes.array,
    title: PropTypes.string,
    description: PropTypes.string,
    isEdit: PropTypes.bool,
    isPresent: PropTypes.bool,
}

export default function MainFormComponent({ questions, title, description, isEdit, isPresent, ...other }) {
    const question = useMemo(
        () => (questions)
        , [questions]
    )

    const [currentFormLayout, setCurrentFormLayout] = useState(question)
    // const [formTitle, setFormTitle] = useState(title)
    // const [formDescription, setFormDescription] = useState(description)


    function renderFormComponents(index, q) {
        try {
            switch (q.QuestionType) {
                case QUESTION_TYPE.short_answer.value:
                    return <TextAnswerComponent
                        QuestionLabel={q.QuestionLabel}
                        QuestionPlaceholder={q.QuestionPlaceholder}
                        onChange={(value) => handleQuestionLabelOnChange(index, value)}
                    />

                case QUESTION_TYPE.long_answer.value:
                    return <TextAnswerComponent
                        QuestionLabel={q.QuestionLabel}
                        QuestionPlaceholder={q.QuestionPlaceholder}
                        onChange={(value) => handleQuestionLabelOnChange(index, value)}
                        multiline
                        maxRows={4}
                    />

                case QUESTION_TYPE.mulitiple_choice.value:
                    return <MultiChoiceComponent
                        QuestionID={index}
                        QuestionLabel={q.QuestionLabel}
                        QuestionPlaceholder={q.QuestionPlaceholder}
                        QuestionOptions={q.QuestionOptions}
                        onLabelChange={(value) => handleQuestionLabelOnChange(index, value)}
                        onAddOption={() => onAddOption(index)}
                        onRemoveOption={(optionIndex) => onRemoveOption(index, optionIndex)}
                        onChangeOptionLabel={(optionIndex, value) => onChangeOptionLabel(index, optionIndex, value)}
                    />

                case QUESTION_TYPE.mulitiple_selection.value:
                    return <MultiSelectComponent
                        QuestionID={index}
                        QuestionLabel={q.QuestionLabel}
                        QuestionPlaceholder={q.QuestionPlaceholder}
                        QuestionOptions={q.QuestionOptions}
                        onLabelChange={(value) => handleQuestionLabelOnChange(index, value)}
                        onAddOption={() => onAddOption(index)}
                        onRemoveOption={(optionIndex) => onRemoveOption(index, optionIndex)}
                        onChangeOptionLabel={(optionIndex, value) => onChangeOptionLabel(index, optionIndex, value)}
                    />

                case QUESTION_TYPE.range.value:
                    return <RangeComponent
                        QuestionID={index}
                        QuestionLabel={q.QuestionLabel}
                        QuestionPlaceholder={q.QuestionPlaceholder}
                        Range={q.Range}
                        MinRangeLabel={q.MinRangeLabel}
                        MaxRangeLabel={q.MaxRangeLabel}
                        onLabelChange={(value) => handleQuestionLabelOnChange(index, value)}
                        onRangeLabelChange={(minOrMax, value) => handleRangeLabelChange(index, minOrMax, value)}
                    />

                default:
                    console.warning("There are no kind of question type to render the form.")
                    return null;
            }
        }
        catch (error) {
            console.error(error)
            return null;
        }
    }

    // The functions for the form structure customization

    function handleQuestionTypeChange(index, selectedType) {
        if (isArrayNotEmpty(currentFormLayout)) {
            try {
                setCurrentFormLayout((prevState) => {
                    prevState[index].QuestionType = selectedType
                    prevState[index].QuestionLabel = isStringNullOrEmpty(prevState[index].QuestionLabel) ? "Question Label" : prevState[index].QuestionLabel

                    if (!isArrayNotEmpty(prevState[index].QuestionValues)) {
                        if (selectedType === QUESTION_TYPE.mulitiple_choice.value)
                            prevState[index].QuestionOptions = [...FormStructureTemplate.multipleChoiceComponent.QuestionOptions]

                        if (selectedType === QUESTION_TYPE.mulitiple_selection.value)
                            prevState[index].QuestionOptions = [...FormStructureTemplate.multipleSelectionComponent.QuestionOptions]
                    }

                    if (selectedType === QUESTION_TYPE.range.value) {
                        prevState[index].Range = FormStructureTemplate.rangeComponent.Range
                        prevState[index].MinRangeLabel = FormStructureTemplate.rangeComponent.MinRangeLabel
                        prevState[index].MaxRangeLabel = FormStructureTemplate.rangeComponent.MaxRangeLabel
                    }
                    console.log(prevState)
                    return [...prevState]
                })
            }
            catch {
                return null;
            }
        }

        return null;
    }

    function handleAddQuestion() {
        try {
            setCurrentFormLayout((prevState) => {
                const newStructure = { ...FormStructureTemplate.shortAnswerComponent }
                newStructure.QuestionOrder = prevState.length + 1
                return [...prevState, newStructure]
            })
        }
        catch (error) {
            console.log(error)
        }
    }

    function deleteSurveyQuestion(index) {
        try {
            setCurrentFormLayout((prevState) => {
                prevState.splice(index, 1)
                return [...prevState]
            })
        }
        catch (error) {
            console.log(error)
        }
    }

    function handleQuestionLabelOnChange(index, value) {
        try {
            setCurrentFormLayout((prevState) => {
                const obj = { ...prevState[index] }
                obj.QuestionLabel = value
                prevState[index] = { ...obj }
                return [...prevState]
            })
        }
        catch {
            return null;
        }
        return null;
    }

    const handleRangeLabelChange = (index, minOrMax, value) => {
        try {
            setCurrentFormLayout((prevState) => {
                const obj = { ...prevState[index] }
                if (minOrMax === "min")
                    obj.MinRangeLabel = value

                if (minOrMax === "max")
                    obj.MaxRangeLabel = value

                prevState[index] = { ...obj }
                return [...prevState]
            })
        }
        catch {
            return null;
        }
        return null;
    }

    function onAddOption(index) {
        try {
            setCurrentFormLayout((prevState) => {
                if (prevState[index].QuestionOptions.length < 10)
                    prevState[index].QuestionOptions.push({ label: 'New Option', value: 'New Option' })
                return [...prevState]
            })
        }
        catch (error) {
            console.log(error)
        }
    }

    function onChangeOptionLabel(questionIndex, optionIndex, value) {
        try {
            setCurrentFormLayout((prevState) => {
                const selectedOption = { ...prevState[questionIndex].QuestionOptions[optionIndex] }
                selectedOption.label = value
                selectedOption.value = value
                selectedOption.isDirty = true

                prevState[questionIndex].QuestionOptions[optionIndex] = { ...selectedOption }
                return [...prevState]
            })
        }
        catch (error) {
            console.log(error)
        }
    }

    function onRemoveOption(questionIndex, optionIndex) {
        try {
            setCurrentFormLayout((prevState) => {
                if (prevState[questionIndex].QuestionOptions.length > 1)
                    prevState[questionIndex].QuestionOptions.splice(optionIndex, 1)
                return [...prevState]
            })
        }
        catch (error) {
            console.log(error)
        }
    }

    // function handleFormTitleChange(e) {
    //     setFormTitle(e.target.value)
    // }


    // const handleQuillEditorChange = (value) => {
    //     // string handling before the quill save into the state
    //     setFormDescription(value)
    // }

    // The functions for the form structure customization -- END

    return (
        <Box sx={{ p: 2, }}>
            {/* <Paper sx={{ mb: 3 }}>
                <FormLabel sx={{ color: 'black' }}>
                    Title
                </FormLabel>
                <TextField
                    value={formTitle}
                    placeholder={"Write the title for this form"}
                    fullWidth
                    required
                    onChange={handleFormTitleChange}
                    sx={{ mb: 2 }}
                />
                <FormLabel sx={{ color: 'black' }}>
                    Description
                </FormLabel>
                <Editor
                    onChange={(value) => handleQuillEditorChange(value)}
                    placeholder={"Write the description for this form"}
                />
            </Paper> */}
            <Divider />
            <Scrollbar>
                <Stack>
                    {
                        isArrayNotEmpty(currentFormLayout) &&
                        currentFormLayout.map((q, index) => (
                            <Paper square variant="outlined" sx={{ p: 1 }} key={`question ${index + 1}`}>
                                <Typography variant="subtitle1" sx={{ m: 1, }}>
                                    {`${index + 1}.`}
                                </Typography>
                                <Grid container columnSpacing={2}>
                                    <Grid item xs={12} md={9} sx={{ mt: 1 }}>
                                        {
                                            renderFormComponents(index, q)
                                        }
                                    </Grid>
                                    <Grid item xs={12} md={3} sx={{ mt: 1 }}>
                                        <Stack spacing={1}>
                                            <FormComponentOptions
                                                onChange={(value) => handleQuestionTypeChange(index, value)}
                                                questionType={q.QuestionType}
                                                sx={{ px: 1 }}
                                                variant="standard"
                                            />
                                            <Box sx={{ display: 'flex', alignItems: 'center', width: 'fit-content', }}>
                                                <FormControlLabel
                                                    control={<Switch sx={{ m: 1 }} defaultChecked={q.isRequired} />}
                                                    label="Required"
                                                />
                                                <Divider orientation="vertical" variant="middle" flexItem />
                                                <IconButton aria-label="delete" size="medium" sx={{ m: 1 }} onClick={() => { deleteSurveyQuestion(index) }}>
                                                    <DeleteIcon fontSize="inherit" />
                                                </IconButton>
                                            </Box>
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </Paper>
                        )
                        )
                    }
                    <Button variant="text" onClick={() => handleAddQuestion} sx={{ mt: 2 }}>
                        Add Question
                    </Button>
                </Stack>
            </Scrollbar>
        </Box>
    )
}

FormComponentOptions.propTypes = {
    onChange: PropTypes.func,
    questionType: PropTypes.string,
}

function FormComponentOptions({ onChange, questionType, ...others }) {
    const value = useMemo(() => (
        questionType
    ), [questionType])

    return (
        <TextField
            select
            value={value}
            onChange={(e) => { onChange(e.target.value) }}
            label="Type"
            fullWidth
            {...others}
        >
            {Object.keys(QUESTION_TYPE).map((key) => (
                <MenuItem key={QUESTION_TYPE[key].label} value={QUESTION_TYPE[key].value}>
                    {QUESTION_TYPE[key].label}
                </MenuItem>
            ))}
        </TextField>
    )
}