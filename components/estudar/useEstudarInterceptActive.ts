'use client';

import { useSelectedLayoutSegment } from 'next/navigation';

/** Soft navigation vitrine → questão via parallel route @modal (independe da feature flag). */
export function useEstudarInterceptActive(): boolean {
  return useSelectedLayoutSegment('modal') != null;
}
