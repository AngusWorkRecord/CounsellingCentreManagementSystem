export const AUTH_EXPIRED_EVENT = 'counselling:auth-expired';

export async function authenticatedFetch(path, options = {}) {
  const response = await fetch(path, { ...options, credentials: 'same-origin' });
  if (response.status === 401) window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
  return response;
}

export async function authRequest(path, { method = 'GET', body, signal } = {}) {
  const response = await fetch(path, {
    method, credentials: 'same-origin', cache: 'no-store', signal,
    ...(body !== undefined ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.success) {
    const error = new Error(result?.error?.code || 'AUTH_REQUEST_FAILED');
    error.code = result?.error?.code || 'AUTH_REQUEST_FAILED';
    error.status = response.status;
    throw error;
  }
  return result.data;
}
