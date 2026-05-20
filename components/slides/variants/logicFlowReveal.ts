'use client';

import { useCallback, useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

export type LogicFlowRevealMode = 'auto' | 'tap';

/**
 * Default `auto` preserva slides legados sem o campo; premium usa `reveal_mode: "tap"` explícito no JSON.
 */
export function useLogicFlowReveal(
  stepCount: number,
  revealMode: LogicFlowRevealMode = 'auto',
) {
  const prefersReducedMotion = useReducedMotion();
  const [revealedSteps, setRevealedSteps] = useState<number[]>([]);

  const effectiveMode: LogicFlowRevealMode =
    prefersReducedMotion || revealMode !== 'tap' ? 'auto' : 'tap';

  useEffect(() => {
    setRevealedSteps([]);
    if (stepCount === 0) return;

    if (effectiveMode === 'tap') {
      setRevealedSteps([0]);
      return;
    }

    if (prefersReducedMotion) {
      setRevealedSteps(Array.from({ length: stepCount }, (_, i) => i));
      return;
    }

    let cancelled = false;
    const revealSequence = async () => {
      for (let i = 0; i < stepCount; i++) {
        await new Promise((resolve) => setTimeout(resolve, 600));
        if (cancelled) return;
        setRevealedSteps((prev) => [...prev, i]);
      }
    };
    revealSequence();

    return () => {
      cancelled = true;
    };
  }, [stepCount, effectiveMode, prefersReducedMotion]);

  const advanceStep = useCallback(() => {
    if (effectiveMode !== 'tap') return;
    setRevealedSteps((prev) => {
      const last = prev.length > 0 ? prev[prev.length - 1]! : -1;
      const next = last + 1;
      if (next >= stepCount) return prev;
      return [...prev, next];
    });
  }, [effectiveMode, stepCount]);

  const isTapMode = effectiveMode === 'tap';
  const isComplete = stepCount > 0 && revealedSteps.length >= stepCount;
  const currentPasso = revealedSteps.length;

  return {
    revealedSteps,
    advanceStep,
    isTapMode,
    isComplete,
    currentPasso,
  };
}

export function isStepRevealed(index: number, revealedSteps: number[]) {
  return revealedSteps.includes(index);
}

export function isStepFuture(index: number, revealedSteps: number[]) {
  if (revealedSteps.length === 0) return index > 0;
  const last = revealedSteps[revealedSteps.length - 1]!;
  return index > last;
}

export function isStepActive(index: number, revealedSteps: number[], isTapMode: boolean) {
  if (!isTapMode || revealedSteps.length === 0) return false;
  return index === revealedSteps[revealedSteps.length - 1];
}
