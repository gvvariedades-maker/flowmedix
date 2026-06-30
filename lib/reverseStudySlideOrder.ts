import type { SlideType } from '@/types/lesson';

/** Ordem legada (JSON histórico pré-2026-06). */
export const REVERSE_STUDY_SLIDE_ORDER_LEGACY: readonly SlideType[] = [
  'concept_map',
  'golden_rule',
  'logic_flow',
  'danger_zone',
];

/**
 * Ordem canônica (v2): enquadra → elabora → sintetiza → consolida.
 * Padrão do player e ordem do array em JSON novo/handcraft.
 * @see docs/PLAYBOOK_ESTUDO_REVERSO_PREMIUM.md §2
 */
export const REVERSE_STUDY_SLIDE_ORDER_V2: readonly SlideType[] = [
  'concept_map',
  'logic_flow',
  'golden_rule',
  'danger_zone',
];

export type ReverseStudySlideOrderProfile = 'legacy' | 'v2';

const PROFILE_VALUES: readonly ReverseStudySlideOrderProfile[] = ['legacy', 'v2'];

export function isReverseStudySlideOrderProfile(
  value: string | undefined | null,
): value is ReverseStudySlideOrderProfile {
  return value != null && (PROFILE_VALUES as readonly string[]).includes(value);
}

/** Alias da ordem canônica para builders e normalização. */
export const REVERSE_STUDY_SLIDE_ORDER_CANONICAL = REVERSE_STUDY_SLIDE_ORDER_V2;

/** Lê perfil da env `NEXT_PUBLIC_REVERSE_STUDY_SLIDE_ORDER` (`legacy` força ordem antiga; omitido = v2). */
export function getReverseStudySlideOrderProfile(
  rawEnv: string | undefined = process.env.NEXT_PUBLIC_REVERSE_STUDY_SLIDE_ORDER,
): ReverseStudySlideOrderProfile {
  const normalized = rawEnv?.trim().toLowerCase();
  return normalized === 'legacy' ? 'legacy' : 'v2';
}

export function getReverseStudySlideOrder(
  profile: ReverseStudySlideOrderProfile = getReverseStudySlideOrderProfile(),
): readonly SlideType[] {
  return profile === 'v2' ? REVERSE_STUDY_SLIDE_ORDER_V2 : REVERSE_STUDY_SLIDE_ORDER_LEGACY;
}

/**
 * Reordena slides pelo `type`; tipos desconhecidos vão ao final (ordem relativa estável).
 */
export function sortReverseStudySlides<T extends { type?: string }>(
  slides: T[],
  profile: ReverseStudySlideOrderProfile = getReverseStudySlideOrderProfile(),
): T[] {
  if (slides.length <= 1) return [...slides];

  const order = getReverseStudySlideOrder(profile);
  const rank = new Map<string, number>(order.map((type, index) => [type, index]));

  return [...slides]
    .map((slide, index) => ({ slide, index }))
    .sort((a, b) => {
      const ra = rank.get(a.slide.type ?? '') ?? 999;
      const rb = rank.get(b.slide.type ?? '') ?? 999;
      if (ra !== rb) return ra - rb;
      return a.index - b.index;
    })
    .map(({ slide }) => slide);
}
