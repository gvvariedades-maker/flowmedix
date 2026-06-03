'use client';

import { usePathname, useSelectedLayoutSegment } from 'next/navigation';
import { isEstudarModalRouteEnabled } from '@/lib/estudar/estudarL0Config';
import { parseEstudarSlugFromPathname } from '@/lib/estudar/navigation';
import { useDashboardDesktop } from '@/lib/layout/useDashboardDesktop';

/** True quando @modal intercepta vitrine → questão no mobile e a feature flag está ativa. */
export function useEstudarModalActive(): boolean {
  const isDesktop = useDashboardDesktop();
  const pathname = usePathname();
  const modalSegment = useSelectedLayoutSegment('modal');

  if (!isEstudarModalRouteEnabled() || isDesktop) return false;
  if (parseEstudarSlugFromPathname(pathname) === null) return false;
  return modalSegment != null;
}
