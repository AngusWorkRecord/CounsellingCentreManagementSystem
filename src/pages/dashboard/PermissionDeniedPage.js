import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
// @mui
import {
  Box,
  Card,
  Container,
  Typography,
  CardHeader,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { tr, useUiLanguage } from '../../locales/translate';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// components
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
// auth
import RoleBasedGuard from '../../auth/RoleBasedGuard';

// ----------------------------------------------------------------------

export default function PermissionDeniedPage() {
  useUiLanguage();
  const { themeStretch } = useSettingsContext();

  const [role, setRole] = useState('admin');

  const handleChangeRole = (event, newRole) => {
    if (newRole !== null) {
      setRole(newRole);
    }
  };

  return (
    <>
      <Helmet>
        <title> {tr("Other Cases: Permission Denied | Counselling Centre Management System")}</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading={tr("Permission Denied")}
          links={[
            {
              name: tr("Dashboard"),
              href: PATH_DASHBOARD.root,
            },
            {
              name: tr("Permission Denied"),
            },
          ]}
        />

        <ToggleButtonGroup
          exclusive
          value={role}
          onChange={handleChangeRole}
          color="primary"
          sx={{ mb: 5 }}
        >
          <ToggleButton value="admin" aria-label={tr("admin role")}>
            isAdmin
          </ToggleButton>

          <ToggleButton value="user" aria-label={tr("user role")}>
            isUser
          </ToggleButton>
        </ToggleButtonGroup>

        <RoleBasedGuard hasContent roles={[role]}>
          <Box gap={3} display="grid" gridTemplateColumns="repeat(2, 1fr)">
            {[...Array(8)].map((_, index) => (
              <Card key={index}>
                <CardHeader title={tr("Card {{p0}}", { p0: index + 1 })} subheader={tr("Proin viverra ligula")} />

                <Typography sx={{ p: 3, color: 'text.secondary' }}>{tr("Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Vestibulum fringilla pede sit amet augue.")}</Typography>
              </Card>
            ))}
          </Box>
        </RoleBasedGuard>
      </Container>
    </>
  );
}
