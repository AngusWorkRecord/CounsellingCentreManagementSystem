import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export default function useAiAnalysis({ generate, loadLatest, scopeKey }) {
  const [mode, setMode] = useState('general');
  const [analysis, setAnalysis] = useState(null);
  const [analysisScopeKey, setAnalysisScopeKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const controllerRef = useRef(null);
  const stale = Boolean(analysis && analysisScopeKey !== scopeKey);

  useEffect(() => {
    if (mode !== 'ai') return undefined;
    const controller = new AbortController();
    controllerRef.current?.abort();
    controllerRef.current = controller;
    setLoading(true);
    setError('');
    loadLatest({ signal: controller.signal })
      .then((data) => {
        if (data) {
          setAnalysis(data);
          setAnalysisScopeKey(scopeKey);
        }
      })
      .catch((requestError) => {
        // 中文原文：无法读取 AI 分析
        if (requestError.name !== 'AbortError') setError(requestError.message || 'Unable to retrieve AI analysis');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [loadLatest, mode, scopeKey]);

  const run = useCallback(async () => {
    const controller = new AbortController();
    controllerRef.current?.abort();
    controllerRef.current = controller;
    setLoading(true);
    setError('');
    try {
      const data = await generate({ signal: controller.signal });
      setAnalysis(data);
      setAnalysisScopeKey(scopeKey);
    } catch (requestError) {
      // 中文原文：无法生成 AI 分析
      if (requestError.name !== 'AbortError') setError(requestError.message || 'Unable to generate AI analysis');
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [generate, scopeKey]);

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
    setLoading(false);
  }, []);

  return useMemo(() => ({
    mode,
    setMode,
    analysis,
    loading,
    error,
    stale,
    run,
    cancel,
  }), [analysis, cancel, error, loading, mode, run, stale]);
}
