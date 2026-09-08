import PropTypes from 'prop-types';
import { memo } from 'react';
// @mui
import { Radio, Typography, RadioGroup, FormControlLabel } from '@mui/material';
import { tr, useUiLanguage } from '../../../../../locales/translate';
// components
import { StyledControlPanel } from '../../../../../components/map';

// ----------------------------------------------------------------------

ControlPanel.propTypes = {
  themes: PropTypes.object,
  selectTheme: PropTypes.string,
  onChangeTheme: PropTypes.func,
};

function ControlPanel({ themes, selectTheme, onChangeTheme }) {
  useUiLanguage();
  return (
    <StyledControlPanel>
      <Typography gutterBottom variant="subtitle2" sx={{ color: 'common.white' }}>{tr("Select Theme:")}</Typography>

      <RadioGroup value={selectTheme} onChange={(event, value) => onChangeTheme(value)}>
        {Object.keys(themes).map((item) => (
          <FormControlLabel
            key={item}
            value={item}
            control={<Radio size="small" />}
            label={item}
            sx={{ color: 'common.white', textTransform: 'capitalize' }}
          />
        ))}
      </RadioGroup>
    </StyledControlPanel>
  );
}

export default memo(ControlPanel);
