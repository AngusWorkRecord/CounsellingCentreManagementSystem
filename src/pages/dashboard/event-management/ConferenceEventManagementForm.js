import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

// @mui
import { useTheme } from '@mui/material/styles';
import { Container, Grid, Button, Stepper, Step, StepLabel, StepContent, Box, Typography, Card, StepButton } from '@mui/material';

// components
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs/CustomBreadcrumbs';
import { useSettingsContext } from '../../../components/settings';
import Scrollbar from '../../../components/scrollbar';
import Iconify from '../../../components/iconify';

// path
import { PATH_CONFERENCE_MANAGEMENT } from '../../../routes/paths';

// utils
import { isObjectUndefinedOrNull } from '../../../utils/Helpers';

// auth
import { useAuthContext } from '../../../auth/useAuthContext';


// form components
import { BasicInfoForm, DescriptionForm, RegistrationFormSetting, SurveyFormSetting, TrackerSettingForm } from './ConferenceEventFormComponents';


ConferenceEventManagementForm.propTypes = {
    event: PropTypes.object,
  };
export default function ConferenceEventManagementForm({ event }) {
    const { user } = useAuthContext();
    const theme = useTheme();
    const themeStretch = useSettingsContext()

    const navigate = useNavigate();

    // stepper functions
    const [activeStep, setActiveStep] = useState(0);
    const [completed, setCompleted] = useState({});

    const totalSteps = () =>    formSteps.length;

    const completedSteps = () =>   Object.keys(completed).length;


    const handleNext = () => {
        setActiveStep((prevActiveStep => prevActiveStep + 1));
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleStep = (step) => () => {
        setActiveStep(step);
    };

    const handleReset = () => {
        setActiveStep(0);
    };

    const handleFinsih = () => {
        alert("You are finish the form")
    };
    // stepper functions

    const formSteps = [
        {
            label: 'Basic Info',
            content: <BasicInfoForm handleNextStep={handleNext} isEdit={false} />,
        },
        {
            label: 'Description & Brochures',
            content: <DescriptionForm handleNextStep={handleNext} handlePrevStep={handleBack} isEdit={false} />,
        },
        {
            label: 'Registration Form',
            content: <RegistrationFormSetting handleNextStep={handleNext} handlePrevStep={handleBack} isEdit={false} />,
        },
        {
            label: 'Survey Form',
            content: <SurveyFormSetting handleNextStep={handleNext} handlePrevStep={handleBack} isEdit={false} />,
        },
        {
            label: 'Tracing Forms',
            content: <TrackerSettingForm handleNextStep={handleFinsih} handlePrevStep={handleBack} isEdit={false} />,
        },
    ];

    return (
        <>
            <Helmet>
                <title> Conference Management | Create Conference </title>
            </Helmet>

            <Container maxWidth={themeStretch ? false : 'xl'}>
                <Box>
                    <Button
                        startIcon={<Iconify icon="ic:outline-arrow-back-ios" />}
                        sx={{
                            m: 1
                        }}
                        component={RouterLink}
                        to={PATH_CONFERENCE_MANAGEMENT.conference.root}
                    >
                        Back
                    </Button>
                </Box>
                <Box>
                    <Stepper activeStep={activeStep} orientation="vertical" nonLinear>
                        {formSteps.map((step, index) => (
                            <Step key={step.label} completed={completed[index]}>
                                <StepButton color="inherit" onClick={handleStep(index)}>
                                    {step.label}
                                </StepButton>
                                <StepContent>
                                    <Card sx={{ my: 2 }}>
                                        {
                                            !isObjectUndefinedOrNull(step.content) && step.content
                                        }
                                    </Card>
                                    {/* <Box sx={{ mb: 2 }}>
                                        <div>
                                            <Button
                                                variant="contained"
                                                onClick={handleNext}
                                                sx={{ mt: 1, mr: 1 }}
                                            >
                                                {index === totalSteps() - 1 ? 'Complete' : 'Next'}
                                            </Button>
                                            <Button
                                                disabled={index === 0}
                                                onClick={handleBack}
                                                sx={{ mt: 1, mr: 1 }}
                                            >
                                                Back
                                            </Button>
                                        </div>
                                    </Box> */}
                                </StepContent>
                            </Step>
                        ))}
                    </Stepper>
                </Box>
            </Container>
        </>
    )
}