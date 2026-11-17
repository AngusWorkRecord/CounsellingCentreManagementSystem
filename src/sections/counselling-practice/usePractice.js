import { useEffect, useRef, useState } from 'react';
import { emptyRecord, recordKey, requestFeedback, validateRecord, FEEDBACK_VERSION } from './model';

export default function usePractice(language, feedbackVersion = FEEDBACK_VERSION) {
  const [record, setRecord] = useState(emptyRecord);
  const [confirmed, setConfirmed] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cache, setCache] = useState({});
  const [selectedVersions, setSelectedVersions] = useState({});
  const [last, setLast] = useState(null);
  const controller = useRef(null);
  const key = recordKey(record, language, feedbackVersion);
  // Assign during render too, so a response cannot win the interval before effect cleanup.
  const activeKey = useRef(key);
  activeKey.current = key;
  const cancel = () => { controller.current?.abort(); controller.current = null; setLoading(false); };
  useEffect(() => {
    controller.current?.abort();
    controller.current = null;
    setLoading(false);
    setError('');
    return () => controller.current?.abort();
  }, [key]);
  const selectedKey = recordKey(record, language, selectedVersions[key] ?? feedbackVersion);
  const feedback = cache[selectedKey]
    || (feedbackVersion === 2 ? cache[recordKey(record, language, 1)] : null)
    || (last?.language === language ? last : null);
  const run = async () => {
    const invalid = validateRecord(record);
    setErrors(invalid);
    if (Object.keys(invalid).length || !confirmed || loading) return false;
    cancel();
    const request = new AbortController();
    controller.current = request;
    setLoading(true);
    setError('');
    try {
      const data = await requestFeedback(record, language, request.signal, feedbackVersion);
      if (!request.signal.aborted && activeKey.current === key) {
        const actualVersion = data.feedbackVersion ?? 1;
        const actualKey = recordKey(record, language, actualVersion);
        const entry = { ...data, record: { ...record }, key: actualKey };
        setCache((previous) => ({ ...previous, [actualKey]: entry }));
        setSelectedVersions((previous) => ({ ...previous, [key]: actualVersion }));
        setLast(entry);
      }
    } catch (failure) {
      if (!request.signal.aborted && activeKey.current === key) setError(failure.code || 'AI_REQUEST_FAILED');
    } finally {
      if (controller.current === request) { controller.current = null; setLoading(false); }
    }
    return true;
  };
  const replaceRecord = (value) => {
    cancel();
    setRecord({ ...value });
    setConfirmed(false);
    setErrors({});
    setError('');
  };
  const clear = () => { replaceRecord(emptyRecord()); setCache({}); setSelectedVersions({}); setLast(null); };
  return { record, setRecord, confirmed, setConfirmed, errors, loading, error, feedback,
    hasContent: Object.values(record).some(Boolean) || Object.keys(cache).length > 0,
    stale: Boolean(feedback && feedback.key !== recordKey(record, language, feedback.feedbackVersion ?? 1)), run, cancel, replaceRecord, clear };
}
