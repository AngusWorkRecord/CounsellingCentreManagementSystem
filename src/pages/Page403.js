import { m } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { Button, Typography } from '@mui/material';
import { tr, useUiLanguage } from '../locales/translate';
// components
import { MotionContainer, varBounce } from '../components/animate';
// assets
import { ForbiddenIllustration } from '../assets/illustrations';

// ----------------------------------------------------------------------

export default function Page403() {
  useUiLanguage();
  return (
    <>
      <Helmet>
        <title> {tr("403 Forbidden | Counselling Centre Management System")}</title>
      </Helmet>

      <MotionContainer>
        <m.div variants={varBounce().in}>
          <Typography variant="h3" paragraph>{tr("No permission")}</Typography>
        </m.div>

        <m.div variants={varBounce().in}>
          <Typography sx={{ color: 'text.secondary' }}>{tr("The page you're trying access has restricted access.")}<br />{tr("Please refer to your system administrator")}</Typography>
        </m.div>

        <m.div variants={varBounce().in}>
          <ForbiddenIllustration sx={{ height: 260, my: { xs: 5, sm: 10 } }} />
        </m.div>

        <Button component={RouterLink} to="/" size="large" variant="contained">{tr("Go to Home")}</Button>
      </MotionContainer>
    </>
  );
}
