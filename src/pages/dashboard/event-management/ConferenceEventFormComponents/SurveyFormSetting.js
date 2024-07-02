import PropTypes from 'prop-types';
// components
import { Card, Stack, Button, Divider, Box } from '@mui/material';
import MainFormComponent from '../../custom-forms-components/MainFormComponent';

// ----------------------------------------------------------------------

SurveyFormSetting.propTypes = {
    formData: PropTypes.object,
    isEdit: PropTypes.bool,
    handlePrevStep: PropTypes.func,
    handleNextStep: PropTypes.func,
};

export default function SurveyFormSetting({ formData, isEdit, handlePrevStep, handleNextStep }) {
    const defaultQuestions = [
        {
            FormStructureID: 0,
            QuestionOrder: 1,
            QuestionType: 'short-answer',
            QuestionLabel: 'Survey Untitled Label',
            QuestionPlaceholder: 'Write the label for the question',
            QuestionOptions: [],
            Range: 0,
            MinRangeLabel: '',
            MaxRangeLabel: '',
            isRequired: true,
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

            <Box sx={{ maxHeight: 468, overflowY: 'auto' }} key="Conference Event Survey Form">
                <MainFormComponent questions={defaultQuestions} title="" description="" />
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