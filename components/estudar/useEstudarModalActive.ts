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
  if (parseEstudarSlugFromPathname(pathname) === null) return false;
  // DashboardShell fica acima do slot @modal — bridge preenchido por EstudarQuestaoModalRoute.
  if (overlayOpen) return true;
  return modalSegment != null;
}
