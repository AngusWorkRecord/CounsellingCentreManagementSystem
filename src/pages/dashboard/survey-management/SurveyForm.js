import { Helmet } from 'react-helmet-async';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

// @mui
import { Box, Button, Card, Container, Stack } from "@mui/material";
import Iconify from '../../../components/iconify';

// path
import { PATH_CONFERENCE_MANAGEMENT } from '../../../routes/paths';

// components
import MainFormComponent from '../custom-forms-components/MainFormComponent';
import { useSettingsContext } from '../../../components/settings';

// ----------------------------------------------------------------------

SurveyForm.propTypes = {
    question: PropTypes.array,
};

const defaultQuestion = [
    {
        QuestionOrder: 1,
        QuestionType: 'short-answer',
        QuestionLabel: 'Untitled Question',
        QuestionPlaceholder: 'Write the label for the question',
        QuestionOptions: [],
        Range: 0,
        MinRangeLabel: '',
        MaxRangeLabel: '',
        isRequired: true,
    },
]

export default function SurveyForm({ question }) {
    const themeStretch = useSettingsContext()

    function handleOnCreate() {
        console.log('Create')
    }

    return (
        <>
            <Helmet>
                <title> Conference Management | Create Conference </title>
            </Helmet>

            <Container maxWidth={themeStretch ? false : 'xl'}>
                <Stack
                    sx={{
                        position: 'sticky',
                        top: 60,
                        bgcolor: 'rgba(255, 255, 255, 1)',
                        zIndex: 5
                    }}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                >
                    <Button
                        startIcon={<Iconify icon="ic:outline-arrow-back-ios" />}
                        sx={{
                            m: 1
                        }}
                        component={RouterLink}
                        to={PATH_CONFERENCE_MANAGEMENT.survey.root}
                    >
                        Back
                    </Button>

                    <Button sx={{ m: 1 }} variant="contained">
                        Create
                    </Button>
                </Stack>

                <Box sx={{ my: 3 }}>
                    <MainFormComponent questions={defaultQuestion} title="" description="" />
                </Box>
            </Container>
        </>
    )
}