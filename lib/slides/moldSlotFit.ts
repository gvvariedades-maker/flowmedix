/**
 * Conta slots interativos de moldes bespoke — evita UI 0/0 no player.
 */
import { inferAdolescentCurtain, type AdolescentCurtain } from '@/lib/slides/adolescentSlideUtils';
import {
  inferZRailSlot,
  ADOLESCENT_Z_SCORE_POSITIVE,
} from '@/lib/slides/adolescentAntropometriaSlideUtils';
import {
  collectSlideTextCorpus,
  isBespokeLayoutVariant,
  type MoldAffinitySlide,
} from '@/lib/slides/moldAffinity';
import { conceptItemsFromSlide, countAdmeJourneyRailPkSlots } from '@/lib/slides/admeJourneyRailUtils';

const ADOLESCENT_CURTAIN_SLOTS: AdolescentCurtain[] = [
  'escuta',
  'sigilo',
  'acompanhamento',
  'prevencao',
];

function conceptItems(slide: MoldAffinitySlide): { title: string; description: string }[] {
  const raw = slide.items ?? slide.concepts;
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
    .map((item) => ({
      title: String(item.label ?? item.title ?? ''),
      description: String(item.detail ?? item.description ?? ''),
    }))
    .filter((c) => c.title.trim().length > 0 || c.description.trim().length > 0);
}

function countAdolescentPrivacyCurtainSlots(slide: MoldAffinitySlide): number {
  const curtains = new Set<AdolescentCurtain>();
  for (const concept of conceptItems(slide)) {
    const curtain = inferAdolescentCurtain(`${concept.title} ${concept.description}`);
    if (curtain !== 'geral') curtains.add(curtain);
  }
  return ADOLESCENT_CURTAIN_SLOTS.filter((c) => curtains.has(c)).length;
}

function countAdolescentZScoreSignals(slide: MoldAffinitySlide): number {
  const corpus = collectSlideTextCorpus(slide);
  if (!corpus.trim()) return 0;
  return ADOLESCENT_Z_SCORE_POSITIVE.filter((p) => p.test(corpus)).length;
}

function countAdolescentGrowthZRailSlots(slide: MoldAffinitySlide): number {
  const slots = new Set(
    conceptItems(slide).map((c) => inferZRailSlot(c.title, c.description)),
  );
  slots.delete('general');
  return slots.size > 0 ? slots.size : countAdolescentZScoreSignals(slide) > 0 ? 1 : 0;
}

function countAdolescentZBandBoardSlots(slide: MoldAffinitySlide): number {
  const rows = Array.isArray(slide.rows) ? slide.rows.length : 0;
  if (rows > 0) return rows;
  return countAdolescentZScoreSignals(slide) > 0 ? 1 : 0;
}

function countAdolescentZClassifyTapSlots(slide: MoldAffinitySlide): number {
  return Array.isArray(slide.steps) ? slide.steps.length : 0;
}

function countAdolescentZThresholdTrapSlots(slide: MoldAffinitySlide): number {
  const items = slide.items;
  return Array.isArray(items) ? items.filter(Boolean).length : 0;
}

function countAdolescentSigiloSpectrumSlots(slide: MoldAffinitySlide): number {
  const corpus = collectSlideTextCorpus(slide);
  if (!corpus.trim()) return 0;
  const rows = Array.isArray(slide.rows) ? slide.rows.length : 0;
  return rows > 0 ? rows : corpus.length > 20 ? 1 : 0;
}

function countGenericInteractiveSlots(slide: MoldAffinitySlide): number {
  switch (slide.type) {
    case 'concept_map':
      return conceptItems(slide).length;
    case 'golden_rule':
      return Array.isArray(slide.rows) && slide.rows.length > 0 ? slide.rows.length : slide.content ? 1 : 0;
    case 'logic_flow':
      return Array.isArray(slide.steps) ? slide.steps.length : 0;
    case 'danger_zone': {
      const items = slide.items;
      return Array.isArray(items) ? items.length : 0;
    }
    default:
      return collectSlideTextCorpus(slide).trim() ? 1 : 0;
  }
}

/**
 * Número de slots que o molde consegue renderizar de forma interativa.
 * 0 = molde bespoke quebrado para este slide → player deve fazer fallback.
 */
export function countMoldInteractiveSlots(variant: string, slide: MoldAffinitySlide): number {
  if (!isBespokeLayoutVariant(variant)) return 1;

  switch (variant) {
    case 'adolescent-privacy-curtain':
      return countAdolescentPrivacyCurtainSlots(slide);
    case 'adolescent-care-pillars-deck':
      return Array.isArray(slide.items) || Array.isArray(slide.concepts)
        ? (slide.items?.length ?? slide.concepts?.length ?? 0)
        : 0;
    case 'adolescent-sigilo-spectrum':
      return countAdolescentSigiloSpectrumSlots(slide);
    case 'adolescent-speak-barrier-board':
      return Array.isArray(slide.rows) ? slide.rows.length : 0;
    case 'adolescent-vf-weave-tap':
      return Array.isArray(slide.steps) ? slide.steps.length : 0;
    case 'adolescent-exceto-isolate-tap':
    case 'adolescent-exceto-isolate-board':
    case 'pni-exceto-isolate-board':
      return Array.isArray(slide.steps) ? slide.steps.length : 0;
    case 'adolescent-consent-gate':
      return Array.isArray(slide.items) ? slide.items.filter(Boolean).length : 0;
    case 'adolescent-exceto-compare':
    case 'pni-exceto-compare':
      return Array.isArray(slide.items) ? slide.items.filter(Boolean).length : 0;
    case 'adolescent-growth-z-rail':
      return countAdolescentGrowthZRailSlots(slide);
    case 'adolescent-z-band-board':
      return countAdolescentZBandBoardSlots(slide);
    case 'adolescent-z-classify-tap':
      return countAdolescentZClassifyTapSlots(slide);
    case 'adolescent-z-threshold-trap':
      return countAdolescentZThresholdTrapSlots(slide);
    case 'adme-journey-rail': {
      const concepts = conceptItemsFromSlide(slide);
      const pkSlots = countAdmeJourneyRailPkSlots(concepts);
      return pkSlots >= 2 ? pkSlots : 0;
    }
    default:
      return countGenericInteractiveSlots(slide);
  }
}

export function bespokeMoldHasRenderableSlots(variant: string, slide: MoldAffinitySlide): boolean {
  if (!isBespokeLayoutVariant(variant)) return true;
  return countMoldInteractiveSlots(variant, slide) > 0;
}
