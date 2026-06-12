import { act, renderHook } from '@testing-library/react';
import { useCatalogStatsCountUp } from '@/hooks/useCatalogStatsCountUp';
import { VITRINE_STATS_SEEN_STORAGE_KEY } from '@/lib/vitrine/catalogStatsAnimation';

describe('useCatalogStatsCountUp', () => {
  let rafCallback: ((ts: number) => void) | null = null;

  beforeEach(() => {
    localStorage.clear();
    rafCallback = null;
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallback = cb as (ts: number) => void;
      return 1;
    });
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('anima até o alvo na 1ª visita e grava statsSeen', () => {
    const { result } = renderHook(() => useCatalogStatsCountUp(100, 400));

    expect(result.current.totalQuestions).toBe(0);
    expect(result.current.animating).toBe(true);

    act(() => {
      expect(rafCallback).not.toBeNull();
      rafCallback?.(0);
    });

    act(() => {
      rafCallback?.(600);
    });

    expect(result.current.totalQuestions).toBe(100);
    expect(result.current.totalSlides).toBe(400);
    expect(result.current.ready).toBe(true);
    expect(result.current.animating).toBe(false);
    expect(localStorage.getItem(VITRINE_STATS_SEEN_STORAGE_KEY)).toBe('1');
  });

  it('exibe valores finais quando statsSeen já existe', () => {
    localStorage.setItem(VITRINE_STATS_SEEN_STORAGE_KEY, '1');

    const { result } = renderHook(() => useCatalogStatsCountUp(50, 200));

    expect(result.current.totalQuestions).toBe(50);
    expect(result.current.totalSlides).toBe(200);
    expect(result.current.ready).toBe(true);
    expect(result.current.animating).toBe(false);
    expect(rafCallback).toBeNull();
  });
});
