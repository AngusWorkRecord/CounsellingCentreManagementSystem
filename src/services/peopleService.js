import { authenticatedFetch } from '../auth/authClient';

export const PERSON_ERROR_MESSAGES = {
  UNAUTHENTICATED: 'Your session has expired. Please sign in again.',
  FORBIDDEN: 'You cannot perform this personnel operation.',
  AUTH_NOT_CONFIGURED: 'Personnel service is not configured. Please contact an administrator.',
  INVALID_REQUEST: 'Please check the personnel fields.',
  PERSON_VALIDATION_FAILED: 'Please check the personnel fields.',
  PERSON_NOT_FOUND: 'This person no longer exists. Close this dialog and reload the directory.',
  PERSON_VERSION_CONFLICT:
    'This person was changed by someone else. Close this dialog and reload the directory before editing again.',
};
export const personErrorMessage = (error) =>
  PERSON_ERROR_MESSAGES[error?.code] || 'Unable to load or save personnel. Please try again.';
export const PERSON_FIELD_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_VERSION: 'Please reload the directory before editing again.',
  CONTACT_REQUIRED: 'Provide a phone number or email address',
  INVALID_EMAIL: 'Enter a valid email address',
  INVALID_TYPE: 'Please select a valid person type.',
  INVALID_STATUS: 'Please select a valid personnel status.',
  INVALID_LANGUAGES: 'Please select valid languages.',
  INVALID_TEXT: 'Please enter valid text.',
  TEXT_TOO_LONG: 'This personnel field is too long.',
};

const validPerson = (person) =>
  person &&
  typeof person === 'object' &&
  typeof person.id === 'string' &&
  /^[1-9]\d*$/.test(person.id) &&
  Number.isInteger(person.version) &&
  person.version > 0 &&
  ['name', 'phone', 'email', 'specialisation'].every((key) => typeof person[key] === 'string') &&
  !!person.name.trim() &&
  ['counsellor', 'volunteer'].includes(person.type) &&
  ['active', 'inactive'].includes(person.status) &&
  Array.isArray(person.languages) &&
  person.languages.every((value) => ['cn', 'en', 'ms', 'ta'].includes(value));

async function request(id, { method = 'GET', body, signal } = {}) {
  const response = await authenticatedFetch(
    `/api/counselling-people${id ? `?id=${encodeURIComponent(id)}` : ''}`,
    {
      method,
      signal,
      cache: 'no-store',
      ...(body
        ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
        : {}),
    }
  );
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.success)
    throw Object.assign(new Error('PERSON_REQUEST_FAILED'), {
      code: result?.error?.code,
      fields: result?.error?.fields,
      status: response.status,
    });
  const list = method === 'GET' && !id;
  if (
    list
      ? !Array.isArray(result.data) || !result.data.every(validPerson)
      : !validPerson(result.data)
  )
    throw new Error('INVALID_PERSON_RESPONSE');
  return result.data;
}
const details = (person) =>
  Object.fromEntries(
    ['name', 'type', 'phone', 'email', 'languages', 'specialisation'].map((key) => [
      key,
      person[key],
    ])
  );
export const peopleService = {
  list: (options) => request(null, options),
  get: (id, options) => request(id, options),
  create: (person) => request(null, { method: 'POST', body: details(person) }),
  update: (id, person) =>
    request(id, { method: 'PUT', body: { ...details(person), version: person.version } }),
  setStatus: (id, status, version) => request(id, { method: 'PATCH', body: { status, version } }),
  remove: (id, version) => request(id, { method: 'DELETE', body: { version } }),
};
