import PropTypes from 'prop-types';
import { useState } from 'react';
// @mui
import { MenuItem, TextField, IconButton, InputAdornment } from '@mui/material';
import { Masonry } from '@mui/lab';
import { tr, useUiLanguage } from '../../../locales/translate';
// components
import Iconify from '../../../components/iconify';
//
import { Block } from '../Block';

// ----------------------------------------------------------------------

const CURRENCIES = [
  { value: 'USD', label: '$' },
  { value: 'EUR', label: '€' },
  { value: 'BTC', label: '฿' },
  { value: 'JPY', label: '¥' },
];

const style = {
  '& > *': { my: '8px !important' },
};

// ----------------------------------------------------------------------

Textfields.propTypes = {
  variant: PropTypes.string,
};

export default function Textfields({ variant }) {
  useUiLanguage();
  const [currency, setCurrency] = useState('EUR');

  const [values, setValues] = useState({
    amount: '',
    password: '',
    weight: '',
    weightRange: '',
    showPassword: false,
  });

  const handleChangeCurrency = (event) => {
    setCurrency(event.target.value);
  };

  const handleChange = (prop) => (event) => {
    setValues({ ...values, [prop]: event.target.value });
  };

  const handleClickShowPassword = () => {
    setValues({ ...values, showPassword: !values.showPassword });
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <Masonry columns={{ xs: 1, md: 2 }} spacing={3}>
      <Block title={tr("General")} sx={style}>
        <TextField variant={variant} fullWidth label={tr("Inactive")} />

        <TextField
          variant={variant}
          required
          fullWidth
          label={tr("Activated")}
          defaultValue="Hello Minimal"
        />

        <TextField
          variant={variant}
          fullWidth
          type="password"
          label={tr("Password")}
          autoComplete="current-password"
        />

        <TextField
          variant={variant}
          disabled
          fullWidth
          label={tr("Disabled")}
          defaultValue="Hello Minimal"
        />
      </Block>

      <Block title={tr("With Icon & Adornments")} sx={style}>
        <TextField
          variant={variant}
          fullWidth
          label={tr("Filled")}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:person-fill" width={24} />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          variant={variant}
          disabled
          fullWidth
          label={tr("Disabled")}
          defaultValue="Hello Minimal"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:person-fill" width={24} />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          variant={variant}
          fullWidth
          label={tr("With normal TextField")}
          InputProps={{
            startAdornment: <InputAdornment position="start">Kg</InputAdornment>,
          }}
        />

        <TextField
          variant={variant}
          fullWidth
          value={values.weight}
          onChange={handleChange('weight')}
          helperText={tr("Weight")}
          InputProps={{
            endAdornment: <InputAdornment position="end">Kg</InputAdornment>,
          }}
        />

        <TextField
          variant={variant}
          fullWidth
          type={values.showPassword ? 'text' : 'password'}
          value={values.password}
          onChange={handleChange('password')}
          label={tr("Password")}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:person-fill" width={24} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {values.showPassword ? (
                    <Iconify icon="eva:eye-fill" width={24} />
                  ) : (
                    <Iconify icon="eva:eye-off-fill" width={24} />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Block>

      <Block title={tr("With Caption")} sx={style}>
        <TextField
          variant={variant}
          fullWidth
          label={tr("Error")}
          defaultValue="Hello Minimal"
          helperText={tr("Incorrect entry.")}
        />

        <TextField
          variant={variant}
          error
          fullWidth
          label={tr("Error")}
          defaultValue="Hello Minimal"
          helperText={tr("Incorrect entry.")}
        />
      </Block>

      <Block title={tr("Type")} sx={style}>
        <TextField
          variant={variant}
          fullWidth
          type="password"
          label={tr("Password")}
          autoComplete="current-password"
        />

        <TextField
          variant={variant}
          fullWidth
          type="number"
          label={tr("Number")}
          defaultValue={0}
          InputLabelProps={{ shrink: true }}
        />

        <TextField variant={variant} fullWidth label={tr("Search")} type="search" />
      </Block>

      <Block title={tr("Size")} sx={style}>
        <TextField variant={variant} fullWidth label={tr("Size")} size="small" defaultValue="Small" />

        <TextField variant={variant} fullWidth label={tr("Size")} defaultValue="Normal" />
      </Block>

      <Block title={tr("Select")} sx={style}>
        <TextField
          variant={variant}
          select
          fullWidth
          label={tr("Select")}
          value={currency}
          onChange={handleChangeCurrency}
          helperText={tr("Please select your currency")}
        >
          {CURRENCIES.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          variant={variant}
          select
          fullWidth
          size="small"
          value={currency}
          label={tr("Native select")}
          SelectProps={{ native: true }}
          onChange={handleChangeCurrency}
          helperText={tr("Please select your currency")}
        >
          {CURRENCIES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </TextField>
      </Block>

      <Block title={tr("Multiline")} sx={style}>
        <TextField
          variant={variant}
          fullWidth
          label={tr("Multiline")}
          multiline
          maxRows={4}
          value="Controlled"
        />

        <TextField
          variant={variant}
          fullWidth
          multiline
          placeholder={tr("Placeholder")}
          label={tr("Multiline Placeholder")}
        />

        <TextField
          variant={variant}
          rows={4}
          fullWidth
          multiline
          label={tr("Multiline")}
          defaultValue="Default Value"
        />
      </Block>
    </Masonry>
  );
}
