import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  calculatePersonSwap,
  createSwapUndo,
  swapContextSnapshot,
  undoPersonSwap,
  SWAP_REASONS,
  commitPersonSwap,
} from './personSwap';
import {
  beginPersonDrag,
  endPersonDrag,
  getPersonDrag,
  PERSON_DRAG_TYPE,
  subscribePersonDrag,
} from './dragSession';

const message = (reason) => ({ id: reason, reason });
export default function usePersonDragSwap({
  scope,
  context,
  blocked,
  cancelKey,
  resetKey,
  onCommit,
  onConfirm,
  onUndo,
}) {
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)');
  const session = useSyncExternalStore(subscribePersonDrag, getPersonDrag, () => null);
  const [editor, edit] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [hoverTarget, setHoverTarget] = useState(null);
  const [undoRecord, setUndoRecord] = useState(null);
  const undoRef = useRef(null);
  const suppressClickUntil = useRef(0);
  const wasDragging = useRef(false);
  const latest = useRef(null);
  latest.current = { context, blocked, onCommit, onConfirm, onUndo };
  const sourceStillPresent =
    !session ||
    session.scope !== scope ||
    !session.shiftId ||
    context.shifts.some(
      (shift) => shift.id === session.shiftId && shift.personIds.includes(session.personId)
    );
  useEffect(() => {
    if (!sourceStillPresent) {
      endPersonDrag();
      setFeedback({ severity: 'error', issues: [message(SWAP_REASONS.changed)] });
    }
  }, [sourceStillPresent]);
  useEffect(() => {
    if (getPersonDrag()?.scope === scope) endPersonDrag();
    return () => {
      if (getPersonDrag()?.scope === scope) endPersonDrag();
    };
  }, [scope, cancelKey, finePointer, blocked]);
  useEffect(() => {
    undoRef.current = null;
    setUndoRecord(null);
    edit(null);
    setFeedback(null);
  }, [resetKey]);
  useEffect(() => {
    if (!session) setHoverTarget(null);
    if (session) {
      wasDragging.current = true;
      suppressClickUntil.current = Date.now() + 600;
    } else if (wasDragging.current) {
      wasDragging.current = false;
      suppressClickUntil.current = Date.now() + 400;
    }
  }, [session, scope]);

  const inspect = (shiftId, personId, current = getPersonDrag()) => {
    const args = latest.current;
    if (!current) return { status: 'none', issues: [] };
    if (current.scope !== scope)
      return {
        status: 'invalid',
        issues: [message('Dragging between the preview and calendar is not supported.')],
      };
    if (args.blocked) return { status: 'invalid', issues: [message(SWAP_REASONS.changed)] };
    const target = typeof shiftId === 'object' ? shiftId : null;
    let kind = personId ? 'swap' : 'move';
    if (!current.shiftId) kind = 'add';
    const selection = {
      kind,
      sourceShiftId: current.shiftId,
      sourcePersonId: current.personId,
      targetShiftId: target?.id || shiftId,
      targetShift: target,
      targetPersonId: personId,
    };
    const checked = commitPersonSwap(args.context, selection, current.snapshot);
    if (!checked.ok) return { status: 'invalid', issues: checked.errors, selection };
    const result = calculatePersonSwap(args.context, selection);
    if (result.errors.length) return { status: 'invalid', issues: result.errors, selection };
    if (result.warnings.length) return { status: 'warning', issues: result.warnings, selection };
    return { status: 'valid', issues: [], selection };
  };
  const commit = (selection, snapshot, accepted) => {
    const args = latest.current;
    if (args.blocked) return { ok: false, errors: [message(SWAP_REASONS.changed)] };
    const before = args.context;
    const result = args.onCommit(selection, snapshot, accepted);
    if (result.ok && result.updated?.length === 0) return result;
    if (result.ok) {
      const record = createSwapUndo(before, result.shifts, selection);
      undoRef.current = record;
      setUndoRecord(record);
      setFeedback({ severity: 'success', issues: [message('Manual roster updated.')] });
    } else setFeedback({ severity: 'error', issues: result.errors });
    return result;
  };
  const undoCheck = undoRecord ? undoPersonSwap(context, undoRecord) : null;
  const hoverFeedback =
    session && hoverTarget ? inspect(hoverTarget.shiftId, hoverTarget.personId) : null;
  return {
    scope,
    context,
    editor,
    edit: (request) =>
      edit(
        request
          ? {
              ...request,
              token: `${Date.now()}-${Math.random()}`,
              snapshot: swapContextSnapshot(latest.current.context.shifts),
            }
          : null
      ),
    apply: (selection, snapshot) =>
      commit(selection, snapshot || swapContextSnapshot(latest.current.context.shifts)),
    session,
    enabled: finePointer && !blocked,
    feedback,
    hoverFeedback,
    hover: (shiftId, personId) =>
      setHoverTarget((old) =>
        old?.shiftId === shiftId && old?.personId === personId ? old : { shiftId, personId }
      ),
    clearHover: () => setHoverTarget(null),
    dismissFeedback: () => setFeedback(null),
    hasUndo: !!undoRecord,
    canUndo: !!undoCheck?.ok && !blocked,
    undoErrors: undoCheck?.errors || [],
    cancel: endPersonDrag,
    inspect,
    commit,
    suppressClick: (event) => event.detail > 0 && Date.now() < suppressClickUntil.current,
    start: (event, shiftId, personId) => {
      if (!finePointer || latest.current.blocked) {
        event.preventDefault();
        return;
      }
      const ctx = latest.current.context;
      const next = {
        scope,
        shiftId,
        personId,
        token: `${Date.now()}-${Math.random()}`,
        snapshot: swapContextSnapshot(ctx.shifts, ctx.people, ctx.rules, ctx.period),
      };
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData(
        PERSON_DRAG_TYPE,
        JSON.stringify({ scope, shiftId, personId, token: next.token })
      );
      suppressClickUntil.current = Date.now() + 600;
      beginPersonDrag(next);
    },
    drop: (event, shiftId, personId) => {
      event.preventDefault();
      event.stopPropagation();
      const current = getPersonDrag();
      let payload;
      try {
        payload = JSON.parse(event.dataTransfer.getData(PERSON_DRAG_TYPE));
      } catch {
        endPersonDrag();
        return;
      }
      if (!current || payload.token !== current.token) {
        endPersonDrag();
        return;
      }
      const check = inspect(shiftId, personId, current);
      endPersonDrag();
      suppressClickUntil.current = Date.now() + 400;
      if (check.status === 'invalid') {
        setFeedback({ severity: 'error', issues: check.issues });
        return;
      }
      if (check.status === 'warning') {
        latest.current.onConfirm({
          ...check.selection,
          initialSnapshot: current.snapshot,
          fromDrag: true,
        });
        return;
      }
      if (check.status === 'valid') commit(check.selection, current.snapshot, false);
    },
    undo: () => {
      if (!undoRef.current || latest.current.blocked) return;
      const result = latest.current.onUndo(undoRef.current);
      if (result.ok) {
        undoRef.current = null;
        setUndoRecord(null);
        setFeedback({ severity: 'success', issues: [message('Manual change undone.')] });
      } else setFeedback({ severity: 'error', issues: result.errors });
    },
  };
}
