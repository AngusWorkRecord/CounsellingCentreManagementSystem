import { useState } from 'react';
import isWeekend from 'date-fns/isWeekend';
// @mui
import { TextField } from '@mui/material';
import { Masonry } from '@mui/lab';
import {
  DatePicker,
  StaticDatePicker,
  MobileDatePicker,
  DesktopDatePicker,
} from '@mui/x-date-pickers';
import { tr, useUiLanguage } from '../../../../locales/translate';
//
import { Block } from '../../Block';

// ----------------------------------------------------------------------

export default function PickerDate() {
  useUiLanguage();
  const [value, setValue] = useState(new Date());

  return (
    <Masonry columns={{ xs: 1, md: 2 }} spacing={3}>
      <Block title={tr("Basic")}>
        <DesktopDatePicker
          label={tr("For desktop")}
          value={value}
          minDate={new Date('2017-01-01')}
          onChange={(newValue) => {
            setValue(newValue);
          }}
          renderInput={(params) => <TextField fullWidth {...params} margin="normal" />}
        />

        <MobileDatePicker
          orientation="portrait"
          label={tr("For mobile")}
          value={value}
          onChange={(newValue) => {
            setValue(newValue);
          }}
          renderInput={(params) => <TextField fullWidth {...params} margin="normal" />}
        />
      </Block>

      <Block title={tr("Static mode")}>
        <StaticDatePicker
          orientation="landscape"
          openTo="day"
          value={value}
          shouldDisableDate={isWeekend}
          onChange={(newValue) => {
            setValue(newValue);
          }}
          renderInput={(params) => <TextField {...params} />}
        />
      </Block>

      <Block title={tr("Views playground")}>
        <DatePicker
          views={['year']}
          label={tr("Year only")}
          value={value}
          onChange={(newValue) => {
            setValue(newValue);
          }}
          renderInput={(params) => (
            <TextField {...params} fullWidth margin="normal" helperText={null} />
          )}
        />
        <DatePicker
          views={['year', 'month']}
          label={tr("Year and Month")}
          minDate={new Date('2012-03-01')}
          maxDate={new Date('2023-06-01')}
          value={value}
          onChange={(newValue) => {
            setValue(newValue);
          }}
          renderInput={(params) => (
            <TextField {...params} fullWidth margin="normal" helperText={null} />
          )}
        />
        <DatePicker
          openTo="year"
          views={['year', 'month', 'day']}
          label={tr("Year, month and date")}
          value={value}
          onChange={(newValue) => {
            setValue(newValue);
          }}
          renderInput={(params) => (
            <TextField {...params} fullWidth margin="normal" helperText={null} />
          )}
        />
        <DatePicker
          views={['day', 'month', 'year']}
          label={tr("Invert the order of views")}
          value={value}
          onChange={(newValue) => {
            setValue(newValue);
          }}
          renderInput={(params) => (
            <TextField {...params} fullWidth margin="normal" helperText={null} />
          )}
        />
        <DatePicker
          views={['day']}
          label={tr("Just date")}
          value={value}
          onChange={(newValue) => {
            setValue(newValue);
          }}
          renderInput={(params) => (
            <TextField {...params} fullWidth margin="normal" helperText={null} />
          )}
        />
      </Block>
    </Masonry>
  );
}
