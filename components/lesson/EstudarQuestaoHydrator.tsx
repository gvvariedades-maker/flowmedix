'use client';

import { useLayoutEffect } from 'react';
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
  const { cachePayload } = useQuestaoNavigation();

  const cacheKey = buildEstudarCacheKey(pathname, searchParams);

  useLayoutEffect(() => {
    cachePayload(cacheKey, props as EstudarQuestaoPayload);
  }, [cacheKey, cachePayload, props]);

  return <AvantLessonPlayer {...props} />;
}
