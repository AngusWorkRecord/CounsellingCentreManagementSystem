import PropTypes from 'prop-types';
import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AUTH_EXPIRED_EVENT, authRequest } from './authClient';

// Keep the provider export used by App; credentials and session tokens are
// now held by the server and its HttpOnly cookie, never browser storage.
export const AuthContext = createContext(null);
AuthProvider.propTypes = { children: PropTypes.node };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isInitialized, setInitialized] = useState(false);
  const revision = useRef(0);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    try { localStorage.removeItem('accessToken'); localStorage.removeItem('user'); } catch (_) { /* Storage is optional. */ }
    const restore = async () => {
      const { current } = revision;
      try {
        const restored = await authRequest('/api/auth/me', { signal: controller.signal });
        if (active && current === revision.current) setUser(restored);
      } catch (error) {
        if (active && current === revision.current && error.status === 401) setUser(null);
      } finally {
        if (active) setInitialized(true);
      }
    };
    const expire = () => { revision.current += 1; setUser(null); };
    const refresh = () => { if (document.visibilityState !== 'hidden') restore(); };
    restore();
    window.addEventListener(AUTH_EXPIRED_EVENT, expire);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      active = false;
      controller.abort();
      window.removeEventListener(AUTH_EXPIRED_EVENT, expire);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);
  const login = useCallback(async (username, password, rememberMe = false) => {
    revision.current += 1;
    const { current } = revision;
    const authenticated = await authRequest('/api/auth/login', { method: 'POST', body: { username, password, rememberMe } });
    if (current === revision.current) { setUser(authenticated); setInitialized(true); }
    return true;
  }, []);
  const logout = useCallback(async () => {
    revision.current += 1;
    const { current } = revision;
    await authRequest('/api/auth/logout', { method: 'POST', body: {} });
    if (current === revision.current) setUser(null);
  }, []);
  const value = useMemo(() => ({ user, isInitialized, isAuthenticated: Boolean(user), method: 'session', login, logout }), [user, isInitialized, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
