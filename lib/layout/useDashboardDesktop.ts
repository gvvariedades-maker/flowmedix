'use client';

import { useEffect, useState } from 'react';

/** Alinhado ao breakpoint `md` do Tailwind (sidebar fixa no dashboard). */
export const DASHBOARD_DESKTOP_MEDIA_QUERY = '(min-width: 768px)';

/**
 * True em viewport desktop do dashboard (≥ md).
 * Default false no SSR/primeiro paint — evita flash de overlay mobile no desktop.
 */
export function useDashboardDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(DASHBOARD_DESKTOP_MEDIA_QUERY);
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return isDesktop;
}
