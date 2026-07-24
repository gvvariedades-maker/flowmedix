/** Limite da ação UI “Selecionar questões exibidas” (não confundir com MAX_BATCH da API). */
export const SELECT_VISIBLE_MAX = 50;

/** Quantidade máxima de questões listadas no picker do wizard (paridade com painel do detalhe). */
export const WIZARD_DISPLAY_PAGE_SIZE = 50;

/**
 * Une à seleção atual os slugs das questões atualmente exibidas, com teto por ação.
 * Não interpreta o total geral do filtro — só a coleção `displayed`.
 */
export function selectDisplayedSlugs(
  displayedSlugs: readonly string[],
  currentSelected: ReadonlySet<string>,
  maxPerAction: number = SELECT_VISIBLE_MAX,
): { next: Set<string>; added: number; capped: boolean; attempted: number } {
  const next = new Set(currentSelected);
  const limited = displayedSlugs.slice(0, Math.max(0, maxPerAction));
  let added = 0;
  for (const slug of limited) {
    if (!slug || next.has(slug)) continue;
    next.add(slug);
    added += 1;
  }
  return {
    next,
    added,
    capped: displayedSlugs.length > maxPerAction,
    attempted: limited.length,
  };
}

export function toggleSlugInSet(selected: ReadonlySet<string>, slug: string): Set<string> {
  const next = new Set(selected);
  if (next.has(slug)) next.delete(slug);
  else next.add(slug);
  return next;
}

export function dedupeSlugs(slugs: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const slug of slugs) {
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    out.push(slug);
  }
  return out;
}

export function countByDisciplinaLabel(
  rows: readonly { modulo_nome?: string | null }[],
  resolveLabel: (moduloNome?: string | null) => string,
): { label: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const label = resolveLabel(row.modulo_nome);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'pt-BR'));
}
