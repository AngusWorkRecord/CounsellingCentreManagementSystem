import { Helmet } from 'react-helmet-async';
import { tr, useUiLanguage } from '../../locales/translate';
// sections
import Register from '../../sections/auth/Register';

// ----------------------------------------------------------------------

export default function RegisterPage() {
  useUiLanguage();
  return (
    <>
      <Helmet>
        <title> {tr("Register | Counselling Centre Management System")}</title>
      </Helmet>

      <Register />
    </>
  );
}
