import {
  GOLDEN_RULE_TYPOGRAPHY_POOL,
  pickRotatedLayoutVariant,
} from './layoutRotation';
import type { LayoutRotationContext } from './conceptMapLayout';

/** Linha mínima para decidir layout tabular no golden_rule. */
export type GoldenRuleRowLike = {
  label?: string;
  value?: string;
};

const GOLDEN_RULE_TYPOGRAPHY_OVERRIDES = new Set(['minimal', 'banner', 'compact']);

/** Moldes tabulares premium — vencem `reference_table` automático quando há `rows`. */
const GOLDEN_RULE_TABLE_MOLD_OVERRIDES = new Set([
  'soft-lens-board',
  'oxygen-rule-carousel',
  'iv-bundle-mesh-reveal',
  'lab-prep-lens-board',
  'dressing-match-matrix',
  'vitals-reference-board',
  'pni-interval-matrix',
  'pni-calendar-board',
  'pni-temperature-rail',
  'pni-exceto-rule-board',
  'ist-reference-board',
  'sae-reference-board',
  'sonda-measurement-board',
  'via-reference-board',
  'pk-pd-reference-board',
  'farmaco-clinico-reference-board',
  'farmaco-generico-reference-board',
  'adolescent-sigilo-spectrum',
  'adolescent-speak-barrier-board',
  'adolescent-z-band-board',
  'burn-rule-nine-board',
  'trabalho-nr32-reference-board',
  'sp-nsp-reference-board',
  'respiratorio-spo2-reference-board',
  'mental-raps-tier-board',
  'mental-crisis-ladder-board',
  'peri-preop-prep-board',
  'peri-aldrete-board',
  'peri-protocol-reference-board',
  'peri-vf-reference-board',
  'urgencias-rcp-params-board',
  'urgencias-trauma-reference-board',
  'urgencias-cincinnati-board',
  'urgencias-shock-reference-board',
  'urgencias-heimlich-board',
  'urgencias-pediatric-params-board',
  'urgencias-manchester-board',
  'etiology-letter-spectrum',
  'tb-precaution-board',
  'itu-bundle-letter-board',
  'biosseg-reference-board',
  'mulher-prenatal-board',
  'mulher-parto-humanizado-board',
  'mulher-papanicolau-board',
  'mulher-mama-board',
  'mulher-puerperio-board',
  'mulher-planejamento-board',
  'crianca-feeding-board',
  'crianca-screening-board',
  'crianca-pediatric-board',
  'crianca-dehydration-board',
  'crianca-puericultura-board',
  'crianca-neonatal-board',
  'crianca-dev-board',
  'cam-nine-rights-board',
  'cam-high-risk-protocol-board',
  'cam-exceto-reference-board',
  'cam-documentacao-board',
  'iv-differential-board',
  'iv-device-reference-board',
  'iv-exceto-command-board',
  'iv-interval-board',
  'iv-antisepsis-board',
  'pt-crase-funnel-board',
  'pt-clitic-rail-board',
  'pt-comma-rail-board',
  'pt-term-matrix-board',
  'pt-subject-focus-board',
]);

/**
 * Resolve `layout_variant` do golden_rule.
 * - Com `rows` (≥1 par label/value não vazio) → `reference_table` (B1: conteúdo vence mapa compact).
 * - Bloqueia tabela só com `layout_variant` explícito no JSON (minimal/banner/compact).
 * - `layout_variant: "reference_table"` força o layout mesmo sem rows (fallback para content).
 */
export function resolveGoldenRuleLayoutVariant(
  slide: { rows?: GoldenRuleRowLike[]; content?: string } | undefined,
  explicitVariant?: string,
  fallbackVariant?: string,
  ctx?: LayoutRotationContext,
  familyPool?: readonly string[],
): string {
  const rows = slide?.rows;
  const hasTableRows =
    Array.isArray(rows) &&
    rows.some(
      (r) =>
        typeof r.label === 'string' &&
        r.label.trim().length > 0 &&
        typeof r.value === 'string' &&
        r.value.trim().length > 0,
    );

  if (explicitVariant === 'reference_table') return 'reference_table';
  if (explicitVariant === 'soft-lens-board') return 'soft-lens-board';
  if (explicitVariant === 'oxygen-rule-carousel') return 'oxygen-rule-carousel';
  if (explicitVariant === 'iv-bundle-mesh-reveal') return 'iv-bundle-mesh-reveal';
  if (explicitVariant === 'lab-prep-lens-board') return 'lab-prep-lens-board';
  if (explicitVariant === 'dressing-match-matrix') return 'dressing-match-matrix';
  if (explicitVariant === 'vitals-reference-board') return 'vitals-reference-board';
  if (explicitVariant === 'pni-interval-matrix') return 'pni-interval-matrix';
  if (explicitVariant === 'pni-calendar-board') return 'pni-calendar-board';
  if (explicitVariant === 'pni-temperature-rail') return 'pni-temperature-rail';
  if (explicitVariant === 'pni-exceto-rule-board') return 'pni-exceto-rule-board';
  if (explicitVariant === 'ist-reference-board') return 'ist-reference-board';
  if (explicitVariant === 'sae-reference-board') return 'sae-reference-board';
  if (explicitVariant === 'via-reference-board') return 'via-reference-board';
  if (explicitVariant === 'pk-pd-reference-board') return 'pk-pd-reference-board';
  if (explicitVariant === 'farmaco-clinico-reference-board') return 'farmaco-clinico-reference-board';
  if (explicitVariant === 'farmaco-generico-reference-board') return 'farmaco-generico-reference-board';
  if (explicitVariant === 'adolescent-sigilo-spectrum') return 'adolescent-sigilo-spectrum';
  if (explicitVariant === 'adolescent-speak-barrier-board') return 'adolescent-speak-barrier-board';
  if (explicitVariant === 'adolescent-z-band-board') return 'adolescent-z-band-board';
  if (explicitVariant === 'burn-rule-nine-board') return 'burn-rule-nine-board';
  if (explicitVariant === 'trabalho-nr32-reference-board') return 'trabalho-nr32-reference-board';
  if (explicitVariant === 'sp-nsp-reference-board') return 'sp-nsp-reference-board';
  if (explicitVariant === 'respiratorio-spo2-reference-board') return 'respiratorio-spo2-reference-board';
  if (explicitVariant === 'mental-raps-tier-board') return 'mental-raps-tier-board';
  if (explicitVariant === 'mental-crisis-ladder-board') return 'mental-crisis-ladder-board';
  if (explicitVariant === 'peri-preop-prep-board') return 'peri-preop-prep-board';
  if (explicitVariant === 'peri-aldrete-board') return 'peri-aldrete-board';
  if (explicitVariant === 'peri-protocol-reference-board') return 'peri-protocol-reference-board';
  if (explicitVariant === 'peri-vf-reference-board') return 'peri-vf-reference-board';
  if (explicitVariant === 'urgencias-rcp-params-board') return 'urgencias-rcp-params-board';
  if (explicitVariant === 'urgencias-trauma-reference-board') return 'urgencias-trauma-reference-board';
  if (explicitVariant === 'urgencias-cincinnati-board') return 'urgencias-cincinnati-board';
  if (explicitVariant === 'urgencias-shock-reference-board') return 'urgencias-shock-reference-board';
  if (explicitVariant === 'urgencias-heimlich-board') return 'urgencias-heimlich-board';
  if (explicitVariant === 'urgencias-pediatric-params-board') return 'urgencias-pediatric-params-board';
  if (explicitVariant === 'urgencias-manchester-board') return 'urgencias-manchester-board';
  if (explicitVariant === 'etiology-letter-spectrum') return 'etiology-letter-spectrum';
  if (explicitVariant === 'tb-precaution-board') return 'tb-precaution-board';
  if (explicitVariant === 'itu-bundle-letter-board') return 'itu-bundle-letter-board';
  if (explicitVariant === 'biosseg-reference-board') return 'biosseg-reference-board';
  if (explicitVariant === 'cam-nine-rights-board') return 'cam-nine-rights-board';
  if (explicitVariant === 'cam-high-risk-protocol-board') return 'cam-high-risk-protocol-board';
  if (explicitVariant === 'cam-exceto-reference-board') return 'cam-exceto-reference-board';
  if (explicitVariant === 'cam-documentacao-board') return 'cam-documentacao-board';
  if (explicitVariant === 'iv-differential-board') return 'iv-differential-board';
  if (explicitVariant === 'iv-device-reference-board') return 'iv-device-reference-board';
  if (explicitVariant === 'iv-exceto-command-board') return 'iv-exceto-command-board';
  if (explicitVariant === 'iv-interval-board') return 'iv-interval-board';
  if (explicitVariant === 'iv-antisepsis-board') return 'iv-antisepsis-board';
  if (explicitVariant === 'pt-crase-funnel-board') return 'pt-crase-funnel-board';
  if (explicitVariant === 'pt-clitic-rail-board') return 'pt-clitic-rail-board';
  if (explicitVariant === 'pt-comma-rail-board') return 'pt-comma-rail-board';
  if (explicitVariant === 'pt-term-matrix-board') return 'pt-term-matrix-board';
  if (explicitVariant === 'pt-subject-focus-board') return 'pt-subject-focus-board';

  if (hasTableRows) {
    if (explicitVariant && GOLDEN_RULE_TYPOGRAPHY_OVERRIDES.has(explicitVariant)) {
      return explicitVariant;
    }
    if (fallbackVariant && GOLDEN_RULE_TABLE_MOLD_OVERRIDES.has(fallbackVariant)) {
      return fallbackVariant;
    }
    return 'reference_table';
  }

  if (explicitVariant) return explicitVariant;

  const pool = familyPool && familyPool.length > 0 ? familyPool : GOLDEN_RULE_TYPOGRAPHY_POOL;
  if (ctx?.slug) {
    return pickRotatedLayoutVariant(
      pool,
      fallbackVariant ?? 'center',
      ctx.slug,
      ctx.slideIndex ?? 0,
      'golden_rule',
    );
  }

  return fallbackVariant || 'center';
}

export function goldenRuleHasTableRows(rows?: GoldenRuleRowLike[]): boolean {
  return (
    Array.isArray(rows) &&
    rows.some(
      (r) =>
        typeof r.label === 'string' &&
        r.label.trim().length > 0 &&
        typeof r.value === 'string' &&
        r.value.trim().length > 0,
    )
  );
}
