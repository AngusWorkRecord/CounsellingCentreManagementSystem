import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { tr, useUiLanguage } from '../../../locales/translate';

export default function useAiAnalysis({ generate, loadLatest, scopeKey }) {
  const language = useUiLanguage();
  const [mode, setMode] = useState('general');
  const [analysis, setAnalysis] = useState(null);
  const [analysisScopeKey, setAnalysisScopeKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const controllerRef = useRef(null);
  const stale = Boolean(analysis && (analysis.legacy || analysisScopeKey !== scopeKey));

  useEffect(() => {
    if (mode !== 'ai') return undefined;
    const controller = new AbortController();
    controllerRef.current?.abort();
    controllerRef.current = controller;
    setLoading(true);
    setError('');
    loadLatest({ signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted && data) {
          setAnalysis(data);
          setAnalysisScopeKey(scopeKey);
        }
      })
      .catch((requestError) => {
        // 中文原文：无法读取 AI 分析
        if (!controller.signal.aborted && requestError.name !== 'AbortError') setError(requestError.code || 'AI_REQUEST_FAILED');
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
      if (!controller.signal.aborted) {
        setAnalysis(data);
        setAnalysisScopeKey(scopeKey);
      }
    } catch (requestError) {
      // 中文原文：无法生成 AI 分析
      if (!controller.signal.aborted && requestError.name !== 'AbortError') setError(requestError.code || 'AI_REQUEST_FAILED');
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [generate, scopeKey]);

  useEffect(() => () => controllerRef.current?.abort(), [scopeKey]);

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
    setLoading(false);
  }, []);

  return useMemo(() => ({
    mode,
    setMode,
    analysis,
    loading,
    error: error ? tr(error, { lng: language }) : '',
    stale,
    run,
    cancel,
  }), [analysis, cancel, error, loading, mode, run, stale, language]);
}
