/* eslint-env jest */
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import PropTypes from 'prop-types';

import useAiAnalysis from './useAiAnalysis';

let currentHook;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function Harness({ generate, loadLatest, scopeKey }) {
  currentHook = useAiAnalysis({ generate, loadLatest, scopeKey });
  return null;
}

Harness.propTypes = {
  generate: PropTypes.func.isRequired,
  loadLatest: PropTypes.func.isRequired,
  scopeKey: PropTypes.string.isRequired,
};

describe('useAiAnalysis', () => {
  let container;
  let root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    currentHook = undefined;
  });

  test('switching to AI only checks cache; generation requires an explicit run', async () => {
    const loadLatest = jest.fn().mockResolvedValue(null);
    const generate = jest.fn().mockResolvedValue({
      analysisId: 'analysis-1', generatedAt: '2026-01-01', result: { status: 'stable' },
    });

    await act(async () => {
      root.render(<Harness generate={generate} loadLatest={loadLatest} scopeKey="scope-1" />);
    });
    expect(currentHook.mode).toBe('general');
    expect(loadLatest).not.toHaveBeenCalled();
    expect(generate).not.toHaveBeenCalled();

    await act(async () => currentHook.setMode('ai'));
    expect(loadLatest).toHaveBeenCalledTimes(1);
    expect(generate).not.toHaveBeenCalled();

    await act(async () => currentHook.run());
    expect(generate).toHaveBeenCalledTimes(1);
    expect(currentHook.analysis.analysisId).toBe('analysis-1');
  });

  test('a scope change marks an existing result stale without generating again', async () => {
    const loadLatest = jest.fn().mockResolvedValue(null);
    const generate = jest.fn().mockResolvedValue({
      analysisId: 'analysis-1', generatedAt: '2026-01-01', result: { status: 'stable' },
    });

    await act(async () => {
      root.render(<Harness generate={generate} loadLatest={loadLatest} scopeKey="scope-1" />);
    });
    await act(async () => currentHook.run());
    await act(async () => {
      root.render(<Harness generate={generate} loadLatest={loadLatest} scopeKey="scope-2" />);
    });

    expect(currentHook.stale).toBe(true);
    expect(generate).toHaveBeenCalledTimes(1);
  });

  test('a late response from the previous language cannot replace the current analysis', async () => {
    let resolveOld;
    const oldLoad = jest.fn(() => new Promise((resolve) => { resolveOld = resolve; }));
    const newLoad = jest.fn().mockResolvedValue({ analysisId: 'english', result: {} });
    const generate = jest.fn();
    await act(async () => root.render(<Harness generate={generate} loadLatest={oldLoad} scopeKey="case:cn" />));
    await act(async () => currentHook.setMode('ai'));
    await act(async () => root.render(<Harness generate={generate} loadLatest={newLoad} scopeKey="case:en" />));
    await act(async () => resolveOld({ analysisId: 'chinese', result: {} }));
    expect(currentHook.analysis.analysisId).toBe('english');
    expect(currentHook.stale).toBe(false);
    expect(generate).not.toHaveBeenCalled();
  });

  test('cancelled generation is ignored even if the transport resolves later', async () => {
    let resolveGeneration;
    const generate = jest.fn(() => new Promise((resolve) => { resolveGeneration = resolve; }));
    const loadLatest = jest.fn().mockResolvedValue(null);
    await act(async () => root.render(<Harness generate={generate} loadLatest={loadLatest} scopeKey="case:cn" />));
    let pending;
    act(() => { pending = currentHook.run(); });
    act(() => currentHook.cancel());
    await act(async () => { resolveGeneration({ analysisId: 'cancelled', result: {} }); await pending; });
    expect(currentHook.analysis).toBe(null);
    expect(currentHook.loading).toBe(false);
  });

  test('legacy cached results are shown as outdated', async () => {
    const loadLatest = jest.fn().mockResolvedValue({ analysisId: 'legacy', result: {}, legacy: true });
    await act(async () => root.render(<Harness generate={jest.fn()} loadLatest={loadLatest} scopeKey="case:cn" />));
    await act(async () => currentHook.setMode('ai'));
    expect(currentHook.analysis.analysisId).toBe('legacy');
    expect(currentHook.stale).toBe(true);
  });
});
