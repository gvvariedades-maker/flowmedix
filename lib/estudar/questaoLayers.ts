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
export const SLIDES_LAYER_LOAD_ERROR_MESSAGE =
  'Não foi possível carregar o material de estudo reverso. Verifique sua conexão e tente de novo.';

export const SLIDES_LAYER_SESSION_ERROR_MESSAGE =
  'Sessão expirada. Faça login novamente para carregar o estudo reverso.';

export const SLIDES_LAYER_FORBIDDEN_ERROR_MESSAGE =
  'Sem acesso ao material desta questão.';

export const SLIDES_LAYER_FALLBACK_BANNER =
  'Material completo indisponível — exibindo resumo da questão';

export function slidesLayerErrorMessage(httpStatus: number): string {
  if (httpStatus === 401) return SLIDES_LAYER_SESSION_ERROR_MESSAGE;
  if (httpStatus === 403) return SLIDES_LAYER_FORBIDDEN_ERROR_MESSAGE;
  return SLIDES_LAYER_LOAD_ERROR_MESSAGE;
}

export type FetchLessonSlidesLayerResult =
  | { status: 'success'; dados: LessonData }
  | { status: 'empty' }
  | { status: 'http_error'; httpStatus: number }
  | { status: 'network_error' };

/** Busca `layers=full` e valida presença de NeuroSlides no payload. */
export async function fetchLessonSlidesLayer(
  apiUrl: string,
  fetchFn: (url: string) => Promise<Response>,
): Promise<FetchLessonSlidesLayerResult> {
  try {
    const res = await fetchFn(apiUrl);
    if (!res.ok) {
      return { status: 'http_error', httpStatus: res.status };
    }
    const payload = (await res.json()) as { dados?: LessonData };
    const fullDados = payload.dados;
    if (!fullDados || !lessonDataHasSlides(fullDados)) {
      return { status: 'empty' };
    }
    return { status: 'success', dados: fullDados };
  } catch {
    return { status: 'network_error' };
  }
}

export function buildEstudarSlugComQueryFromPlayerProps(
  props: Pick<
    AvantLessonPlayerProps,
    'moduloSlug' | 'fromCaderno' | 'vitrineQuerySuffix'
  >,
): string | null {
  const slug = props.moduloSlug?.trim();
  if (!slug) return null;
  if (props.fromCaderno) {
    return `${slug}?from=caderno&caderno_id=${encodeURIComponent(props.fromCaderno)}`;
  }
  const suffix = props.vitrineQuerySuffix?.trim() ?? '';
  if (!suffix) return slug;
  return suffix.startsWith('?') ? `${slug}${suffix}` : `${slug}?${suffix}`;
}
