import { useCallback, useEffect, useRef, useState } from 'react';
import {
  dutyRosterService,
  requestId,
  settingsData,
  settingsSignature,
  rosterErrorMessage,
} from '../../services/dutyRosterService';
import { periodRange } from './rosterModel';

export const defaultRules = (period) => ({
  preferences: {},
  groups: [],
  holidays: [],
  start: '09:00',
  end: '10:00',
  stale: true,
  period,
});
export default function useRosterSettings(period) {
  const key = JSON.stringify(periodRange(period));
  const [rules, setRules] = useState(() => defaultRules(period));
  const [baseline, setBaseline] = useState('');
  const [version, setVersion] = useState(0);
  const [loadedKey, setLoadedKey] = useState('');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [revision, setRevision] = useState(0);
  const pending = useRef(null);
  const busy = useRef(false);
  const current = useRef(null);
  current.current = { rules, version, key };
  useEffect(() => {
    const range = JSON.parse(key);
    if (!range) return undefined;
    const controller = new AbortController();
    pending.current = null;
    setLoadedKey('');
    setError(null);
    dutyRosterService
      .getSettings(range, { signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return;
        const next = { ...(data.settings || defaultRules(range)), period: range };
        setRules(next);
        setVersion(data.version);
        setBaseline(settingsSignature(settingsData(next)));
        setLoadedKey(key);
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(e);
      });
    return () => controller.abort();
  }, [key, revision]);
  const save = useCallback(async () => {
    if (busy.current) return false;
    const state = current.current;
    const range = JSON.parse(state.key);
    if (!range) return false;
    let body = pending.current || {
      requestId: requestId(),
      ...range,
      version: state.version,
      data: settingsData(state.rules),
    };
    busy.current = true;
    setSaving(true);
    setError(null);
    try {
      // A retry may acknowledge an older draft. Complete the user's explicit
      // save with their latest edits before allowing a save-and-leave action.
      const saveLatest = async () => {
        const data = await dutyRosterService.saveSettings(body);
        pending.current = null;
        if (current.current.key !== state.key) return true;
        setVersion(data.version);
        setBaseline(settingsSignature(data.settings));
        const latest = settingsData(current.current.rules);
        if (settingsSignature(latest) === settingsSignature(body.data)) return true;
        body = { requestId: requestId(), ...range, version: data.version, data: latest };
        return saveLatest();
      };
      const complete = await saveLatest();
      return complete;
    } catch (e) {
      pending.current = !e.status || e.status >= 500 ? body : null;
      setError(e);
      return false;
    } finally {
      busy.current = false;
      setSaving(false);
    }
  }, []);
  return {
    rules,
    setRules,
    saving,
    save,
    error,
    errorText: error ? rosterErrorMessage(error) : '',
    loading: loadedKey !== key && !error,
    ready: loadedKey === key,
    dirty: loadedKey === key && settingsSignature(settingsData(rules)) !== baseline,
    uncertain: !!pending.current,
    reload: () => {
      pending.current = null;
      setRevision((v) => v + 1);
    },
  };
}
