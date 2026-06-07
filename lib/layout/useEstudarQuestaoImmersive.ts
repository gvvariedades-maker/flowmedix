'use client';

import { usePathname } from 'next/navigation';
import { parseEstudarSlugFromPathname } from '@/lib/estudar/navigation';
import { useDashboardDesktop } from '@/lib/layout/useDashboardDesktop';

/**
 * True no mobile quando o aluno está em `/estudar/[slug]` (player inline no shell).
 * Usado para ocultar header global + BottomNav e ajustar offset do estudo reverso.
 */
export function useEstudarQuestaoImmersive(): boolean {
  const pathname = usePathname();
  const isDashboardDesktop = useDashboardDesktop();

  if (isDashboardDesktop) return false;
  return parseEstudarSlugFromPathname(pathname) !== null;
}
