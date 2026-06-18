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
]);

/**
 * Resolve `layout_variant` do golden_rule.
 * - Com `rows` (≥1 par label/value não vazio) → `reference_table` (B1: conteúdo vence mapa compact).
 * - Bloqueia tabela só com `layout_variant` explícito no JSON (minimal/banner/compact).
 * - `layout_variant: "reference_table"` força o layout mesmo sem rows (fallback para content).
 */
export function resolveGoldenRuleLayoutVariant(
  slide: { rows?: GoldenRuleRowLike[] } | undefined,
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
