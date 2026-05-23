'use client';

import { useEffect, useLayoutEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import AvantLessonPlayer from '@/components/lesson/AvantLessonPlayer';
import { useQuestaoNavigation } from '@/components/lesson/questao-navigation-context';
import type { EstudarQuestaoPayload } from '@/components/lesson/questao-navigation-context';
import { buildEstudarCacheKey } from '@/lib/estudar/navigation';
import type { AvantLessonPlayerProps } from '@/types/lesson';

export type EstudarQuestaoHydratorProps = AvantLessonPlayerProps;

export default function EstudarQuestaoHydrator(props: EstudarQuestaoHydratorProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { cachePayload, confirmServerArrival, pendingTargetKey, isOverlayActive } =
    useQuestaoNavigation();

  const cacheKey = buildEstudarCacheKey(pathname, searchParams);
  const payload: EstudarQuestaoPayload = props;

  useLayoutEffect(() => {
    cachePayload(cacheKey, payload);
  }, [
    cacheKey,
    cachePayload,
    payload.dados,
    payload.moduloSlug,
    payload.proximaSlug,
    payload.anteriorSlug,
    payload.questoesDoAssunto,
    payload.listaContexto,
    payload.avantCodigo,
    payload.fromPlano,
    payload.fromCaderno,
    payload.vitrineQuerySuffix,
  ]);

  useEffect(() => {
    confirmServerArrival(cacheKey);
  }, [cacheKey, confirmServerArrival]);

  if (isOverlayActive && pendingTargetKey !== null && pendingTargetKey !== cacheKey) {
    return null;
  }

  return <AvantLessonPlayer {...props} />;
}
