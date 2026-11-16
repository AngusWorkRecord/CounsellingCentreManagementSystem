export const NUMBERING_ERRORS = new Set([
  'CASE_NUMBER_PHONE_INVALID', 'CASE_NUMBER_INITIALS_INVALID',
  'CASE_NUMBER_MODE_INVALID', 'CASE_NUMBER_IMMUTABLE',
]);
export function validateNumberInputs(initials, phone) {
  if (typeof initials !== 'string' || !/^[A-Za-z]{1,10}$/.test(initials.trim())) return 'CASE_NUMBER_INITIALS_INVALID';
  if (typeof phone !== 'string' || phone.length > 50 || /[^0-9+() -]/.test(phone) || phone.replace(/[^0-9]/g, '').length < 4) return 'CASE_NUMBER_PHONE_INVALID';
  return null;
}
