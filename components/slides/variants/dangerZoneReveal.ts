'use client';

import { useCallback, useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import type { LogicFlowRevealMode } from './logicFlowReveal';

export function useDangerZoneCompareReveal(
  itemCount: number,
  revealMode: LogicFlowRevealMode = 'auto',
) {
  const prefersReducedMotion = useReducedMotion();
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(() => new Set());

  const effectiveMode: LogicFlowRevealMode =
    prefersReducedMotion || revealMode !== 'tap' ? 'auto' : 'tap';

  useEffect(() => {
    if (effectiveMode === 'auto') {
      setRevealedIndices(new Set(Array.from({ length: itemCount }, (_, i) => i)));
      return;
    }
    setRevealedIndices(new Set());
  }, [itemCount, effectiveMode]);

  const revealItem = useCallback(
    (index: number) => {
      if (effectiveMode !== 'tap') return;
      setRevealedIndices((prev) => {
        const next = new Set(prev);
        next.add(index);
        return next;
      });
    },
    [effectiveMode],
  );

  const isItemRevealed = useCallback(
    (index: number) => effectiveMode === 'auto' || revealedIndices.has(index),
    [effectiveMode, revealedIndices],
  );

  return {
    revealItem,
    isItemRevealed,
    isTapMode: effectiveMode === 'tap',
  };
}
