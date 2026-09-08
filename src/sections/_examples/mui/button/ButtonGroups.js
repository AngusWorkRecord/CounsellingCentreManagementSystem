// @mui
import { ButtonGroup, Button } from '@mui/material';
import { Masonry } from '@mui/lab';
import { tr, useUiLanguage } from '../../../../locales/translate';
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

const COLORS = ['inherit', 'primary', 'secondary', 'success', 'error', 'info', 'warning'];

const SIZES = ['small', 'medium', 'large'];

const VARIANTS = ['contained', 'outlined', 'text', 'soft'];

// ----------------------------------------------------------------------

export default function ButtonGroups() {
  useUiLanguage();
  return (
    <Masonry columns={2} spacing={3}>
      <Block title={tr("Contained")} sx={style}>
        {COLORS.map((color) => (
          <ButtonGroup key={color} variant="contained" color={color}>
            <Button>{tr("One")}</Button>
            <Button>{tr("Two")}</Button>
            <Button>{tr("Three")}</Button>
          </ButtonGroup>
        ))}

        <ButtonGroup disabled variant="contained" color="info">
          <Button>{tr("One")}</Button>
          <Button>{tr("Two")}</Button>
          <Button>{tr("Three")}</Button>
        </ButtonGroup>
      </Block>

      <Block title={tr("Outlined")} sx={style}>
        {COLORS.map((color) => (
          <ButtonGroup key={color} variant="outlined" color={color}>
            <Button>{tr("One")}</Button>
            <Button>{tr("Two")}</Button>
            <Button>{tr("Three")}</Button>
          </ButtonGroup>
        ))}

        <ButtonGroup disabled variant="outlined" color="info">
          <Button>{tr("One")}</Button>
          <Button>{tr("Two")}</Button>
          <Button>{tr("Three")}</Button>
        </ButtonGroup>
      </Block>

      <Block title={tr("Text")} sx={style}>
        {COLORS.map((color) => (
          <ButtonGroup key={color} variant="text" color={color}>
            <Button>{tr("One")}</Button>
            <Button>{tr("Two")}</Button>
            <Button>{tr("Three")}</Button>
          </ButtonGroup>
        ))}

        <ButtonGroup disabled variant="text" color="info">
          <Button>{tr("One")}</Button>
          <Button>{tr("Two")}</Button>
          <Button>{tr("Three")}</Button>
        </ButtonGroup>
      </Block>

      <Block title={tr("Soft")} sx={style}>
        {COLORS.map((color) => (
          <ButtonGroup key={color} variant="soft" color={color}>
            <Button>{tr("One")}</Button>
            <Button>{tr("Two")}</Button>
            <Button>{tr("Three")}</Button>
          </ButtonGroup>
        ))}

        <ButtonGroup disabled variant="soft" color="info">
          <Button>{tr("One")}</Button>
          <Button>{tr("Two")}</Button>
          <Button>{tr("Three")}</Button>
        </ButtonGroup>
      </Block>

      <Block title={tr("Size")} sx={style}>
        {SIZES.map((size) => (
          <ButtonGroup key={size} size={size} variant="contained">
            <Button>{tr("One")}</Button>
            <Button>{tr("Two")}</Button>
            <Button>{tr("Three")}</Button>
          </ButtonGroup>
        ))}
      </Block>

      <Block title={tr("Orientation")} sx={style}>
        {VARIANTS.map((variant) => (
          <ButtonGroup key={variant} variant={variant} orientation="vertical">
            <Button>{tr("One")}</Button>
            <Button>{tr("Two")}</Button>
            <Button>{tr("Three")}</Button>
          </ButtonGroup>
        ))}

        <ButtonGroup disabled variant="soft" color="info" orientation="vertical">
          <Button>{tr("One")}</Button>
          <Button>{tr("Two")}</Button>
          <Button>{tr("Three")}</Button>
        </ButtonGroup>
      </Block>
    </Masonry>
  );
}
