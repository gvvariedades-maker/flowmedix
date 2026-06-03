'use client';

import { useSelectedLayoutSegment } from 'next/navigation';

/** True quando a parallel route @modal intercepta vitrine → questão (fase 11.2). */
export function useEstudarModalActive(): boolean {
  const modalSegment = useSelectedLayoutSegment('modal');
  return modalSegment != null;
}
