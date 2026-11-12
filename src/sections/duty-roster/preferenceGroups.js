// Array order (weekdays, methods, months and leave ranges) does not change
// availability. Include every field so different qualifications/presets never merge.
const canonical = (value) => {
  if (Array.isArray(value))
    return value.map(canonical).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonical(value[key])])
    );
  return value;
};
export const preferenceSignature = (preference) => JSON.stringify(canonical(preference));

export function groupPreferences(people, preferences) {
  const grouped = new Map();
  people.forEach((person) => {
    const value = preferences[person.id];
    const signature = preferenceSignature(value);
    if (!grouped.has(signature)) grouped.set(signature, { id: person.id, people: [], value });
    grouped.get(signature).people.push(person);
  });
  return [...grouped.values()];
}

export function patchPreferences(preferences, ids, patch) {
  const next = { ...preferences };
  ids.forEach((id) => {
    next[id] = JSON.parse(JSON.stringify({ ...preferences[id], ...patch }));
  });
  return next;
}
