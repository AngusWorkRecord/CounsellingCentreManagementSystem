import { validateShift } from './rosterModel';

export const SWAP_REASONS = {
  selection: 'Choose two different shifts and two different people.',
  missing: 'The selected shift or person is no longer available.',
  changed: 'Assignments changed. Recheck the selection before confirming.',
};

const issue = (reason, shift, personId = '') => ({
  reason,
  shiftId: shift?.id || '',
  date: shift?.date || '',
  method: shift?.method || '',
  personId,
  id: `${shift?.id || ''}:${personId}:${reason}`,
});

export function swapContextSnapshot(shifts) {
  return JSON.stringify(shifts);
}
export function assignmentSnapshot(shift) {
  return JSON.stringify(shift);
}

export function inspectActualAssignment(shift) {
  return {
    errors: Object.values(validateShift(shift)).map((reason) => issue(reason, shift)),
    warnings: [],
  };
}
export function assignmentReviewIssues() {
  return [];
}

export function calculatePersonSwap(context, selection) {
  const { sourceShiftId, sourcePersonId, targetShiftId, targetPersonId } = selection;
  const kind = selection.kind || 'swap';
  const source = context.shifts.find((s) => s.id === sourceShiftId);
  const target = context.shifts.find((s) => s.id === targetShiftId) || selection.targetShift;
  const fail = (reason) => ({
    errors: [issue(reason)],
    warnings: [],
    shifts: context.shifts,
    updated: [],
  });
  if (!['add', 'save'].includes(kind) && (!source || !source.personIds.includes(sourcePersonId)))
    return fail(SWAP_REASONS.missing);
  if (kind !== 'remove' && !target) return fail(SWAP_REASONS.missing);
  if (kind === 'add' && !context.people.some((p) => p.id === sourcePersonId))
    return fail(SWAP_REASONS.missing);
  if (kind === 'swap' && !target.personIds.includes(targetPersonId))
    return fail(SWAP_REASONS.missing);
  if (['move', 'swap'].includes(kind) && source.id === target.id)
    return fail(SWAP_REASONS.selection);
  const change = (shift, ids) => ({
    ...shift,
    personIds: [...new Set(ids)],
    manualAssignment: { type: 'manualEdit' },
  });
  let updated = [];
  if (kind === 'save') updated = [change(selection.targetShift, selection.targetShift.personIds)];
  if (kind === 'remove')
    updated = [
      change(
        source,
        source.personIds.filter((id) => id !== sourcePersonId)
      ),
    ];
  if (kind === 'add' && !target.personIds.includes(sourcePersonId))
    updated = [change(target, [...target.personIds, sourcePersonId])];
  if (kind === 'move')
    updated = [
      change(
        source,
        source.personIds.filter((id) => id !== sourcePersonId)
      ),
      change(target, [...target.personIds, sourcePersonId]),
    ];
  if (kind === 'swap') {
    if (sourcePersonId === targetPersonId) return fail(SWAP_REASONS.selection);
    updated = [
      change(
        source,
        source.personIds.map((id) => (id === sourcePersonId ? targetPersonId : id))
      ),
      change(
        target,
        target.personIds.map((id) => (id === targetPersonId ? sourcePersonId : id))
      ),
    ];
  }
  const errors = updated.flatMap((shift) => inspectActualAssignment(shift).errors);
  const shifts = [
    ...context.shifts.map((s) => updated.find((u) => u.id === s.id) || s),
    ...updated.filter((u) => !context.shifts.some((s) => s.id === u.id)),
  ];
  return { errors, warnings: [], shifts, updated };
}

export function commitPersonSwap(context, selection, expectedSnapshot) {
  if (expectedSnapshot) {
    let previous;
    try {
      previous = JSON.parse(expectedSnapshot);
    } catch {
      previous = null;
    }
    const ids = [selection.sourceShiftId, selection.targetShiftId];
    if (
      !Array.isArray(previous) ||
      ids.some(
        (id) =>
          JSON.stringify(previous.find((s) => s.id === id)) !==
          JSON.stringify(context.shifts.find((s) => s.id === id))
      )
    )
      return {
        ok: false,
        errors: [issue(SWAP_REASONS.changed)],
        warnings: [],
        shifts: context.shifts,
      };
  }
  const result = calculatePersonSwap(context, selection);
  return {
    ...result,
    ok: !result.errors.length,
    shifts: result.errors.length ? context.shifts : result.shifts,
  };
}
export function createSwapUndo(context, afterShifts, selection) {
  const ids = [...new Set([selection.sourceShiftId, selection.targetShiftId].filter(Boolean))];
  return {
    ids,
    before: JSON.parse(JSON.stringify(context.shifts.filter((s) => ids.includes(s.id)))),
    after: JSON.stringify(afterShifts.filter((s) => ids.includes(s.id))),
  };
}
export function undoPersonSwap(context, record) {
  const ids = record?.ids || record?.before.map((s) => s.id);
  const current = record ? context.shifts.filter((s) => ids.includes(s.id)) : [];
  const versions = (rows) =>
    JSON.stringify(
      rows.map(({ id, version }) => ({ id, version })).sort((a, b) => a.id.localeCompare(b.id))
    );
  const changed = record?.serverUndo
    ? versions(current) !== versions(JSON.parse(record.after))
    : JSON.stringify(current) !== record?.after;
  if (!record || changed)
    return { ok: false, shifts: context.shifts, errors: [issue(SWAP_REASONS.changed)] };
  return {
    ok: true,
    errors: [],
    shifts: [
      ...context.shifts
        .filter((s) => !ids.includes(s.id) || record.before.some((b) => b.id === s.id))
        .map((s) => record.before.find((b) => b.id === s.id) || s),
      ...record.before.filter((b) => !context.shifts.some((s) => s.id === b.id)),
    ],
  };
}
