// Stable domain values; translations are applied only when rendering.
export const PERSON_TYPES = ['counsellor', 'volunteer'];
export const PERSON_STATUSES = ['active', 'inactive'];
export const PERSON_LANGUAGES = ['cn', 'en', 'ms', 'ta'];
export const EMPTY_FILTERS = { search: '', type: '', language: '', status: '' };
export const emptyPerson = () => ({
  name: '',
  type: '',
  phone: '',
  email: '',
  languages: [],
  specialisation: '',
  status: 'active',
});

export function validatePerson(person) {
  const errors = {};
  [
    ['name', 100],
    ['phone', 50],
    ['email', 254],
    ['specialisation', 2000],
  ].forEach(([key, max]) => {
    if (person[key].trim().length > max) errors[key] = 'This personnel field is too long.';
    if (person[key].includes('\0')) errors[key] = 'Please enter valid text.';
  });
  if (!person.name.trim()) errors.name = 'This field is required';
  if (!PERSON_TYPES.includes(person.type)) errors.type = 'This field is required';
  if (!person.phone.trim() && !person.email.trim()) {
    errors.phone = 'Provide a phone number or email address';
    errors.email = 'Provide a phone number or email address';
  } else if (person.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(person.email.trim())) {
    errors.email = 'Enter a valid email address';
  }
  return errors;
}

export function filterPeople(people, filters, direction, locale) {
  const query = filters.search.trim().toLocaleLowerCase();
  return people
    .filter(
      (person) =>
        (!query ||
          [person.name, person.phone, person.email].some((value) =>
            value.toLocaleLowerCase().includes(query)
          )) &&
        (!filters.type || person.type === filters.type) &&
        (!filters.status || person.status === filters.status) &&
        (!filters.language || person.languages.includes(filters.language))
    )
    .sort((a, b) => (direction === 'asc' ? 1 : -1) * a.name.localeCompare(b.name, locale));
}

// Quote every cell and neutralise spreadsheet formulas, including leading whitespace.
export function csvCell(value) {
  const text = String(value ?? '');
  const safe = /^[\s\uFEFF]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}
export function peopleCsv(people, headers, label) {
  return `\uFEFF${[
    headers,
    ...people.map((person) => [
      person.name,
      label(person.type),
      person.phone,
      person.email,
      person.languages.map(label).join(', '),
      person.specialisation,
      label(person.status),
    ]),
  ]
    .map((row) => row.map(csvCell).join(','))
    .join('\r\n')}`;
}
