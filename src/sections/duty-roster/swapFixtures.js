import { defaultPreference } from './autoRoster';

export function swapFixture() {
  const people = Array.from({ length: 6 }, (_, i) => ({
    id: String(i + 1),
    name: `Person ${i + 1}`,
    status: 'active',
    type: 'volunteer',
  }));
  const preferences = Object.fromEntries(
    people.map((p) => [p.id, { ...defaultPreference(), leader: ['1', '3', '6'].includes(p.id) }])
  );
  const shift = (id, date, method, personIds) => ({
    id,
    date,
    method,
    personIds,
    groupId: `group-${id}`,
    start: '09:00',
    end: '10:00',
    note: `Note ${id}`,
  });
  const shifts = [
    shift('a', '2027-01-04', 'phone', ['1', '2']),
    shift('b', '2027-01-06', 'f2f', ['3', '4']),
    shift('c', '2027-01-08', 'zoom', ['6', '5']),
  ];
  const period = { from: '2027-01-01', to: '2027-03-31' };
  const rules = {
    preferences,
    holidays: [],
    groups: shifts.map((s) => ({
      id: s.groupId,
      leaderId: s.personIds[0],
      memberIds: [s.personIds[1]],
      day: 'MON',
    })),
    stale: false,
    period,
    start: '09:00',
    end: '10:00',
  };
  return { people, shifts, rules, period };
}
export const swapSelection = {
  sourceShiftId: 'a',
  sourcePersonId: '2',
  targetShiftId: 'b',
  targetPersonId: '4',
};
