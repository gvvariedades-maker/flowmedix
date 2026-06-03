'use client';

import { useSelectedLayoutSegment } from 'next/navigation';
import { isEstudarModalRouteEnabled } from '@/lib/estudar/estudarL0Config';

/** True quando @modal intercepta vitrine → questão e a feature flag está ativa. */
export function useEstudarModalActive(): boolean {
  if (!isEstudarModalRouteEnabled()) return false;
  const modalSegment = useSelectedLayoutSegment('modal');
  return modalSegment != null;
}
