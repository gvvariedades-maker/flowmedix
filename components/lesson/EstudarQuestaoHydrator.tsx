'use client';

import { useLayoutEffect, useMemo } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useQuestaoNavigation } from '@/components/lesson/questao-navigation-context';
import type { EstudarQuestaoPayload } from '@/components/lesson/questao-navigation-context';
import { buildEstudarCacheKey } from '@/lib/estudar/navigation';
import { recordHydratorSync } from '@/lib/estudar/navigationTelemetry';
import { stripQuestionAnswersForClient } from '@/lib/estudar/questionPayload';
import type { AvantLessonPlayerProps } from '@/types/lesson';

export type EstudarQuestaoHydratorProps = AvantLessonPlayerProps;

export default function EstudarQuestaoHydrator(props: EstudarQuestaoHydratorProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { cachePayload, setDisplayPayload } = useQuestaoNavigation();

  const cacheKey = buildEstudarCacheKey(pathname, searchParams);

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
    setDisplayPayload(payload);
    cachePayload(cacheKey, payload);
    recordHydratorSync(cacheKey, props.moduloSlug);
  }, [cacheKey, cachePayload, setDisplayPayload, playerProps, props.moduloSlug]);

  return null;
}
