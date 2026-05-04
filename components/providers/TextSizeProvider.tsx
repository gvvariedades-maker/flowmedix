'use client';

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  TEXT_SIZE_STEP_COUNT,
  TEXT_SIZE_STEP_DEFAULT,
  TEXT_SIZE_STORAGE_KEY,
  clampTextSizeStep,
  getFontSizePercentForStep,
  getLabelForStep,
} from '@/lib/textSizePreference';

type TextSizeContextValue = {
  step: number;
  setStep: (n: number) => void;
  decrease: () => void;
  increase: () => void;
  canDecrease: boolean;
  canIncrease: boolean;
  label: string;
};

const TextSizeContext = createContext<TextSizeContextValue | null>(null);

function applyStepToDocument(step: number): void {
  document.documentElement.style.fontSize = getFontSizePercentForStep(step);
}

function readTextSizeStepFromStorage(): number {
  if (typeof window === 'undefined') {
    return TEXT_SIZE_STEP_DEFAULT;
  }
  try {
    const raw = localStorage.getItem(TEXT_SIZE_STORAGE_KEY);
    return raw === null ? TEXT_SIZE_STEP_DEFAULT : clampTextSizeStep(parseInt(raw, 10));
  } catch {
    return TEXT_SIZE_STEP_DEFAULT;
  }
}

export function TextSizeProvider({ children }: { children: ReactNode }) {
  const [step, setStepState] = useState(readTextSizeStepFromStorage);

  useLayoutEffect(() => {
    applyStepToDocument(step);
  }, [step]);

  const setStep = useCallback((n: number) => {
    const s = clampTextSizeStep(n);
    setStepState(s);
    try {
      localStorage.setItem(TEXT_SIZE_STORAGE_KEY, String(s));
    } catch {
      /* ignore quota / private mode */
    }
    applyStepToDocument(s);
  }, []);

  const decrease = useCallback(() => {
    setStepState((prev) => {
      const next = clampTextSizeStep(prev - 1);
      try {
        localStorage.setItem(TEXT_SIZE_STORAGE_KEY, String(next));
      } catch {
        /* ignore */
      }
      applyStepToDocument(next);
      return next;
    });
  }, []);

  const increase = useCallback(() => {
    setStepState((prev) => {
      const next = clampTextSizeStep(prev + 1);
      try {
        localStorage.setItem(TEXT_SIZE_STORAGE_KEY, String(next));
      } catch {
        /* ignore */
      }
      applyStepToDocument(next);
      return next;
    });
  }, []);

  const value = useMemo<TextSizeContextValue>(
    () => ({
      step,
      setStep,
      decrease,
      increase,
      canDecrease: step > 0,
      canIncrease: step < TEXT_SIZE_STEP_COUNT - 1,
      label: getLabelForStep(step),
    }),
    [step, setStep, decrease, increase]
  );

  return <TextSizeContext.Provider value={value}>{children}</TextSizeContext.Provider>;
}

export function useTextSize(): TextSizeContextValue {
  const ctx = useContext(TextSizeContext);
  if (!ctx) {
    throw new Error('useTextSize deve ser usado dentro de TextSizeProvider');
  }
  return ctx;
}
