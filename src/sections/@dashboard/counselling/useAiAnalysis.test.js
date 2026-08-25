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
});
