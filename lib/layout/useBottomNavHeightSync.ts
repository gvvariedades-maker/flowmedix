'use client';

import { type RefObject, useEffect } from 'react';

const BOTTOM_NAV_HEIGHT_VAR = '--bottom-nav-height';

/** Observa a altura real do BottomNav e sincroniza `--bottom-nav-height` no `:root`. */
export function useBottomNavHeightSync(
  navRef: RefObject<HTMLElement | null>,
  enabled = true,
): void {
  useEffect(() => {
    if (!enabled) return;
    const el = navRef.current;
    if (!el) return;

    const apply = () => {
      const height = el.offsetHeight;
      if (height > 0) {
        document.documentElement.style.setProperty(BOTTOM_NAV_HEIGHT_VAR, `${height}px`);
      }
    };

    apply();

    const ro = new ResizeObserver(() => apply());
    ro.observe(el);

    return () => {
      ro.disconnect();
      document.documentElement.style.removeProperty(BOTTOM_NAV_HEIGHT_VAR);
    };
  }, [navRef, enabled]);
}
