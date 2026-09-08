import { Helmet } from 'react-helmet-async';
import { tr, useUiLanguage } from '../../locales/translate';
// sections
import Login from '../../sections/auth/Login';
// import Login from '../../sections/auth/LoginAuth0';

// ----------------------------------------------------------------------

export default function LoginPage() {
  useUiLanguage();
  return (
    <>
      <Helmet>
        <title>{tr("Login | CounsellingCentreManagementSystem")}</title>
      </Helmet>

      <Login />
    </>
  );
}
