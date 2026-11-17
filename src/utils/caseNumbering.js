// Keep these input rules aligned with database/011_case_numbering.sql.
export const validNumberInitials = (value) => typeof value === 'string' && /^[A-Za-z]{1,10}$/.test(value.trim());
export const validNumberPhone = (value) => typeof value === 'string' && value.length <= 50
  && !/[^0-9+() -]/.test(value) && value.replace(/[^0-9]/g, '').length >= 4;

// The last segment is now a phone suffix, not a unique record identifier.
export function caseChartSuffix(session) {
  const value = String(session.case_number || session.id || '');
  return session.number_sequence != null ? value.split('/').slice(0, 2).join('/') : value.split('/').pop();
}
