let handler = null;

// Loaded by App before BrowserRouter installs its history listener. Browser POP
// events must be stopped before the router can unmount the unsaved editor.
if (typeof window !== 'undefined') {
  window.addEventListener('popstate', (event) => handler?.(event), true);
}
export function registerRosterPopHandler(next) {
  handler = next;
  return () => {
    if (handler === next) handler = null;
  };
}
