import PropTypes from 'prop-types';
// @mui
import { Typography, Stack } from '@mui/material';
// components
import Logo from '../../components/logo';
import Image from '../../components/image';
//
import { StyledRoot, StyledSectionBg, StyledSection, StyledContent } from './styles';

// ----------------------------------------------------------------------

LoginLayout.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
  illustration: PropTypes.string,
};

export default function LoginLayout({ children, illustration, title }) {
  return (
    <StyledRoot>


      <StyledSection>
        <Typography variant="h3" sx={{ mb: 10, maxWidth: 480, textAlign: 'center' }}>
          {title || 'Hi, Welcome back'}
        </Typography>

        {/* <Logo
  
          sx={{
            zIndex: 9,
            position: 'absolute',
            mt: { xs: 1.5, md: 10 },
            ml: { xs: 2, md: 10 },
          }}
        /> */}
        {/* <Image
          disabledEffect
          visibleByDefault
          alt="auth"
          src={illustration || '/assets/illustrations/illustration_dashboard.png'}
          sx={{ maxWidth: 720 }}
        /> */}

        <Image
          disabledEffect
          visibleByDefault
          alt="auth"
          src='https://cphtravel.com.my/wp-content/uploads/2018/11/Picture3.png'
          sx={{ maxWidth: 720 }}
        />

        {/* <img src="https://cphtravel.com.my/wp-content/uploads/2018/11/Picture3.png" alt="Home" style={{ width: '50%' }} /> */}


        <StyledSectionBg />
      </StyledSection>

      <StyledContent>
        <Stack sx={{ width: 1 }}> {children} </Stack>
      </StyledContent>
    </StyledRoot>
  );
}
