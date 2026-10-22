/* eslint-env jest */
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './JwtContext';
import { useAuthContext } from './useAuthContext';
import { AUTH_EXPIRED_EVENT, authenticatedFetch } from './authClient';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let context;
function Probe() { context = useAuthContext(); return <span>{context.user?.fullName || 'anonymous'}</span>; }
const user = { id: '1', username: 'helper', fullName: 'Actual Volunteer', email: null, role: 'volunteer' };
const result = (data, status = 200, code) => ({ ok: status === 200, status,
  json: async () => status === 200 ? { success: true, data } : { success: false, error: { code } },
});

describe('server session authentication', () => {
  let container; let root; let originalFetch;
  beforeEach(() => {
    originalFetch = global.fetch; global.fetch = jest.fn();
    container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container);
  });
  afterEach(() => { act(() => root.unmount()); container.remove(); global.fetch = originalFetch; localStorage.clear(); });
  const mount = async () => act(async () => root.render(<AuthProvider><Probe /></AuthProvider>));

  test('restores actual identity from me and removes legacy storage without saving a token', async () => {
    localStorage.setItem('accessToken', 'old-token'); localStorage.setItem('user', 'old-user');
    global.fetch.mockResolvedValue(result(user));
    await mount();
    expect(context.isInitialized).toBe(true); expect(context.isAuthenticated).toBe(true);
    expect(context.user.role).toBe('volunteer'); expect(container.textContent).toBe('Actual Volunteer');
    expect(global.fetch).toHaveBeenCalledWith('/api/auth/me', expect.objectContaining({ credentials: 'same-origin', cache: 'no-store' }));
    expect(localStorage.getItem('accessToken')).toBeNull(); expect(localStorage.getItem('user')).toBeNull();
  });

  test('login sends username and rememberMe in a POST body; logout waits for server revocation', async () => {
    global.fetch.mockResolvedValueOnce(result(null, 401, 'UNAUTHENTICATED')).mockResolvedValueOnce(result(user)).mockResolvedValueOnce(result());
    await mount(); expect(context.isAuthenticated).toBe(false);
    await act(async () => context.login('helper', 'valid-password', true));
    expect(context.user.fullName).toBe('Actual Volunteer');
    expect(global.fetch.mock.calls[1][0]).toBe('/api/auth/login');
    expect(JSON.parse(global.fetch.mock.calls[1][1].body)).toEqual({ username: 'helper', password: 'valid-password', rememberMe: true });
    await act(async () => context.logout()); expect(context.isAuthenticated).toBe(false);
    expect(global.fetch.mock.calls[2][0]).toBe('/api/auth/logout');
  });

  test('a late me response cannot restore identity after logout', async () => {
    let finishRestore;
    global.fetch.mockImplementationOnce(() => new Promise((resolve) => { finishRestore = resolve; })).mockResolvedValueOnce(result());
    await mount();
    await act(async () => context.logout());
    await act(async () => finishRestore(result(user)));
    expect(context.isAuthenticated).toBe(false); expect(container.textContent).toBe('anonymous');
  });

  test('failed logout retains identity and a protected API 401 expires the UI session', async () => {
    global.fetch.mockResolvedValueOnce(result(user)).mockRejectedValueOnce(new Error('network'));
    await mount();
    await act(async () => { await expect(context.logout()).rejects.toThrow('network'); });
    expect(context.isAuthenticated).toBe(true);
    global.fetch.mockResolvedValueOnce(result(null, 401, 'UNAUTHENTICATED'));
    await act(async () => authenticatedFetch('/api/counselling-sessions'));
    expect(context.isAuthenticated).toBe(false);
    expect(AUTH_EXPIRED_EVENT).toBe('counselling:auth-expired');
  });
});
