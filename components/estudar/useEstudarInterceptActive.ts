'use client';

import { usePathname, useSelectedLayoutSegment } from 'next/navigation';
import { parseEstudarSlugFromPathname } from '@/lib/estudar/navigation';
import { useDashboardDesktop } from '@/lib/layout/useDashboardDesktop';

/** Soft navigation vitrine → questão via @modal (somente mobile; desktop usa shell normal). */
export function useEstudarInterceptActive(): boolean {
  const isDesktop = useDashboardDesktop();
  const pathname = usePathname();
  const modalSegment = useSelectedLayoutSegment('modal');

  if (isDesktop) return false;
  if (parseEstudarSlugFromPathname(pathname) === null) return false;
  return modalSegment != null;
}
