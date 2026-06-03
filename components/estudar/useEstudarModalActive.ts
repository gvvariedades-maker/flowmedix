'use client';

import { useSelectedLayoutSegment } from 'next/navigation';
import { isEstudarModalRouteEnabled } from '@/lib/estudar/estudarL0Config';
import { useDashboardDesktop } from '@/lib/layout/useDashboardDesktop';

/** True quando @modal intercepta vitrine → questão no mobile e a feature flag está ativa. */
export function useEstudarModalActive(): boolean {
  const isDesktop = useDashboardDesktop();
  const modalSegment = useSelectedLayoutSegment('modal');

  if (!isEstudarModalRouteEnabled() || isDesktop) return false;
  return modalSegment != null;
}
