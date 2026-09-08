import PropTypes from 'prop-types';
import { useCallback } from 'react';
import { useSnackbar as useNotistack } from 'notistack';
import { useUiLanguage } from '../../locales/translate';
import { uiMessage } from '../../locales/uiMessage';

function LocalizedMessage({ message }) {
  useUiLanguage();
  return uiMessage(message);
}
LocalizedMessage.propTypes = { message: PropTypes.node };

export default function useSnackbar() {
  const context = useNotistack();
  const enqueue = context.enqueueSnackbar;
  const enqueueSnackbar = useCallback((message, options) => enqueue(
    typeof message === 'string' ? <LocalizedMessage message={message} /> : message,
    typeof message === 'string' ? { key: message, ...options } : options
  ), [enqueue]);
  return { ...context, enqueueSnackbar };
}
