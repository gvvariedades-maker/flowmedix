/** Linha mínima para decidir layout tabular no golden_rule. */
export type GoldenRuleRowLike = {
  label?: string;
  value?: string;
};

const GOLDEN_RULE_TYPOGRAPHY_OVERRIDES = new Set(['minimal', 'banner', 'compact']);

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

  if (hasTableRows) {
    if (explicitVariant && GOLDEN_RULE_TYPOGRAPHY_OVERRIDES.has(explicitVariant)) {
      return explicitVariant;
    }
    return 'reference_table';
  }

  return explicitVariant || fallbackVariant || 'center';
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
