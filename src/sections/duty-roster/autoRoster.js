/* eslint-disable no-bitwise, no-continue */
import { activeStaff, periodRange, validDate } from './rosterModel';

export const DAYS = ['MON', 'WED', 'FRI'];
export const METHODS = ['phone', 'f2f', 'zoom'];
export const LABELS = {
  MON: 'Monday',
  WED: 'Wednesday',
  FRI: 'Friday',
  phone: 'Telephone duty',
  f2f: 'Face-to-face duty',
  zoom: 'Zoom duty',
};
export const defaultPreference = (monthCount = 3) => ({
  participating: true,
  leader: false,
  days: [...DAYS],
  methods: [...METHODS],
  months: Array.from({ length: monthCount }, (_, i) => i),
  preset: '',
  leave: [],
});
const order = (a, b) => String(a).localeCompare(String(b), 'en', { numeric: true });
export const groupPeople = (group) => [group.leaderId, ...group.memberIds];
export function shared(group, preferences, key) {
  const options = {
    days: DAYS,
    methods: METHODS,
    months: preferences[group.leaderId]?.months || [],
  };
  return groupPeople(group).reduce(
    (result, id) => result.filter((value) => preferences[id]?.[key]?.includes(value)),
    options[key]
  );
}
export function groupErrors(groups, preferences, people, checkPresets = true) {
  const eligible = new Set(activeStaff(people).map((p) => p.id));
  const seen = new Set();
  const errors = [];
  groups.forEach((group) => {
    if (!group.memberIds.length) errors.push('Each duty group needs at least two people.');
    if (!preferences[group.leaderId]?.leader || group.memberIds.length > 1)
      errors.push('Invalid group leader or group size.');
    groupPeople(group).forEach((id) => {
      if (seen.has(id) || !eligible.has(id) || !preferences[id]?.participating)
        errors.push('A person is duplicated or unavailable.');
      seen.add(id);
      if (
        id !== group.leaderId &&
        preferences[id]?.preset &&
        preferences[id].preset !== group.leaderId
      )
        errors.push('The group conflicts with a preset pairing.');
    });
    if (
      !shared(group, preferences, 'days').includes(group.day) ||
      !shared(group, preferences, 'methods').length ||
      !shared(group, preferences, 'months').length
    )
      errors.push('Group members have no shared availability.');
  });
  Object.entries(preferences).forEach(([id, pref]) => {
    if (
      checkPresets &&
      eligible.has(id) &&
      pref.participating &&
      pref.preset &&
      !groups.some((g) => g.leaderId === pref.preset && g.memberIds.includes(id))
    )
      errors.push('The group conflicts with a preset pairing.');
  });
  return [...new Set(errors)];
}
export function createFixedGroups(people, preferences) {
  const ids = activeStaff(people)
    .map((p) => p.id)
    .filter((id) => preferences[id]?.participating)
    .sort(order);
  const qualified = ids.filter((id) => preferences[id].leader);
  const leaders = qualified.filter((id) => !preferences[id].preset);
  if (!leaders.length)
    return {
      groups: [],
      errors: [
        qualified.length
          ? 'The group conflicts with a preset pairing.'
          : 'Select at least one group leader.',
      ],
      unassigned: [],
    };
  const groups = leaders.map((id) => ({ id: `group-${id}`, leaderId: id, memberIds: [], day: '' }));
  const errors = [];
  const compatible = (g, id) =>
    ['days', 'methods', 'months'].every(
      (key) => shared({ ...g, memberIds: [id] }, preferences, key).length
    );
  ids
    .filter((id) => preferences[id].preset)
    .forEach((id) => {
      const group = groups.find((g) => g.leaderId === preferences[id].preset);
      if (!group || id === group.leaderId || group.memberIds.length || !compatible(group, id))
        errors.push('The group conflicts with a preset pairing.');
      else group.memberIds = [id];
    });
  if (errors.length) return { groups: [], errors: [...new Set(errors)], unassigned: [] };
  const remaining = ids.filter((id) => !preferences[id].leader && !preferences[id].preset);
  remaining.sort(
    (a, b) =>
      groups.filter((g) => !g.memberIds.length && compatible(g, a)).length -
        groups.filter((g) => !g.memberIds.length && compatible(g, b)).length || order(a, b)
  );
  remaining.forEach((id) => {
    const group = groups.find((g) => !g.memberIds.length && compatible(g, id));
    if (group) group.memberIds = [id];
  });
  // Remaining qualified leaders can cover each other instead of serving alone.
  const soloLeaders = groups.filter((group) => !group.memberIds.length);
  const pairedLeaders = new Set();
  soloLeaders.forEach((group) => {
    if (pairedLeaders.has(group.leaderId)) return;
    const partner = soloLeaders.find(
      (other) =>
        other.leaderId !== group.leaderId &&
        !pairedLeaders.has(other.leaderId) &&
        compatible(group, other.leaderId)
    );
    if (partner) {
      group.memberIds = [partner.leaderId];
      pairedLeaders.add(group.leaderId);
      pairedLeaders.add(partner.leaderId);
    }
  });
  const completeGroups = groups.filter((group) => group.memberIds.length);
  const counts = { MON: 0, WED: 0, FRI: 0 };
  completeGroups.forEach((group) => {
    group.day =
      [...shared(group, preferences, 'days')].sort(
        (a, b) => counts[a] - counts[b] || DAYS.indexOf(a) - DAYS.indexOf(b)
      )[0] || '';
    if (group.day) counts[group.day] += 1;
  });
  return {
    groups: completeGroups,
    errors: completeGroups.length
      ? groupErrors(completeGroups, preferences, people)
      : ['Each duty group needs at least two people.'],
    unassigned: unassignedPeople(completeGroups, people, preferences),
  };
}
// Merging two leaders consumes the second leader's solo group. Removing that
// pairing restores the former member's solo group, retaining their qualification.
export function setGroupMember(groups, index, memberId, preferences) {
  const current = groups[index];
  const previousMember = current.memberIds[0];
  const next = groups
    .filter((g) => !(g.leaderId === memberId && !g.memberIds.length))
    .map((g) => (g.id === current.id ? { ...g, memberIds: memberId ? [memberId] : [] } : g));
  if (
    previousMember &&
    previousMember !== memberId &&
    preferences[previousMember]?.leader &&
    !next.some((g) => groupPeople(g).includes(previousMember))
  ) {
    const solo = {
      id: `group-${previousMember}`,
      leaderId: previousMember,
      memberIds: [],
      day: '',
    };
    solo.day = shared(solo, preferences, 'days')[0] || '';
    next.push(solo);
  }
  return next;
}
export function unassignedPeople(groups, people, preferences) {
  const assigned = new Set(groups.flatMap(groupPeople));
  return activeStaff(people)
    .filter((p) => preferences[p.id]?.participating && !assigned.has(p.id))
    .map((p) => ({
      id: p.id,
      reason: groups.some(
        (g) =>
          !g.memberIds.length &&
          ['days', 'methods', 'months'].every(
            (key) => shared({ ...g, memberIds: [p.id] }, preferences, key).length
          )
      )
        ? 'Review this unassigned person.'
        : 'No compatible group with an open slot.',
    }));
}
export function settingsErrors(period, start, end, preferences, holidays) {
  const errors = [];
  if (
    !periodRange(period) ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(start) ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(end) ||
    start >= end
  )
    errors.push('Choose a valid planning period and same-day time range.');
  if (
    Object.values(preferences).some((p) =>
      p.leave.some((l) => !validDate(l.from) || !validDate(l.to) || l.from > l.to)
    )
  )
    errors.push('Check unavailable date ranges.');
  if (
    holidays.some((h) => !validDate(h.date) || !h.name.trim()) ||
    new Set(holidays.map((h) => h.date)).size !== holidays.length
  )
    errors.push('Enter unique holiday dates and names.');
  return errors;
}
export function availabilityErrors(shift, group, preferences, people, period, holidays) {
  if (!group) return ['Choose a fixed group.'];
  const errors = groupErrors([group], preferences, people, false);
  const range = periodRange(period);
  if (!range || !validDate(shift.date) || shift.date < range.from || shift.date > range.to)
    return [...errors, 'Shift date must be within the planning period.'];
  const weekday = { 1: 'MON', 3: 'WED', 5: 'FRI' }[new Date(`${shift.date}T12:00:00Z`).getUTCDay()];
  const month =
    (Number(shift.date.slice(0, 4)) - Number(range.from.slice(0, 4))) * 12 +
    Number(shift.date.slice(5, 7)) -
    Number(range.from.slice(5, 7));
  if (
    group.day !== weekday ||
    !shared(group, preferences, 'months').includes(month) ||
    !shared(group, preferences, 'methods').includes(shift.method) ||
    groupPeople(group).some((id) =>
      preferences[id]?.leave.some((l) => l.from <= shift.date && shift.date <= l.to)
    ) ||
    holidays.some((h) => h.date === shift.date)
  )
    errors.push('This group is unavailable for this date or duty type.');
  return errors;
}
export function generateAutoRoster({ groups, preferences, people, period, start, end, holidays }) {
  const errors = [
    ...settingsErrors(period, start, end, preferences, holidays),
    ...groupErrors(groups, preferences, people),
  ];
  if (!groups.length) errors.push('Select at least one group leader.');
  if (errors.length) return { errors, rows: [], shifts: [], counts: {} };
  const range = periodRange(period);
  const counts = Object.fromEntries(groups.map((g) => [g.id, 0]));
  const rows = [];
  const shifts = [];
  for (
    let cursor = new Date(`${range.from}T12:00:00Z`);
    cursor.toISOString().slice(0, 10) <= range.to;
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  ) {
    if (![1, 3, 5].includes(cursor.getUTCDay())) continue;
    const date = cursor.toISOString().slice(0, 10);
    const holiday = holidays.find((h) => h.date === date);
    const row = { date, holiday: holiday?.name, assignments: {} };
    if (!holiday) {
      const choices = METHODS.map((method) =>
        groups.filter(
          (g) =>
            !availabilityErrors({ date, method }, g, preferences, people, period, holidays).length
        )
      );
      // Dynamic programming over the eight category masks: O(groups * 8 * 3).
      // A group is visited once, so it can never fill two categories on one date.
      let states = new Map([[0, { assignments: {}, cost: 0, rank: '' }]]);
      groups.forEach((group, index) => {
        const next = new Map(states);
        states.forEach((state, mask) =>
          METHODS.forEach((method, bit) => {
            if (mask & (1 << bit) || !choices[bit].includes(group)) return;
            const candidate = {
              assignments: { ...state.assignments, [method]: group },
              cost: state.cost + counts[group.id],
              rank: `${state.rank}${String(index).padStart(8, '0')}${bit}`,
            };
            const key = mask | (1 << bit);
            const old = next.get(key);
            if (
              !old ||
              candidate.cost < old.cost ||
              (candidate.cost === old.cost && candidate.rank < old.rank)
            )
              next.set(key, candidate);
          })
        );
        states = next;
      });
      const coverage = (state) => Object.keys(state.assignments).length;
      const best = [...states.values()].sort(
        (a, b) => coverage(b) - coverage(a) || a.cost - b.cost || a.rank.localeCompare(b.rank)
      )[0];
      row.assignments = best.assignments;
      METHODS.forEach((method) => {
        const group = row.assignments[method];
        if (group) {
          counts[group.id] += 1;
          shifts.push({
            id: `auto-${date}-${method}`,
            date,
            start,
            end,
            method,
            groupId: group.id,
            personIds: groupPeople(group),
            note: '',
          });
        }
      });
    }
    rows.push(row);
  }
  return { errors: [], rows, shifts, counts };
}
export const replacePeriod = (existing, incoming, range) => [
  ...existing.filter((s) => s.date < range.from || s.date > range.to),
  ...incoming,
];
