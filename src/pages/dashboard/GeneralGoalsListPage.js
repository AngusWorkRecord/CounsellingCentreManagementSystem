import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
// @mui
import { Container } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// _mock_
import { _invoices } from '../../_mock/arrays';
// components
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
// sections
import InvoiceDetails from '../../sections/@dashboard/invoice/details';

// ----------------------------------------------------------------------

export default function GeneralGoalsListPage() {
  const { themeStretch } = useSettingsContext();

  const { selectedID } = useParams();

  const currentInvoice = _invoices.find((invoice) => invoice.id === selectedID);

  return (
    <>
      <Helmet>
        <title> Goals Details </title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Goal Details || Overall Performance"
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            // {
            //   name: 'Goals',
            //   href: PATH_DASHBOARD.general.goals,
            // },
            // { name: `Goal-${currentInvoice?.invoiceNumber}` },
          ]}
        />

        <InvoiceDetails invoice={currentInvoice} />
      </Container>
    </>
  );
}
