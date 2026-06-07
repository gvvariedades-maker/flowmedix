'use client';

import { useSyncExternalStore } from 'react';

function subscribe(): () => void {
  return () => {};
}

/** True no browser após hidratação; false no SSR — sem setState em effect. */
export function useClientMounted(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
