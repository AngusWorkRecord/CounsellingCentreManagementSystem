import { Helmet } from 'react-helmet-async';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

// @mui
import { useTheme } from '@mui/material/styles';
import { Container, Grid, } from '@mui/material';
import { tr, useUiLanguage } from '../../../locales/translate';

// auth
import { useAuthContext } from '../../../auth/useAuthContext';

// components
import { useSettingsContext } from '../../../components/settings';
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs/CustomBreadcrumbs';

// path
import { PATH_CONFERENCE_MANAGEMENT } from '../../../routes/paths';

// ----------------------------------------------------------------------

export default function JournalManagementIndexPage() {
  useUiLanguage();
    const theme = useTheme();
    const { themeStretch } = useSettingsContext();
    const navigate = useNavigate();

    return (
        <>
            <Helmet>
                <title> {tr("Dashboard | Journal Management")} </title>
            </Helmet>

            <Container maxWidth={themeStretch ? false : 'xl'}>
                <Grid container spacing={3}>

                    <Grid item xs={12} md={12}>
                        <Grid container>
                            <Grid item xs={12} md={12}>
                                <CustomBreadcrumbs
                                    heading={tr("Journal Management")}
                                    links={[
                                        { name: tr("Dashboard"), href: PATH_CONFERENCE_MANAGEMENT.root },
                                        { name: tr("Journal Management"), href: PATH_CONFERENCE_MANAGEMENT.journal.root },

                                    ]}
                                    action={
                                        <>
                                            {/* <Button
                                                component={RouterLink}
                                                to={PATH_CONFERENCE_MANAGEMENT.conference.form}
                                                variant="contained"
                                                startIcon={<Iconify icon="eva:plus-fill" />}
                                            >
                                                Create Survey
                                            </Button> */}
                                        </>
                                    }
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>


            </Container>
        </>
    );
}
