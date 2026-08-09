import {
  CONCEPT_MAP_GEOMETRIC_POOL,
  pickRotatedLayoutVariant,
} from './layoutRotation';

/** Item mínimo para decidir layout morfológico no concept_map. */
export type ConceptMapItemLike = {
  label?: string;
  title?: string;
  detail?: string;
  correct?: string;
};

export type LayoutRotationContext = {
  slug?: string;
  slideIndex?: number;
};

/** Moldes premium por subtópico — vencem regra stack (≤2 itens) e rotação geométrica. */
const CONCEPT_MAP_MOLD_OVERRIDES = new Set([
  'procedure-protocol',
  'vitals-panel',
  'survival-chain',
  'vaccine-timeline',
  'pni-rules-deck',
  'cold-chain-hub',
  'pni-exceto-command-hub',
  'pni-via-route-hub',
  'sae-documentation',
  'sae-responsibility-matrix',
  'sus-legal-pillars',
  'sus-art4-orbit',
  'absorption-speed-rail',
  'adme-journey-rail',
  'infusao-ev-station-deck',
  'dose-equivalence-rail',
  'oxygen-protocol-deck',
  'iv-care-orbit',
  'morphing-timeline',
  'lab-specimen-chain',
  'wound-stage-tissue-deck',
  'burn-depth-layer-deck',
  'ist-risk-routes-deck',
  'adolescent-privacy-curtain',
  'adolescent-care-pillars-deck',
  'adolescent-growth-z-rail',
  'adolescent-violence-deck',
  'adolescent-mental-route-list',
  'adolescent-dev-pair-rail',
  'adolescent-generic-hub-orbit',
  'nr32-annex-deck',
  'sp-id-verify-deck',
  'sp-fall-risk-rail',
  'sp-incident-taxonomy-deck',
  'respiratorio-asma-dpoc-duel-deck',
  'mental-raps-network-rail',
  'mental-crisis-signal-deck',
  'peri-preop-phase-deck',
  'peri-srpa-monitor-deck',
  'peri-protocol-checklist-deck',
  'peri-vf-assertions-deck',
  'urgencias-survival-chain-deck',
  'urgencias-xabcde-rail',
  'urgencias-stroke-signs-deck',
  'urgencias-shock-types-deck',
  'urgencias-choking-signal-deck',
  'urgencias-pediatric-rcp-deck',
  'urgencias-manchester-spectrum',
  'etiology-kingdom-rail',
  'tb-vigilance-rail',
  'itu-closed-system-rail',
  'biosseg-precaution-deck',
  'mulher-gestation-timeline',
  'mulher-labor-phase-deck',
  'mulher-screening-spectrum',
  'mulher-mammography-spectrum',
  'mulher-puerperio-timeline',
  'mulher-contraception-spectrum',
  'crianca-feeding-timeline',
  'crianca-screening-timeline',
  'crianca-pediatric-hub',
  'crianca-dehydration-spectrum',
  'crianca-puericultura-timeline',
  'crianca-neonatal-deck',
  'crianca-dev-milestones-rail',
  'cam-certos-deck',
  'cam-high-risk-duo-deck',
  'cam-exceto-rail',
  'cam-documentacao-deck',
  'iv-complication-tissue-layers',
  'iv-gauge-matrix',
  'iv-exceto-spectrum',
  'iv-interval-timeline',
  'iv-puncture-rail',
  'iv-bundle-orbit',
  'pt-crase-funnel-deck',
  'pt-clitic-rail-deck',
  'pt-comma-rail-deck',
  'pt-term-matrix-deck',
  'pt-classes-function-deck',
  'pt-classes-adverb-types-grid',
  'pt-classes-prep-contract-rail',
  'pt-classes-exceto-rule-pairs',
  'pt-classes-exceto-value-cards',
  'pt-classes-vf-claim-strip',
  'pt-subject-focus-deck',
]);

function countConceptItems(slide?: {
  items?: ConceptMapItemLike[];
  concepts?: unknown[];
}): number {
  return slide?.items?.length || slide?.concepts?.length || 0;
}

/** valor_incorreto (taxonomia causal/advers…) ≠ EXCETO adverbial (TEMPO/MODO). */
export function slidePrefersExcetoValueCards(slide?: {
  items?: ConceptMapItemLike[];
}): boolean {
  const items = slide?.items ?? [];
  if (items.length === 0) return false;
  const labels = items.map((i) => `${i.label || ''} ${i.title || ''}`).join(' ');
  if (/tempo\s*\/\s*meio|substantivo|locu[cç][aã]o adverbial/i.test(labels)) {
    return false;
  }
  return /causal|advers|explicat|comparat|consecut|concess|cardinal|ordinal|valor/i.test(
    labels,
  );
}

/**
 * Resolve `layout_variant` do concept_map.
 * - Com ≥3 itens → rotação bridge/grid/molecular por slug (salvo override explícito no JSON).
 * - Com 1–2 itens → `stack`.
 */
export function resolveConceptMapLayoutVariant(
  slide: { items?: ConceptMapItemLike[]; concepts?: unknown[] } | undefined,
  explicitVariant?: string,
  fallbackVariant?: string,
  ctx?: LayoutRotationContext,
): string {
  const count = countConceptItems(slide);

  if (explicitVariant) {
    return explicitVariant;
  }

  if (
    fallbackVariant === 'pt-classes-exceto-rule-pairs' ||
    fallbackVariant === 'pt-classes-exceto-value-cards'
  ) {
    return slidePrefersExcetoValueCards(slide)
      ? 'pt-classes-exceto-value-cards'
      : 'pt-classes-exceto-rule-pairs';
  }

  if (fallbackVariant && CONCEPT_MAP_MOLD_OVERRIDES.has(fallbackVariant)) {
    return fallbackVariant;
  }

  if (count >= 3) {
    if (ctx?.slug) {
      return pickRotatedLayoutVariant(
        CONCEPT_MAP_GEOMETRIC_POOL,
        fallbackVariant ?? 'grid',
        ctx.slug,
        ctx.slideIndex ?? 0,
        'concept_map',
      );
    }
    return fallbackVariant ?? 'morphological';
  }

  if (count > 0 && count <= 2) {
    if (explicitVariant === 'stack' || explicitVariant === 'grid') {
      return explicitVariant;
    }
    return 'stack';
  }

  return explicitVariant || fallbackVariant || 'grid';
}
