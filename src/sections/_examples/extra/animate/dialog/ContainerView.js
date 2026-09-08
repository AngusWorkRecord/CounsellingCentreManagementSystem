import PropTypes from 'prop-types';
// @mui
import {
  Paper,
  Button,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';
import { tr, useUiLanguage } from '../../../../../locales/translate';
// components
import { DialogAnimate } from '../../../../../components/animate';
//
import getVariant from '../getVariant';

// ----------------------------------------------------------------------

ContainerView.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onOpen: PropTypes.func,
  selectVariant: PropTypes.string,
};

export default function ContainerView({ isOpen, onOpen, onClose, selectVariant, ...other }) {
  useUiLanguage();
  return (
    <Paper
      sx={{
        height: 480,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.neutral',
      }}
      {...other}
    >
      <Button variant="contained" onClick={onOpen}>{tr("Click Me!")}</Button>
      <DialogAnimate open={isOpen} onClose={onClose} variants={getVariant(selectVariant)}>
        <DialogTitle id="alert-dialog-title">{tr("Use Google's location service?")}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">{tr("Let Google help apps determine location. This means sending anonymous location data to Google, even when no apps are running.")}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{tr("Disagree")}</Button>
          <Button variant="contained" onClick={onClose} autoFocus>{tr("Agree")}</Button>
        </DialogActions>
      </DialogAnimate>
    </Paper>
  );
}
