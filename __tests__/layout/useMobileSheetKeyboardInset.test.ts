/** @jest-environment jsdom */

import { renderHook, act } from '@testing-library/react';
import { useMobileSheetKeyboardInset } from '@/lib/layout/useMobileSheetKeyboardInset';

describe('useMobileSheetKeyboardInset', () => {
  const originalVisualViewport = window.visualViewport;

  afterEach(() => {
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: originalVisualViewport,
    });
  });

  it('retorna 0 quando inativo ou sem visualViewport', () => {
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: undefined,
    });

    const { result, rerender } = renderHook(
      ({ active }) => useMobileSheetKeyboardInset(active),
      { initialProps: { active: false } },
    );
    expect(result.current).toBe(0);

    rerender({ active: true });
    expect(result.current).toBe(0);
  });

  it('calcula inset quando visualViewport encolhe', () => {
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 });
    const listeners = new Map<string, () => void>();
    const viewport = {
      height: 500,
      offsetTop: 0,
      addEventListener: (type: string, fn: () => void) => listeners.set(type, fn),
      removeEventListener: (type: string) => listeners.delete(type),
    };
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: viewport,
    });

    const { result } = renderHook(() => useMobileSheetKeyboardInset(true));
    expect(result.current).toBe(300);

    viewport.height = 700;

    act(() => {
      listeners.get('resize')?.();
    });
    expect(result.current).toBe(100);
  });
});
