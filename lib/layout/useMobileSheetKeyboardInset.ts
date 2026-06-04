'use client';

import { useEffect, useState } from 'react';

/**
 * Inset inferior (px) quando o teclado virtual reduz o visualViewport — sheets mobile com busca.
 */
export function useMobileSheetKeyboardInset(active: boolean): number {
  const [insetPx, setInsetPx] = useState(0);

  useEffect(() => {
    if (!active || typeof window === 'undefined') {
      setInsetPx(0);
      return;
    }

    const vv = window.visualViewport;
    if (!vv) return;

    const sync = () => {
      setInsetPx(Math.max(0, window.innerHeight - vv.height - vv.offsetTop));
    };

    sync();
    vv.addEventListener('resize', sync);
    vv.addEventListener('scroll', sync);
    return () => {
      vv.removeEventListener('resize', sync);
      vv.removeEventListener('scroll', sync);
      setInsetPx(0);
    };
  }, [active]);

  return insetPx;
}
