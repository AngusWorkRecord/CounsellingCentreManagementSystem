import PropTypes from 'prop-types';
// components
import { Card, Stack, Button, Divider, Box } from '@mui/material';
import MainFormComponent from '../../custom-forms-components/MainFormComponent';

// ----------------------------------------------------------------------

RegistrationFormSetting.propTypes = {
    formData: PropTypes.object,
    isEdit: PropTypes.bool,
    handlePrevStep: PropTypes.func,
    handleNextStep: PropTypes.func,
};

export default function RegistrationFormSetting({ formData, isEdit, handlePrevStep, handleNextStep }) {
    const questionTitle = "Form Template"
    const questionDescription = "Form Template Descrtiption"
    const defaultQuestions = [
        {
            FormStructureID: 0,
            QuestionOrder: 1,
            QuestionType: 'short-answer',
            QuestionLabel: 'Participant Name',
            QuestionPlaceholder: 'Write the label for the question',
            QuestionOptions: [],
            Range: 0,
            MinRangeLabel: '',
            MaxRangeLabel: '',
            isRequired: true,
        },
        {
            FormStructureID: 0,
            QuestionOrder: 2,
            QuestionType: 'short-answer',
            QuestionLabel: 'Which Institution are you from?',
            QuestionPlaceholder: 'eg: USCI Sarawak',
            QuestionOptions: [],
            Range: 0,
            MinRangeLabel: '',
            MaxRangeLabel: '',
            isRequired: false,
        },
        {
            FormStructureID: 0,
            QuestionOrder: 3,
            QuestionType: 'short-answer',
            QuestionLabel: 'NRIC',
            QuestionPlaceholder: '123456-12-1234',
            QuestionOptions: [],
            Range: 0,
            MinRangeLabel: '',
            MaxRangeLabel: '',
            isRequired: true,
        },
        {
            FormStructureID: 0,
            QuestionOrder: 4,
            QuestionType: 'short-answer',
            QuestionLabel: 'Contact Number',
            QuestionPlaceholder: '010 - 123 4567',
            QuestionOptions: [],
            Range: 0,
            MinRangeLabel: '',
            MaxRangeLabel: '',
            isRequired: true,
        },
        {
            FormStructureID: 0,
            QuestionOrder: 5,
            QuestionType: 'short-answer',
            QuestionLabel: 'Email Address',
            QuestionPlaceholder: 'example@gmail.com',
            QuestionOptions: [],
            Range: 0,
            MinRangeLabel: '',
            MaxRangeLabel: '',
            isRequired: true,
        },
        {
            FormStructureID: 0,
            QuestionOrder: 6,
            QuestionType: 'multiple-choice',
            QuestionLabel: 'Do you need the certifacte for this conference meeting?',
            QuestionPlaceholder: '',
            QuestionOptions: [{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' },],
            Range: 0,
            MinRangeLabel: '',
            MaxRangeLabel: '',
            isRequired: true,
        },
        {
            FormStructureID: 0,
            QuestionOrder: 7,
            QuestionType: 'short-answer',
            QuestionLabel: 'Preferred name for certifacte',
            QuestionPlaceholder: '',
            QuestionOptions: [],
            Range: 0,
            MinRangeLabel: '',
            MaxRangeLabel: '',
            isRequired: false,
        },
    ]

    const onPrev = (data) => {
        handlePrevStep()
    }

    const onNext = (data) => {
        handleNextStep()
    }

    return (
        <Card sx={{ p: 2, }} elevation={1}>
            <Stack direction="row-reverse" sx={{ py: 1, mb: 2 }} spacing={1}>
                <Button variant="contained">
                    Submit Layout
                </Button>
                <Button variant="outlined">
                    Use a Template
                </Button>
            </Stack>

            <Box sx={{ maxHeight: 468, overflowY: 'auto' }} key="Registration Form" >
                <MainFormComponent questions={defaultQuestions} title={questionTitle} description={questionDescription} />
            </Box>

            <Divider />
            <Stack direction="column" alignItems="flex-end" sx={{ py: 1, mt: 2 }}>
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
                        Next
                    </Button>
                </div>
            </Stack>
        </Card>
    )
}