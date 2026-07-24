'use client';

import { useSyncExternalStore } from 'react';
import { usePathname, useSelectedLayoutSegment } from 'next/navigation';
import { isEstudarModalRouteEnabled } from '@/lib/estudar/estudarL0Config';
import {
  getEstudarModalOverlayOpen,
  subscribeEstudarModalOverlayOpen,
} from '@/lib/estudar/estudarModalOpenBridge';
import { parseEstudarSlugFromPathname } from '@/lib/estudar/navigation';
import { useDashboardDesktop } from '@/lib/layout/useDashboardDesktop';

/** True quando @modal intercepta vitrine → questão no mobile e a feature flag está ativa. */
export function useEstudarModalActive(): boolean {
  const overlayOpen = useSyncExternalStore(
    subscribeEstudarModalOverlayOpen,
    getEstudarModalOverlayOpen,
    () => false,
  );
  const isDesktop = useDashboardDesktop();
  const pathname = usePathname();
  const modalSegment = useSelectedLayoutSegment('modal');

  if (!isEstudarModalRouteEnabled() || isDesktop) return false;
  // Overlay na vitrine: pathname pode ser /estudar sem slug — bridge é fonte de verdade.
  if (overlayOpen) return true;
  if (parseEstudarSlugFromPathname(pathname) === null) return false;
  return modalSegment != null;
}
