import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { UNSAFE_NavigationContext } from 'react-router-dom';
import { registerRosterPopHandler } from './rosterNavigationEvents';

// BrowserRouter does not expose a data-router blocker. Intercept its navigation
// methods and browser POP before React Router observes the location change.
export default function useRosterNavigationGuard(dirty, busy, save) {
  const { navigator } = useContext(UNSAFE_NavigationContext);
  const [pending, setPending] = useState(null);
  const state = useRef({ dirty, busy, save });
  state.current = { dirty, busy, save };
  const request = useCallback((action) => {
    if (state.current.dirty || state.current.busy) setPending(() => action);
    else action();
  }, []);
  useEffect(() => {
    const original = { push: navigator.push, replace: navigator.replace, go: navigator.go };
    Object.keys(original).forEach((method) => {
      navigator[method] = (...args) => request(() => original[method].apply(navigator, args));
    });
    let index = window.history.state?.idx;
    let restoring = false;
    let allowPop = false;
    const pop = (event) => {
      const next = event.state?.idx;
      if (allowPop) {
        allowPop = false;
        index = next;
        return;
      }
      if (restoring) {
        restoring = false;
        event.stopImmediatePropagation();
        return;
      }
      const delta = Number.isInteger(next) && Number.isInteger(index) ? next - index : 0;
      if (delta && (state.current.dirty || state.current.busy)) {
        event.stopImmediatePropagation();
        restoring = true;
        window.history.go(-delta);
        setPending(() => () => {
          allowPop = true;
          original.go.call(navigator, delta);
        });
      } else index = next;
    };
    const unload = (event) => {
      if (state.current.dirty || state.current.busy) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    const unregisterPop = registerRosterPopHandler(pop);
    window.addEventListener('beforeunload', unload);
    return () => {
      Object.keys(original).forEach((method) => {
        navigator[method] = original[method];
      });
      unregisterPop();
      window.removeEventListener('beforeunload', unload);
    };
  }, [navigator, request]);
  const leave = () => {
    const action = pending;
    setPending(null);
    action?.();
  };
  return {
    open: !!pending,
    request,
    cancel: () => setPending(null),
    discard: leave,
    saveAndLeave: async () => {
      if (!state.current.busy && (await state.current.save())) leave();
    },
  };
}
