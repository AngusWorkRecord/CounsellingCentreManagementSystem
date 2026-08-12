export function valueOrDash(value) {
  return value === null || value === undefined || value === '' ? '-' : value;
}

export function formatDate(value) {
  return String(value || '').slice(0, 10) || '-';
}

export function formatTime(value) {
  return String(value || '').slice(0, 5) || '-';
}
