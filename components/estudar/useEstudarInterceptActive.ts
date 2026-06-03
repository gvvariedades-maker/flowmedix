'use client';

import { useSelectedLayoutSegment } from 'next/navigation';
import { useDashboardDesktop } from '@/lib/layout/useDashboardDesktop';

/** Soft navigation vitrine → questão via @modal (somente mobile; desktop usa shell normal). */
export function useEstudarInterceptActive(): boolean {
  const isDesktop = useDashboardDesktop();
  const modalSegment = useSelectedLayoutSegment('modal');

  if (isDesktop) return false;
  return modalSegment != null;
}
