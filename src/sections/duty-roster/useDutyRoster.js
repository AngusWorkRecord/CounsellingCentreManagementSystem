import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { peopleService } from '../../services/peopleService';
import {
  dutyRosterService,
  requestId,
  rosterErrorMessage,
  shiftWrite,
} from '../../services/dutyRosterService';
import { activeStaff, periodRange } from './rosterModel';
import { commitPersonSwap, undoPersonSwap } from './personSwap';

const issue = (error) => ({ id: 'save', reason: rosterErrorMessage(error) });
export default function useDutyRoster(period, visibleRange) {
  const [shifts, setShifts] = useState([]);
  const shiftsRef = useRef([]);
  const [people, setPeople] = useState([]);
  const [knownPeople, setKnownPeople] = useState({});
  const directory = useRef({});
  const [peopleLoading, setPeopleLoading] = useState(true);
  const [readCount, setReadCount] = useState(0);
  const [error, setError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [conflict, setConflict] = useState(false);
  const [revision, setRevision] = useState(0);
  const [lastUndo, setLastUndo] = useState(null);
  const [appliedRevision, setAppliedRevision] = useState(0);
  const [saved, setSaved] = useState(false);
  const busy = useRef(false);
  const epoch = useRef(0);
  const mounted = useRef(true);
  const requests = useRef(new Map());
  const loaded = useRef(new Map());
  const pending = useRef(null);
  const update = useCallback((next) => {
    shiftsRef.current = next;
    if (mounted.current) setShifts(next);
  }, []);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const mergeNames = useCallback(
    (names) => setKnownPeople((old) => ({ ...old, ...directory.current, ...names })),
    []
  );
  useEffect(() => {
    const controller = new AbortController();
    setPeopleLoading(true);
    peopleService
      .list({ signal: controller.signal })
      .then((items) => {
        if (controller.signal.aborted) return;
        directory.current = Object.fromEntries(items.map((p) => [p.id, p]));
        setPeople(items);
        mergeNames(directory.current);
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(e);
      })
      .finally(() => {
        if (!controller.signal.aborted) setPeopleLoading(false);
      });
    return () => controller.abort();
  }, [revision, mergeNames]);

  const loadRange = useCallback(
    async (range, force = false) => {
      if (!periodRange(range)) return false;
      const key = JSON.stringify(range);
      if (!force && loaded.current.has(key)) return true;
      if (requests.current.has(key)) return requests.current.get(key);
      const generation = epoch.current;
      if (mounted.current) setReadCount((n) => n + 1);
      const job = dutyRosterService
        .list(range)
        .then((data) => {
          if (!mounted.current || generation !== epoch.current) return false;
          const outside = shiftsRef.current.filter((s) => s.date < range.from || s.date > range.to);
          // A shift can move across ranges; its current server ID is authoritative.
          update([
            ...outside.filter((s) => !data.shifts.some((r) => r.id === s.id)),
            ...data.shifts,
          ]);
          mergeNames(data.knownPeople);
          loaded.current.set(key, range);
          return data;
        })
        .catch((e) => {
          if (mounted.current) setError(e);
          return false;
        })
        .finally(() => {
          requests.current.delete(key);
          if (mounted.current) setReadCount((n) => n - 1);
        });
      requests.current.set(key, job);
      return job;
    },
    [mergeNames, update]
  );
  const periodKey = JSON.stringify(periodRange(period));
  const visibleKey = JSON.stringify(periodRange(visibleRange));
  useEffect(() => {
    if (!saving) {
      const ranges = [JSON.parse(periodKey), JSON.parse(visibleKey)].filter(Boolean);
      ranges.forEach((range) => {
        loadRange(range);
      });
    }
  }, [periodKey, visibleKey, saving, revision, loadRange]);
  const reload = useCallback(async () => {
    if (busy.current) return;
    setError(null);
    setSaveError(null);
    setConflict(false);
    const ranges = [
      ...loaded.current.values(),
      JSON.parse(periodKey),
      JSON.parse(visibleKey),
    ].filter(Boolean);
    loaded.current.clear();
    setRevision((n) => n + 1);
    const results = await Promise.all(ranges.map((range) => loadRange(range, true)));
    if (results.some((ok) => !ok)) setConflict(true);
  }, [loadRange, periodKey, visibleKey]);
  const run = useCallback(
    async (job) => {
      if (busy.current) return { ok: false, errors: [issue({ code: 'ROSTER_BUSY' })] };
      busy.current = true;
      epoch.current += 1;
      setSaving(true);
      setSaveError(null);
      setSaved(false);
      try {
        const data = await dutyRosterService.write(job.body);
        pending.current = null;
        let next = shiftsRef.current;
        if (job.body.kind === 'replace')
          next = next.filter((s) => s.date < job.body.from || s.date > job.body.to);
        const affected = [...data.deleted, ...data.shifts.map((s) => s.id)];
        next = [...next.filter((s) => !affected.includes(s.id)), ...data.shifts];
        update(next);
        mergeNames(data.knownPeople);
        const undoRecord = data.undoId
          ? {
              ids: affected,
              before: job.before,
              after: JSON.stringify(next.filter((s) => affected.includes(s.id))),
              serverUndo: data.undoId,
            }
          : null;
        setLastUndo(undoRecord);
        setSaved(true);
        if (job.body.kind === 'replace') setAppliedRevision((n) => n + 1);
        return { ok: true, shifts: next, updated: data.shifts, undoRecord, errors: [] };
      } catch (e) {
        if (!e.status || e.status >= 500) pending.current = job;
        else pending.current = null;
        if (e.status === 409) setConflict(true);
        setSaveError(e);
        return { ok: false, shifts: shiftsRef.current, errors: [issue(e)] };
      } finally {
        epoch.current += 1;
        busy.current = false;
        if (mounted.current) setSaving(false);
      }
    },
    [update, mergeNames]
  );
  const write = useCallback(
    (body, before) => {
      if (pending.current || busy.current || conflict)
        return Promise.resolve({ ok: false, errors: [issue({ code: 'ROSTER_BUSY' })] });
      return run({ body: { ...body, requestId: requestId() }, before });
    },
    [run, conflict]
  );
  const swap = async (selection, snapshot, accepted, rules, currentPeriod) => {
    const context = { shifts: shiftsRef.current, people, rules, period: currentPeriod };
    const result = commitPersonSwap(context, selection, snapshot, accepted);
    if (!result.ok || !result.updated.length) return result;
    const ids = result.updated.map((s) => s.id);
    return write(
      { kind: 'patch', upserts: result.updated.map((s) => shiftWrite(s)), deletes: [] },
      context.shifts.filter((s) => ids.includes(s.id))
    );
  };
  return {
    shifts,
    people,
    knownPeople,
    loading: peopleLoading || readCount > 0,
    error,
    saving,
    saveError,
    saved,
    uncertain: !!pending.current,
    lastUndo,
    appliedRevision,
    loadRange,
    reload,
    blocked: busy.current || conflict || !!pending.current,
    retry: () => (pending.current ? run(pending.current) : reload()),
    availablePeople: useMemo(() => activeStaff(people), [people]),
    swap,
    remove: (id) => {
      const s = shiftsRef.current.find((item) => item.id === id);
      return s
        ? write({ kind: 'patch', upserts: [], deletes: [{ id, version: s.version }] }, [s])
        : Promise.resolve({ ok: false });
    },
    replace: async (incoming, range, expected) => {
      if (!loaded.current.has(JSON.stringify(range))) {
        setSaveError({ code: 'ROSTER_RANGE_NOT_LOADED' });
        return { ok: false };
      }
      return write(
        { kind: 'replace', ...range, expected, upserts: incoming.map((s) => shiftWrite(s, true)) },
        shiftsRef.current.filter((s) => s.date >= range.from && s.date <= range.to)
      );
    },
    undoSwap: (record, rules, currentPeriod) => {
      const check = undoPersonSwap(
        { shifts: shiftsRef.current, people, rules, period: currentPeriod },
        record
      );
      if (!check.ok) return Promise.resolve(check);
      return write({ kind: 'undo', undoId: record.serverUndo }, []);
    },
  };
}
