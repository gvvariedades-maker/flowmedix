'use client';

import { useLayoutEffect, useMemo } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useQuestaoNavigation } from '@/components/lesson/questao-navigation-context';
import type { EstudarQuestaoPayload } from '@/components/lesson/questao-navigation-context';
import { buildEstudarCacheKey, parseEstudarSlugFromPathname } from '@/lib/estudar/navigation';
import { buildPayloadCacheKey, payloadMatchesCacheKey } from '@/lib/estudar/payloadRouteMatch';
import { recordHydratorSync } from '@/lib/estudar/navigationTelemetry';
import { stripQuestionAnswersForClient } from '@/lib/estudar/questionPayload';
import type { AvantLessonPlayerProps } from '@/types/lesson';

export type EstudarQuestaoHydratorProps = AvantLessonPlayerProps;

export default function EstudarQuestaoHydrator(props: EstudarQuestaoHydratorProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { cachePayload, setDisplayPayload, displayPayload, estudarRoute, isDismissingToVitrine } =
    useQuestaoNavigation();

  const routeCacheKey = buildEstudarCacheKey(pathname, searchParams);

  const dados = useMemo(
    () =>
      props.mode === 'preview' ? props.dados : stripQuestionAnswersForClient(props.dados),
    [props.mode, props.dados],
  );

  const playerProps = useMemo(
    (): EstudarQuestaoHydratorProps => ({ ...props, dados }),
    [props, dados],
  );

  useLayoutEffect(() => {
    const payload = playerProps as EstudarQuestaoPayload;
    const payloadKey = buildPayloadCacheKey(payload);

    // Só associa à chave da URL se o suffix do payload casar (evita veneno IDB/LRU).
    if (payloadKey && payloadMatchesCacheKey(payload, routeCacheKey)) {
      cachePayload(routeCacheKey, payload);
      recordHydratorSync(routeCacheKey, props.moduloSlug ?? undefined);
    } else if (payloadKey) {
      cachePayload(payloadKey, payload);
      recordHydratorSync(payloadKey, props.moduloSlug ?? undefined);
    }

    if (isDismissingToVitrine) return;

    // Navegação client-side já atualizou displayPayload; evita 2º render ao hidratar o RSC.
    if (displayPayload?.moduloSlug === props.moduloSlug) return;

    const effectivePathname = estudarRoute?.pathname ?? pathname;
    const routeSlug = parseEstudarSlugFromPathname(effectivePathname);
    if (routeSlug && routeSlug !== props.moduloSlug) return;

    setDisplayPayload(payload);
  }, [
    routeCacheKey,
    cachePayload,
    setDisplayPayload,
    playerProps,
    props.moduloSlug,
    displayPayload?.moduloSlug,
    estudarRoute?.pathname,
    pathname,
    isDismissingToVitrine,
  ]);

  return null;
}
