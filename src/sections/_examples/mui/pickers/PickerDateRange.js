import { Box, Button, Stack, Link } from '@mui/material';
import { tr, useUiLanguage } from '../../../../locales/translate';
// @mui
import DateRangePicker, { useDateRangePicker } from '../../../../components/date-range-picker';
// utils
import { fDate } from '../../../../utils/formatTime';
//
import { Block } from '../../Block';

// ----------------------------------------------------------------------

export default function PickerDateRange() {
  useUiLanguage();
  const pickerInput = useDateRangePicker(new Date(), new Date());

  const pickerCalendar = useDateRangePicker(new Date(), null);

  return (
    <>
      <Stack sx={{ typography: 'body2', mb: 3, color: 'text.secondary' }}>
        <div>{tr("This is the custom component from minimal.")}</div>
        <div>{tr("You can use more advanced components by MUI.")}</div>

        <Link href="https://mui.com/x/react-date-pickers/date-range-picker/">
          https://mui.com/x/react-date-pickers/date-range-picker/{' '}
        </Link>
      </Stack>

      <Box
        gap={3}
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          md: 'repeat(2, 1fr)',
        }}
      >
        <Block title={tr("Input")}>
          <Button variant="contained" onClick={pickerInput.onOpen}>{tr("Click me!")}</Button>

          <Stack sx={{ typography: 'body2', mt: 3 }}>
            <div>
              <strong>{tr("Start:")}</strong> {fDate(pickerInput.startDate)}
            </div>
            <div>
              <strong>{tr("End:")}</strong> {fDate(pickerInput.endDate)}
            </div>
          </Stack>

          <DateRangePicker
            open={pickerInput.open}
            startDate={pickerInput.startDate}
            endDate={pickerInput.endDate}
            onChangeStartDate={pickerInput.onChangeStartDate}
            onChangeEndDate={pickerInput.onChangeEndDate}
            onClose={pickerInput.onClose}
            isError={pickerInput.isError}
          />
        </Block>

        <Block title={tr("Calendar")}>
          <Button variant="contained" onClick={pickerCalendar.onOpen}>{tr("Click me!")}</Button>

          <Stack sx={{ typography: 'body2', mt: 3 }}>
            <div>
              <strong>{tr("Start:")}</strong> {fDate(pickerCalendar.startDate)}
            </div>
            <div>
              <strong>{tr("End:")}</strong> {fDate(pickerCalendar.endDate)}
            </div>
          </Stack>

          <DateRangePicker
            variant="calendar"
            open={pickerCalendar.open}
            startDate={pickerCalendar.startDate}
            endDate={pickerCalendar.endDate}
            onChangeStartDate={pickerCalendar.onChangeStartDate}
            onChangeEndDate={pickerCalendar.onChangeEndDate}
            onClose={pickerCalendar.onClose}
            isError={pickerCalendar.isError}
          />
        </Block>
      </Box>
    </>
  );
}
