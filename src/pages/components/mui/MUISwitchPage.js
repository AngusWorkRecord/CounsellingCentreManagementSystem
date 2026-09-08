import { Helmet } from 'react-helmet-async';
// @mui
import { Box, Switch, Container, FormGroup, FormControl, FormControlLabel } from '@mui/material';
import { Masonry } from '@mui/lab';
import { tr, useUiLanguage } from '../../../locales/translate';
// routes
import { PATH_PAGE } from '../../../routes/paths';
// components
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';
// sections
import { Block } from '../../../sections/_examples/Block';

// ----------------------------------------------------------------------

const COLORS = ['default', 'primary', 'secondary', 'info', 'success', 'warning', 'error'];

const PLACEMENTS = ['top', 'start', 'bottom', 'end'];

const style = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexWrap: 'wrap',
  '& > *': { mx: '8px !important' },
};

// ----------------------------------------------------------------------

export default function MUISwitchPage() {
  useUiLanguage();
  return (
    <>
      <Helmet>
        <title> {tr("MUI Components: Switch | Counselling Centre Management System")}</title>
      </Helmet>

      <Box
        sx={{
          pt: 6,
          pb: 1,
          bgcolor: (theme) => (theme.palette.mode === 'light' ? 'grey.200' : 'grey.800'),
        }}
      >
        <Container>
          <CustomBreadcrumbs
            heading={tr("Switch")}
            links={[
              {
                name: tr("Components"),
                href: PATH_PAGE.components,
              },
              { name: tr("Switch") },
            ]}
            moreLink={['https://mui.com/components/switches']}
          />
        </Container>
      </Box>

      <Container sx={{ my: 10 }}>
        <Masonry columns={{ xs: 1, md: 2 }} spacing={3}>
          <Block title={tr("Basic")} sx={style}>
            <Switch defaultChecked />
            <Switch />
            <Switch disabled />
            <Switch disabled checked />
            <Switch defaultChecked color="default" />
          </Block>

          <Block title={tr("Sizes")} sx={style}>
            <FormGroup row>
              <FormControlLabel control={<Switch size="small" />} label={tr("Small")} />
              <FormControlLabel control={<Switch />} label={tr("Normal")} />
            </FormGroup>
          </Block>

          <Block title={tr("Placement")} sx={style}>
            <FormGroup row>
              {PLACEMENTS.map((placement) => (
                <FormControlLabel
                  key={placement}
                  value={placement}
                  label={placement}
                  labelPlacement={placement}
                  control={<Switch />}
                  sx={{ textTransform: 'capitalize' }}
                />
              ))}
            </FormGroup>
          </Block>

          <Block title={tr("Colors")}>
            <FormControl component="fieldset">
              <FormGroup>
                {COLORS.map((color) => (
                  <FormControlLabel
                    key={color}
                    control={<Switch defaultChecked color={color} />}
                    label={color}
                    sx={{ textTransform: 'capitalize' }}
                  />
                ))}

                <FormControlLabel disabled control={<Switch color="error" />} label={tr("Disabled")} />
              </FormGroup>
            </FormControl>
          </Block>
        </Masonry>
      </Container>
    </>
  );
}
