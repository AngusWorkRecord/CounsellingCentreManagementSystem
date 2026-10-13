/* eslint-env jest */
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Simulate } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';
import i18n from '../../locales/i18n';
import AuthLoginForm from './AuthLoginForm';

const mockLogin = jest.fn();
jest.mock('../../auth/useAuthContext', () => ({ useAuthContext: () => ({ login: mockLogin }) }));
jest.mock('../../components/iconify', () => () => null);
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('login form', () => {
  let container;
  let root;
  const submit = async () => act(async () => { Simulate.submit(container.querySelector('form')); });
  const fill = async () => act(async () => {
    const username = container.querySelector('#login-username');
    const password = container.querySelector('#login-password');
    username.value = 'counsellor';
    password.value = 'test-password';
    Simulate.change(username);
    Simulate.change(password);
  });
  beforeEach(async () => {
    mockLogin.mockReset();
    await i18n.changeLanguage('en');
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    await act(async () => root.render(<MemoryRouter><AuthLoginForm /></MemoryRouter>));
  });
  afterEach(() => { act(() => root.unmount()); container.remove(); });
  test('starts empty, validates required fields and translates existing errors', async () => {
    expect(container.querySelector('#login-username').value).toBe('');
    expect(container.querySelector('#login-password').value).toBe('');
    await submit();
    expect(mockLogin).not.toHaveBeenCalled();
    expect(container.textContent).toContain('Username is required');
    expect(container.textContent).toContain('Password is required');
    await act(async () => i18n.changeLanguage('cn'));
    expect(container.textContent).toContain('请输入用户名');
  });
  test('preserves values and password visibility across both language switches', async () => {
    await fill();
    await act(async () => container.querySelector('button[aria-label="Show password"]').click());
    await act(async () => i18n.changeLanguage('cn'));
    expect(container.querySelector('#login-username').value).toBe('counsellor');
    expect(container.querySelector('#login-password').type).toBe('text');
    await act(async () => i18n.changeLanguage('en'));
    expect(container.querySelector('#login-password').value).toBe('test-password');
    expect(container.querySelector('input[type="checkbox"]').disabled).toBe(false);
    expect(container.querySelector('a')).toBeNull();
    expect(container.textContent).toContain('Contact an administrator');
  });
  test('allows retry after invalid credentials and network failure without clearing input', async () => {
    mockLogin.mockResolvedValueOnce(false).mockRejectedValueOnce(new Error('network')).mockResolvedValueOnce(true);
    await fill();
    await submit();
    expect(container.textContent).toContain('Invalid username or password.');
    expect(container.querySelector('button[type="submit"]').disabled).toBe(false);
    await act(async () => i18n.changeLanguage('cn'));
    expect(container.textContent).not.toContain('Invalid username or password.');
    await act(async () => i18n.changeLanguage('en'));
    await submit();
    expect(container.textContent).toContain('Unable to login. Please try again.');
    expect(container.querySelector('#login-password').value).toBe('test-password');
    await submit();
    expect(mockLogin).toHaveBeenLastCalledWith('counsellor', 'test-password', false);
    expect(mockLogin).toHaveBeenCalledTimes(3);
    expect(container.querySelector('[role="alert"]')).toBeNull();
  });
  test('blocks duplicate submissions while a request is pending', async () => {
    let finish;
    mockLogin.mockImplementation(() => new Promise((resolve) => { finish = resolve; }));
    await fill();
    await submit();
    expect(container.querySelector('button[type="submit"]').disabled).toBe(true);
    await submit();
    expect(mockLogin).toHaveBeenCalledTimes(1);
    await act(async () => finish(false));
    expect(container.querySelector('button[type="submit"]').disabled).toBe(false);
  });
});
