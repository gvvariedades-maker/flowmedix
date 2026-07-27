/**
 * Hook React para EE-I01 — liga visibility + ciclo de vida da questão.
 */

'use client';

import { useCallback, useEffect, useRef } from 'react';
import {
  createPassiveAttemptTracker,
  type BeginConfirmOptions,
  type PassiveAttemptConfirmPayload,
  type PassiveAttemptTracker,
} from '@/lib/evidence/passiveAttemptTracker';

export type UsePassiveAttemptTrackerArgs = {
  /** Muda quando a questão exposta muda (slug / session item). */
  questionKey: string;
  /** Quando false, não anexa listeners (ex.: preview). Default true. */
  enabled?: boolean;
};

export function usePassiveAttemptTracker(args: UsePassiveAttemptTrackerArgs) {
  const enabled = args.enabled !== false;
  const trackerRef = useRef<PassiveAttemptTracker | null>(null);

  if (trackerRef.current === null) {
    trackerRef.current = createPassiveAttemptTracker();
  }

  useEffect(() => {
    if (!enabled) return;
    trackerRef.current?.resetForNewQuestion();
  }, [args.questionKey, enabled]);

  useEffect(() => {
    if (!enabled || typeof document === 'undefined') return;

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        trackerRef.current?.noteVisibilityHidden();
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [enabled]);

  const noteSelectionChange = useCallback(() => {
    if (!enabled) return;
    trackerRef.current?.noteSelectionChange();
  }, [enabled]);

  const beginConfirm = useCallback(
    (opts?: BeginConfirmOptions): PassiveAttemptConfirmPayload | null => {
      if (!enabled) return null;
      return trackerRef.current?.beginConfirm(opts) ?? null;
    },
    [enabled],
  );

  const clearPendingAfterSuccess = useCallback(() => {
    trackerRef.current?.clearPendingAfterSuccess();
  }, []);

  return {
    noteSelectionChange,
    beginConfirm,
    clearPendingAfterSuccess,
  };
}
