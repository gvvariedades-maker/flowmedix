'use client';

import { useCallback, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import type { LogicFlowRevealMode } from './logicFlowReveal';

export function useDangerZoneCompareReveal(
  itemCount: number,
  revealMode: LogicFlowRevealMode = 'auto',
) {
  const prefersReducedMotion = useReducedMotion();
  const [tapRevealedIndices, setTapRevealedIndices] = useState<Set<number>>(() => new Set());
  const [tapSyncKey, setTapSyncKey] = useState({ itemCount, revealMode });

  const effectiveMode: LogicFlowRevealMode =
    prefersReducedMotion || revealMode !== 'tap' ? 'auto' : 'tap';

  if (
    effectiveMode === 'tap' &&
    (tapSyncKey.itemCount !== itemCount || tapSyncKey.revealMode !== effectiveMode)
  ) {
    setTapSyncKey({ itemCount, revealMode: effectiveMode });
    setTapRevealedIndices(new Set());
  }

  const revealItem = useCallback(
    (index: number) => {
      if (effectiveMode !== 'tap') return;
      setTapRevealedIndices((prev) => {
        const next = new Set(prev);
        next.add(index);
        return next;
      });
    },
    [effectiveMode],
  );

  const isItemRevealed = useCallback(
    (index: number) => effectiveMode === 'auto' || tapRevealedIndices.has(index),
    [effectiveMode, tapRevealedIndices],
  );

  return {
    revealItem,
    isItemRevealed,
    isTapMode: effectiveMode === 'tap',
  };
}
