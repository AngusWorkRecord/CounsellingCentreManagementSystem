import { Helmet } from 'react-helmet-async';
// @mui
import { Box, Button, Container } from '@mui/material';
import { Masonry } from '@mui/lab';
import { tr, useUiLanguage } from '../../../locales/translate';
// routes
import { PATH_PAGE } from '../../../routes/paths';
// components
import { useSnackbar } from '../../../components/snackbar';
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';
// sections
import { Block } from '../../../sections/_examples/Block';

// ----------------------------------------------------------------------

const style = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexWrap: 'wrap',
  '& > *': { mx: '8px !important' },
};

// ----------------------------------------------------------------------

export default function DemoSnackbarPage() {
  useUiLanguage();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const onSnackbarAction = (color, anchor) => {
    enqueueSnackbar(tr("This is an {{p0}}", { p0: color }), {
      variant: color,
      anchorOrigin: anchor,
      action: (key) => (
        <>
          <Button
            size="small"
            color={color !== 'default' ? color : 'primary'}
            onClick={() => {
              console.log(`I belong to snackbar with key ${key}`);
            }}
          >{tr("Alert")}</Button>

          <Button size="small" color="inherit" onClick={() => closeSnackbar(key)}>{tr("Dismiss")}</Button>
        </>
      ),
    });
  };

  return (
    <>
      <Helmet>
        <title> {tr("Extra Components: Snackbar | Counselling Centre Management System")}</title>
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
            heading={tr("Snackbar")}
            links={[
              {
                name: tr("Components"),
                href: PATH_PAGE.components,
              },
              { name: tr("Snackbar") },
            ]}
            moreLink={[
              'https://mui.com/components/snackbars',
              'https://www.iamhosseindhv.com/notistack',
            ]}
          />
        </Container>
      </Box>

      <Container sx={{ my: 10 }}>
        <Masonry columns={{ xs: 1, md: 2 }} spacing={3}>
          <Block title={tr("Simple")} sx={style}>
            <Button
              variant="contained"
              color="inherit"
              onClick={() => enqueueSnackbar(tr("This is an default"), { variant: 'default' })}
            >{tr("Default")}</Button>
            <Button
              variant="contained"
              color="info"
              onClick={() => enqueueSnackbar(tr("This is an info"), { variant: 'info' })}
            >{tr("Info")}</Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => enqueueSnackbar(tr("This is an success"), {})}
            >{tr("Success")}</Button>
            <Button
              variant="contained"
              color="warning"
              onClick={() =>
                enqueueSnackbar(tr("This is an warning"), {
                  variant: 'warning',
                })
              }
            >{tr("Warning")}</Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => enqueueSnackbar(tr("This is an error"), { variant: 'error' })}
            >{tr("Error")}</Button>
          </Block>

          <Block title={tr("With Close")} sx={style}>
            <Button
              variant="contained"
              color="inherit"
              onClick={() =>
                enqueueSnackbar(tr("This is an default"), {
                  variant: 'default',
                })
              }
            >{tr("Default")}</Button>
            <Button
              variant="contained"
              color="info"
              onClick={() =>
                enqueueSnackbar(tr("This is an info"), {
                  variant: 'info',
                })
              }
            >{tr("Info")}</Button>
            <Button
              variant="contained"
              color="success"
              onClick={() =>
                enqueueSnackbar(tr("This is an success"), {
                  variant: 'success',
                })
              }
            >{tr("Success")}</Button>
            <Button
              variant="contained"
              color="warning"
              onClick={() =>
                enqueueSnackbar(tr("This is an warning"), {
                  variant: 'warning',
                })
              }
            >{tr("Warning")}</Button>
            <Button
              variant="contained"
              color="error"
              onClick={() =>
                enqueueSnackbar(tr("This is an error"), {
                  variant: 'error',
                })
              }
            >{tr("Error")}</Button>
          </Block>

          <Block title={tr("With Action")} sx={style}>
            <Button variant="contained" color="inherit" onClick={() => onSnackbarAction('default')}>{tr("Default")}</Button>
            <Button variant="contained" color="info" onClick={() => onSnackbarAction('info')}>{tr("Info")}</Button>
            <Button variant="contained" color="success" onClick={() => onSnackbarAction('success')}>{tr("Success")}</Button>
            <Button variant="contained" color="warning" onClick={() => onSnackbarAction('warning')}>{tr("Warning")}</Button>
            <Button variant="contained" color="error" onClick={() => onSnackbarAction('error')}>{tr("Error")}</Button>
          </Block>

          <Block title="anchorOrigin" sx={style}>
            <Button
              variant="text"
              color="inherit"
              onClick={() =>
                onSnackbarAction('default', {
                  vertical: 'top',
                  horizontal: 'left',
                })
              }
            >{tr("Top Left")}</Button>
            <Button
              variant="text"
              color="inherit"
              onClick={() =>
                onSnackbarAction('default', {
                  vertical: 'top',
                  horizontal: 'center',
                })
              }
            >{tr("Top Center")}</Button>
            <Button variant="text" color="inherit" onClick={() => onSnackbarAction('default')}>{tr("Top Right")}</Button>
            <Button
              variant="text"
              color="inherit"
              onClick={() =>
                onSnackbarAction('default', {
                  vertical: 'bottom',
                  horizontal: 'left',
                })
              }
            >{tr("Bottom Left")}</Button>
            <Button
              variant="text"
              color="inherit"
              onClick={() =>
                onSnackbarAction('default', {
                  vertical: 'bottom',
                  horizontal: 'center',
                })
              }
            >{tr("Bottom Center")}</Button>
            <Button
              variant="text"
              color="inherit"
              onClick={() =>
                onSnackbarAction('default', {
                  vertical: 'bottom',
                  horizontal: 'right',
                })
              }
            >{tr("Bottom Right")}</Button>
          </Block>
        </Masonry>
      </Container>
    </>
  );
}
