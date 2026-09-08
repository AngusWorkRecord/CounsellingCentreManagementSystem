// @mui
import { Fab } from '@mui/material';
import { Masonry } from '@mui/lab';
import { tr, useUiLanguage } from '../../../../locales/translate';
// components
import Iconify from '../../../../components/iconify';
import { FabButtonAnimate } from '../../../../components/animate';
//
import { Block } from '../../Block';

// ----------------------------------------------------------------------

const style = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexWrap: 'wrap',
  '& > *': { m: '8px !important' },
};

const COLORS = [
  'default',
  'inherit',
  'primary',
  'secondary',
  'info',
  'success',
  'warning',
  'error',
];

const SIZES = ['small', 'medium', 'large'];

// ----------------------------------------------------------------------

export default function FloatingActionButton() {
  useUiLanguage();
  return (
    <Masonry columns={2} spacing={3}>
      <Block title={tr("Default")} sx={style}>
        {COLORS.map((color) => (
          <Fab key={color} color={color}>
            <Iconify icon="ic:round-access-alarm" width={24} />
          </Fab>
        ))}

        {COLORS.map((color) => (
          <Fab key={color} color={color} variant="extended">
            <Iconify icon="ic:round-access-alarm" width={24} />
            {tr(color)}
          </Fab>
        ))}

        <Fab color="info" disabled>
          <Iconify icon="ic:round-access-alarm" width={24} />
        </Fab>

        <Fab color="info" disabled variant="extended">
          <Iconify icon="ic:round-access-alarm" width={24} />{tr("disabled")}</Fab>
      </Block>

      <Block title={tr("Outlined")} sx={style}>
        {COLORS.map((color) => (
          <Fab key={color} color={color} variant="outlined">
            <Iconify icon="ic:round-access-alarm" width={24} />
          </Fab>
        ))}

        {COLORS.map((color) => (
          <Fab key={color} color={color} variant="outlinedExtended">
            <Iconify icon="ic:round-access-alarm" width={24} />
            {tr(color)}
          </Fab>
        ))}

        <Fab color="info" disabled variant="outlined">
          <Iconify icon="ic:round-access-alarm" width={24} />
        </Fab>

        <Fab color="info" disabled variant="outlinedExtended">
          <Iconify icon="ic:round-access-alarm" width={24} />{tr("disabled")}</Fab>
      </Block>

      <Block title={tr("Soft")} sx={style}>
        {COLORS.map((color) => (
          <Fab key={color} color={color} variant="soft">
            <Iconify icon="ic:round-access-alarm" width={24} />
          </Fab>
        ))}

        {COLORS.map((color) => (
          <Fab key={color} color={color} variant="softExtended">
            <Iconify icon="ic:round-access-alarm" width={24} />
            {tr(color)}
          </Fab>
        ))}

        <Fab color="info" disabled variant="soft">
          <Iconify icon="ic:round-access-alarm" width={24} />
        </Fab>

        <Fab color="info" disabled variant="softExtended">
          <Iconify icon="ic:round-access-alarm" width={24} />{tr("disabled")}</Fab>
      </Block>

      <Block title={tr("Size")} sx={style}>
        {SIZES.map((size) => (
          <Fab key={size} size={size} color="info">
            <Iconify icon="ic:round-access-alarm" width={24} />
          </Fab>
        ))}

        {SIZES.map((size) => (
          <Fab key={size} size={size} color="info" variant="extended">
            <Iconify icon="ic:round-access-alarm" width={24} />
            {tr(size)}
          </Fab>
        ))}

        {SIZES.map((size) => (
          <Fab key={size} size={size} color="info" variant="soft">
            <Iconify icon="ic:round-access-alarm" width={24} />
          </Fab>
        ))}

        {SIZES.map((size) => (
          <Fab key={size} size={size} color="info" variant="softExtended">
            <Iconify icon="ic:round-access-alarm" width={24} />
            {tr(size)}
          </Fab>
        ))}

        {SIZES.map((size) => (
          <Fab key={size} size={size} color="info" variant="outlined">
            <Iconify icon="ic:round-access-alarm" width={24} />
          </Fab>
        ))}

        {SIZES.map((size) => (
          <Fab key={size} size={size} color="info" variant="outlinedExtended">
            <Iconify icon="ic:round-access-alarm" width={24} />
            {tr(size)}
          </Fab>
        ))}
      </Block>

      <Block title={tr("With Animate")} sx={style}>
        {SIZES.map((size) => (
          <FabButtonAnimate key={size} variant="extended" size={size} color="info">
            <Iconify icon="ic:round-access-alarm" width={24} />
            {tr(size)}
          </FabButtonAnimate>
        ))}
      </Block>
    </Masonry>
  );
}
