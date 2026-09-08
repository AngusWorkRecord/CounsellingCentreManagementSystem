import { useState } from 'react';
// @mui
import { TextField, Stack } from '@mui/material';
import { Masonry } from '@mui/lab';
import {
  TimePicker,
  MobileTimePicker,
  StaticTimePicker,
  DesktopTimePicker,
} from '@mui/x-date-pickers';
import { tr, useUiLanguage } from '../../../../locales/translate';
//
import { Block } from '../../Block';

// ----------------------------------------------------------------------

export default function PickerTime() {
  useUiLanguage();
  const [value, setValue] = useState(new Date());

  return (
    <Masonry columns={{ xs: 1, md: 2 }} spacing={3}>
      <Block title={tr("Basic")}>
        <TimePicker
          label={tr("12 hours")}
          value={value}
          onChange={(newValue) => {
            setValue(newValue);
          }}
          renderInput={(params) => <TextField fullWidth {...params} margin="normal" />}
        />

        <TimePicker
          ampm={false}
          label={tr("24 hours")}
          value={value}
          onChange={(newValue) => {
            setValue(newValue);
          }}
          renderInput={(params) => <TextField fullWidth {...params} margin="normal" />}
        />
      </Block>

      <Block title={tr("Responsiveness")}>
        <MobileTimePicker
          orientation="portrait"
          label={tr("For mobile")}
          value={value}
          onChange={(newValue) => {
            setValue(newValue);
          }}
          renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
        />

        <DesktopTimePicker
          label={tr("For desktop")}
          value={value}
          onChange={(newValue) => {
            setValue(newValue);
          }}
          renderInput={(params) => <TextField {...params} margin="normal" fullWidth />}
        />

        <TimePicker
          value={value}
          onChange={setValue}
          renderInput={(params) => <TextField {...params} margin="normal" fullWidth />}
        />
      </Block>

      <Block title={tr("Static mode")}>
        <Stack spacing={3}>
          <StaticTimePicker
            orientation="portrait"
            displayStaticWrapperAs="mobile"
            value={value}
            onChange={(newValue) => {
              setValue(newValue);
            }}
            renderInput={(params) => <TextField {...params} />}
          />

          <StaticTimePicker
            ampm
            orientation="landscape"
            openTo="minutes"
            value={value}
            onChange={(newValue) => {
              setValue(newValue);
            }}
            renderInput={(params) => <TextField {...params} />}
          />
        </Stack>
      </Block>
    </Masonry>
  );
}
