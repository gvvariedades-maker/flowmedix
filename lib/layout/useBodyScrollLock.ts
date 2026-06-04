'use client';

import { useEffect } from 'react';

let lockCount = 0;
let savedOverflow: string | null = null;
let savedTouchAction: string | null = null;

/** Bloqueia scroll do `document.body` (refcount — vários overlays podem empilhar). */
export function lockBodyScroll(): void {
  if (typeof document === 'undefined') return;
  lockCount += 1;
  if (lockCount === 1) {
    savedOverflow = document.body.style.overflow;
    savedTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
  }
}

/** Libera um lock; restaura overflow quando o contador chega a zero. */
export function unlockBodyScroll(): void {
  if (typeof document === 'undefined') return;
  if (lockCount <= 0) return;
  lockCount -= 1;
  if (lockCount === 0) {
    document.body.style.overflow = savedOverflow ?? '';
    document.body.style.touchAction = savedTouchAction ?? '';
    savedOverflow = null;
    savedTouchAction = null;
  }
}

/** Reseta estado (apenas testes). */
export function resetBodyScrollLockForTests(): void {
  lockCount = 0;
  savedOverflow = null;
  savedTouchAction = null;
  if (typeof document !== 'undefined') {
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
  }
}

/** Aplica body scroll lock enquanto `active` for true. */
export function useBodyScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    lockBodyScroll();
    return () => unlockBodyScroll();
  }, [active]);
}
