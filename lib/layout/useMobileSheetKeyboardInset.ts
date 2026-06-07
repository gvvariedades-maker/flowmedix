'use client';

import { useSyncExternalStore } from 'react';

function subscribeKeyboardInset(active: boolean, onStoreChange: () => void): () => void {
  if (!active || typeof window === 'undefined') return () => {};

  const vv = window.visualViewport;
  if (!vv) return () => {};

  vv.addEventListener('resize', onStoreChange);
  vv.addEventListener('scroll', onStoreChange);
  return () => {
    vv.removeEventListener('resize', onStoreChange);
    vv.removeEventListener('scroll', onStoreChange);
  };
}

function getKeyboardInsetSnapshot(active: boolean): number {
  if (!active || typeof window === 'undefined') return 0;

  const vv = window.visualViewport;
  if (!vv) return 0;

  return Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
}

/**
 * Inset inferior (px) quando o teclado virtual reduz o visualViewport — sheets mobile com busca.
 */
export function useMobileSheetKeyboardInset(active: boolean): number {
  return useSyncExternalStore(
    (onStoreChange) => subscribeKeyboardInset(active, onStoreChange),
    () => getKeyboardInsetSnapshot(active),
    () => 0,
  );
}
