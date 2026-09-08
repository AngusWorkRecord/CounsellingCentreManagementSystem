import { useState } from 'react';
// @mui
import { alpha } from '@mui/material/styles';
import {
  Box,
  Step,
  Paper,
  Button,
  Stepper,
  StepLabel,
  Typography,
  StepContent,
} from '@mui/material';
import { tr, useUiLanguage } from '../../../../locales/translate';

// ----------------------------------------------------------------------

const steps = [
  {
    get label() { return tr("Select campaign settings"); },
    description: tr("For each ad campaign that you create, you can control how much\n              you're willing to spend on clicks and conversions, which networks\n              and geographical locations you want your ads to show on, and more."),
  },
  {
    get label() { return tr("Create an ad group"); },
    get description() { return tr("An ad group contains one or more ads which target a shared set of keywords."); },
  },
  {
    get label() { return tr("Create an ad"); },
    description: tr("Try out different ad text to see what brings in the most customers,\n              and learn how to enhance your ads using features like ad extensions.\n              If you run into any problems with your ads, find out how to tell if\n              they're running and how to resolve approval issues."),
  },
];

export default function VerticalLinearStepper() {
  useUiLanguage();
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel
              optional={index === 2 ? <Typography variant="caption">{tr("Last step")}</Typography> : null}
            >
              {step.label}
            </StepLabel>
            <StepContent>
              <Typography>{step.description}</Typography>
              <Box sx={{ mt: 3 }}>
                <Button variant="contained" onClick={handleNext}>
                  {index === steps.length - 1 ? tr("Finish") : tr("Continue")}
                </Button>
                <Button disabled={index === 0} onClick={handleBack}>{tr("Back")}</Button>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>

      {activeStep === steps.length && (
        <Paper
          sx={{
            p: 3,
            mt: 3,
            bgcolor: (theme) => alpha(theme.palette.grey[500], 0.12),
          }}
        >
          <Typography paragraph>{tr("All steps completed - you're finished")}</Typography>
          <Button onClick={handleReset}>{tr("Reset")}</Button>
        </Paper>
      )}
    </>
  );
}
