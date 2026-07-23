'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { ReverseStudyGateKey } from '@/lib/slides/transferQuiz';
import { gateKeyLabel } from '@/lib/slides/transferQuiz';

type ReverseStudyCompletionGateValue = {
  requiredKeys: readonly ReverseStudyGateKey[];
  satisfiedKeys: ReadonlySet<ReverseStudyGateKey>;
  satisfy: (key: ReverseStudyGateKey) => void;
  canComplete: boolean;
  pendingLabels: string[];
  gateActive: boolean;
};

const ReverseStudyCompletionGateContext =
  createContext<ReverseStudyCompletionGateValue | null>(null);

export function ReverseStudyCompletionGateProvider({
  requiredKeys,
  children,
}: {
  requiredKeys: readonly ReverseStudyGateKey[];
  children: ReactNode;
}) {
  const [satisfiedKeys, setSatisfiedKeys] = useState<Set<ReverseStudyGateKey>>(
    () => new Set(),
  );

  const requiredKey = requiredKeys.join('|');
  const [syncKey, setSyncKey] = useState(requiredKey);
  if (syncKey !== requiredKey) {
    setSyncKey(requiredKey);
    setSatisfiedKeys(new Set());
  }

  const satisfy = useCallback((key: ReverseStudyGateKey) => {
    setSatisfiedKeys((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }, []);

  const value = useMemo<ReverseStudyCompletionGateValue>(() => {
    const gateActive = requiredKeys.length > 0;
    const canComplete =
      !gateActive || requiredKeys.every((key) => satisfiedKeys.has(key));
    const pendingLabels = requiredKeys
      .filter((key) => !satisfiedKeys.has(key))
      .map(gateKeyLabel);
    return {
      requiredKeys,
      satisfiedKeys,
      satisfy,
      canComplete,
      pendingLabels,
      gateActive,
    };
  }, [requiredKeys, satisfiedKeys, satisfy]);

  return (
    <ReverseStudyCompletionGateContext.Provider value={value}>
      {children}
    </ReverseStudyCompletionGateContext.Provider>
  );
}

export function useReverseStudyCompletionGate(): ReverseStudyCompletionGateValue {
  const ctx = useContext(ReverseStudyCompletionGateContext);
  if (!ctx) {
    return {
      requiredKeys: [],
      satisfiedKeys: new Set(),
      satisfy: () => undefined,
      canComplete: true,
      pendingLabels: [],
      gateActive: false,
    };
  }
  return ctx;
}
