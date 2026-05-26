'use client';

import { useLayoutEffect, useMemo } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import AvantLessonPlayer from '@/components/lesson/AvantLessonPlayer';
import { useQuestaoNavigation } from '@/components/lesson/questao-navigation-context';
import type { EstudarQuestaoPayload } from '@/components/lesson/questao-navigation-context';
import { buildEstudarCacheKey } from '@/lib/estudar/navigation';
import { stripQuestionAnswersForClient } from '@/lib/estudar/questionPayload';
import type { AvantLessonPlayerProps } from '@/types/lesson';

export type EstudarQuestaoHydratorProps = AvantLessonPlayerProps;

export default function EstudarQuestaoHydrator(props: EstudarQuestaoHydratorProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { cachePayload } = useQuestaoNavigation();

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
    cachePayload(cacheKey, playerProps as EstudarQuestaoPayload);
  }, [cacheKey, cachePayload, playerProps]);

  return <AvantLessonPlayer {...playerProps} />;
}
