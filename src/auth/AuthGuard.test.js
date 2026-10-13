/* eslint-env jest */
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import AuthGuard from './AuthGuard';
import GuestGuard from './GuestGuard';
import i18n from '../locales/i18n';
import { domainLabel } from '../locales/domainLabels';

let mockState;
jest.mock('./useAuthContext', () => ({ useAuthContext: () => mockState }));
jest.mock('../pages/auth/LoginPage', () => () => <span>login-page</span>);
jest.mock('../components/loading-screen', () => () => <span>initializing</span>);
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('authentication route guards', () => {
  let container; let root;
  beforeEach(() => {
    mockState = { isAuthenticated: false, isInitialized: false };
    container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container);
  });
  afterEach(() => { act(() => root.unmount()); container.remove(); });
  const render = async () => act(async () => root.render(<MemoryRouter initialEntries={['/dashboard/counselling/cases/7']}><AuthGuard><span>protected-content</span></AuthGuard></MemoryRouter>));
  test('initialization and anonymous deep links never render protected content; login restores it', async () => {
    await render(); expect(container.textContent).toBe('initializing');
    mockState = { isAuthenticated: false, isInitialized: true };
    await render(); expect(container.textContent).toContain('login-page'); expect(container.textContent).not.toContain('protected-content');
    mockState = { isAuthenticated: true, isInitialized: true };
    await render(); expect(container.textContent).toContain('protected-content');
  });
  test('the homepage guest guard shows login to an anonymous user', async () => {
    mockState = { isAuthenticated: false, isInitialized: true };
    await act(async () => root.render(<MemoryRouter><GuestGuard><span>login-page</span></GuestGuard></MemoryRouter>));
    expect(container.textContent).toContain('login-page');
  });
  test('role labels switch language while role values remain stable', async () => {
    const roles = ['admin', 'volunteer'];
    await i18n.changeLanguage('cn');
    expect(roles.map(domainLabel)).toEqual(['管理员', '义工']);
    await i18n.changeLanguage('en');
    expect(roles.map(domainLabel)).toEqual(['Admin', 'Volunteer']);
    expect(roles).toEqual(['admin', 'volunteer']);
  });
});
