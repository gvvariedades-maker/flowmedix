import type { LessonData } from '@/types/lesson';
import type { AvantLessonPlayerProps } from '@/types/lesson';

export type EstudarQuestaoLayers = 'core' | 'full';

export const ESTUDAR_QUESTAO_LAYERS_DEFAULT: EstudarQuestaoLayers = 'full';

/** Payload de prefetch/navegação rápida: enunciado + nav, sem NeuroSlides. */
export function stripSlidesForCoreLayer<T extends LessonData>(dados: T): T {
  const { reverse_study_slides, study_slides, ...rest } = dados as T & {
    reverse_study_slides?: unknown;
    study_slides?: unknown;
  };
  return rest as T;
}

export function lessonDataHasSlides(dados: LessonData): boolean {
  const reverse = dados.reverse_study_slides;
  const study = dados.study_slides;
  return (
    (Array.isArray(reverse) && reverse.length > 0) ||
    (Array.isArray(study) && study.length > 0)
  );
}

export function mergeSlidesIntoLessonData<T extends LessonData>(
  base: T,
  source: LessonData,
): T {
  if (!lessonDataHasSlides(source)) return base;
  return {
    ...base,
    reverse_study_slides: source.reverse_study_slides,
    study_slides: source.study_slides,
  };
}

/** Monta `slugComQuery` para API a partir das props do player. */
export function buildEstudarSlugComQueryFromPlayerProps(
  props: Pick<
    AvantLessonPlayerProps,
    'moduloSlug' | 'fromPlano' | 'fromCaderno' | 'vitrineQuerySuffix'
  >,
): string | null {
  const slug = props.moduloSlug?.trim();
  if (!slug) return null;
  if (props.fromPlano) return `${slug}?from=plano`;
  if (props.fromCaderno) {
    return `${slug}?from=caderno&caderno_id=${encodeURIComponent(props.fromCaderno)}`;
  }
  const suffix = props.vitrineQuerySuffix?.trim() ?? '';
  if (!suffix) return slug;
  return suffix.startsWith('?') ? `${slug}${suffix}` : `${slug}?${suffix}`;
}
