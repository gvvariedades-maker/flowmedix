'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

const STORAGE_PREFIX = 'avant.microtip.';

function storageKeyFor(key: string) {
  return `${STORAGE_PREFIX}${key}`;
}

function wasSeen(key: string): boolean {
  try {
    return window.localStorage.getItem(storageKeyFor(key)) === 'true';
  } catch {
    return false;
  }
}

function persistSeen(key: string) {
  try {
    window.localStorage.setItem(storageKeyFor(key), 'true');
  } catch {
    // LocalStorage pode estar bloqueado; o fechamento ainda vale na sessão atual.
  }
}

export function useFirstSeen(key: string, enabled = true) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const id = window.requestAnimationFrame(() => {
      if (!wasSeen(key)) setVisible(true);
    });
    return () => window.cancelAnimationFrame(id);
  }, [enabled, key]);

  const markSeen = useCallback(() => {
    persistSeen(key);
    setVisible(false);
  }, [key]);

  return useMemo(
    () => ({
      visible,
      markSeen,
    }),
    [markSeen, visible],
  );
}
