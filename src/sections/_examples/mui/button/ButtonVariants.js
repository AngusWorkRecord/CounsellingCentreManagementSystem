import PropTypes from 'prop-types';
// @mui
import { Button } from '@mui/material';
import { LoadingButton, Masonry } from '@mui/lab';
import { tr, useUiLanguage } from '../../../../locales/translate';
// components
import Iconify from '../../../../components/iconify';
//
import { Block } from '../../Block';

// ----------------------------------------------------------------------

const style = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexWrap: 'wrap',
  '& > *': { mx: '8px !important' },
};

const COLORS = ['inherit', 'primary', 'secondary', 'info', 'success', 'warning', 'error'];

const SIZES = ['small', 'medium', 'large'];

// ----------------------------------------------------------------------

ButtonVariant.propTypes = {
  variant: PropTypes.string,
};

export default function ButtonVariant({ variant = 'text' }) {
  useUiLanguage();
  return (
    <Masonry columns={2} spacing={3}>
      <Block title={tr("Base")} sx={style}>
        <Button variant={variant} color="inherit">{tr("Default")}</Button>

        <Button variant={variant}>{tr("Primary")}</Button>

        <Button variant={variant} color="secondary">{tr("Secondary")}</Button>

        <Button variant={variant} disabled>{tr("Disabled")}</Button>

        <Button variant={variant}>{tr("Link")}</Button>
      </Block>

      <Block title={tr("Colors")} sx={style}>
        {COLORS.map((color) => (
          <Button key={color} variant={variant} color={color}>
            {color === 'inherit' ? tr("default") : color}
          </Button>
        ))}
      </Block>

      <Block title={tr("With Icon & Loading")} sx={style}>
        <Button
          variant={variant}
          color="error"
          startIcon={<Iconify icon="ic:round-access-alarm" />}
        >{tr("Icon Left")}</Button>

        <Button variant={variant} color="error" endIcon={<Iconify icon="ic:round-access-alarm" />}>{tr("Icon Right")}</Button>

        <LoadingButton loading variant={variant}>{tr("Submit")}</LoadingButton>

        <LoadingButton loading loadingIndicator="Loading..." variant={variant}>{tr("Fetch data")}</LoadingButton>

        <LoadingButton
          loading
          size="large"
          loadingPosition="start"
          startIcon={<Iconify icon="ic:round-access-alarm" />}
          variant={variant}
        >{tr("Start")}</LoadingButton>

        <LoadingButton
          loading
          size="large"
          loadingPosition="end"
          endIcon={<Iconify icon="ic:round-access-alarm" />}
          variant={variant}
        >{tr("End")}</LoadingButton>
      </Block>

      <Block title={tr("Size")} sx={style}>
        {SIZES.map((size) => (
          <Button key={size} variant={variant} color="info" size={size}>
            {tr(size)}
          </Button>
        ))}
      </Block>
    </Masonry>
  );
}
