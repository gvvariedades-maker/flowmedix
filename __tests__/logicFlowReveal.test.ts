import { renderHook, act } from '@testing-library/react';
import { useReducedMotion } from 'framer-motion';
import {
  useLogicFlowReveal,
  isStepRevealed,
  isStepFuture,
  isStepActive,
  shouldShowLogicFlowTapHint,
} from '@/components/slides/variants/logicFlowReveal';

jest.mock('framer-motion', () => ({
  useReducedMotion: jest.fn(() => false),
}));

const mockUseReducedMotion = useReducedMotion as jest.MockedFunction<typeof useReducedMotion>;

describe('logicFlowReveal — helpers', () => {
  it('isStepRevealed reflete índices revelados', () => {
    expect(isStepRevealed(0, [0, 1])).toBe(true);
    expect(isStepRevealed(2, [0, 1])).toBe(false);
  });

  it('isStepFuture oculta passos após o último revelado em tap', () => {
    expect(isStepFuture(1, [])).toBe(true);
    expect(isStepFuture(2, [0, 1])).toBe(true);
    expect(isStepFuture(1, [0, 1])).toBe(false);
  });

  it('isStepActive marca o passo atual em tap', () => {
    expect(isStepActive(1, [0, 1], true)).toBe(true);
    expect(isStepActive(0, [0, 1], true)).toBe(false);
    expect(isStepActive(1, [0, 1], false)).toBe(false);
  });

  it('shouldShowLogicFlowTapHint até o penúltimo passo', () => {
    expect(shouldShowLogicFlowTapHint(true, false, 4, 0)).toBe(true);
    expect(shouldShowLogicFlowTapHint(true, false, 4, 2)).toBe(true);
    expect(shouldShowLogicFlowTapHint(true, false, 4, 3)).toBe(false);
    expect(shouldShowLogicFlowTapHint(true, true, 4, 2)).toBe(false);
    expect(shouldShowLogicFlowTapHint(false, false, 4, 0)).toBe(false);
  });
});

describe('useLogicFlowReveal', () => {
  beforeEach(() => {
    mockUseReducedMotion.mockReturnValue(false);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('modo auto revela todos os passos sequencialmente', async () => {
    const { result } = renderHook(() => useLogicFlowReveal(3, 'auto'));

    expect(result.current.isTapMode).toBe(false);
    expect(result.current.revealedSteps).toEqual([]);

    await act(async () => {
      await jest.advanceTimersByTimeAsync(600);
    });
    expect(result.current.revealedSteps).toEqual([0]);

    await act(async () => {
      await jest.advanceTimersByTimeAsync(1200);
    });
    expect(result.current.revealedSteps).toEqual([0, 1, 2]);
    expect(result.current.isComplete).toBe(true);
  });

  it('modo tap inicia só no passo 0 e avança com advanceStep', () => {
    const { result } = renderHook(() => useLogicFlowReveal(3, 'tap'));

    expect(result.current.isTapMode).toBe(true);
    expect(result.current.revealedSteps).toEqual([0]);
    expect(result.current.currentPasso).toBe(1);

    act(() => {
      result.current.advanceStep();
    });
    expect(result.current.revealedSteps).toEqual([0, 1]);
    expect(result.current.currentPasso).toBe(2);

    act(() => {
      result.current.advanceStep();
    });
    expect(result.current.revealedSteps).toEqual([0, 1, 2]);
    expect(result.current.isComplete).toBe(true);

    act(() => {
      result.current.advanceStep();
    });
    expect(result.current.revealedSteps).toEqual([0, 1, 2]);
  });

  it('omitir reveal_mode equivale a auto (legado)', async () => {
    const { result } = renderHook(() => useLogicFlowReveal(2));

    expect(result.current.isTapMode).toBe(false);

    await act(async () => {
      await jest.advanceTimersByTimeAsync(1200);
    });
    expect(result.current.revealedSteps).toEqual([0, 1]);
  });

  it('tap com prefers-reduced-motion revela todos de uma vez (equivalente a auto)', () => {
    mockUseReducedMotion.mockReturnValue(true);

    const { result } = renderHook(() => useLogicFlowReveal(3, 'tap'));

    expect(result.current.isTapMode).toBe(false);
    expect(result.current.revealedSteps).toEqual([0, 1, 2]);
    expect(result.current.isComplete).toBe(true);
  });
});
