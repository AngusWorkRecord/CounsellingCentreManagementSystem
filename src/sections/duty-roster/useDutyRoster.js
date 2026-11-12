import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { peopleService } from '../../services/peopleService';
import { activeStaff } from './rosterModel';

export default function useDutyRoster() {
  const [shifts, setShifts] = useState([]);
  const [people, setPeople] = useState([]);
  const [knownPeople, setKnownPeople] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revision, setRevision] = useState(0);
  const nextId = useRef(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    peopleService
      .list({ signal: controller.signal })
      .then((items) => {
        if (controller.signal.aborted) return;
        setPeople(items);
        // Retain the last known name for people subsequently removed from the directory.
        setKnownPeople((old) => ({
          ...old,
          ...Object.fromEntries(items.map((person) => [person.id, person])),
        }));
      })
      .catch((requestError) => {
        if (!controller.signal.aborted) setError(requestError);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [revision]);
  const save = useCallback((draft) => {
    const saved = { ...draft, personIds: [...draft.personIds], note: draft.note.trim() };
    if (!saved.id) {
      nextId.current += 1;
      saved.id = `shift-${nextId.current}`;
    }
    setShifts((old) =>
      old.some((shift) => shift.id === saved.id)
        ? old.map((shift) => (shift.id === saved.id ? saved : shift))
        : [...old, saved]
    );
  }, []);
  const remove = useCallback(
    (id) => setShifts((old) => old.filter((shift) => shift.id !== id)),
    []
  );
  const availablePeople = useMemo(() => activeStaff(people), [people]);
  return {
    shifts,
    people,
    knownPeople,
    availablePeople,
    loading,
    error,
    save,
    remove,
    reload: () => setRevision((old) => old + 1),
  };
}
