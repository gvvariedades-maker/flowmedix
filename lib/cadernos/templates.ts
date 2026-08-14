export type NotebookEditalContext = {
  nome: string;
  banca: string | null;
  orgao: string | null;
  ano: number | null;
  slug: string;
} | null;

export type ModuloTemplateRow = {
  modulo_slug: string;
  titulo_aula: string | null;
  modulo_nome: string | null;
  banca: string | null;
};

export type AssuntoPresetEntry = {
  titulo: string;
  count: number;
};

export type QuickAddPresetOrigem = 'edital' | 'desempenho';

export type QuickAddPreset = {
  banca?: string;
  assuntosTop3: AssuntoPresetEntry[];
  suggestedBatchSize: number;
  /** De onde veio a seleção. `desempenho` = assuntos escolhidos pelo aluno no hub. */
  origem?: QuickAddPresetOrigem;
  /**
   * Modo estrito: o lote nunca é completado com assuntos fora da seleção.
   * Sem isto, `pickWizardBatchModulos` só prioriza e preenche o resto com o pool.
   */
  strict?: boolean;
};

export const WIZARD_PRESET_STORAGE_KEY = 'avant.caderno.wizardPreset';
export const DEFAULT_WIZARD_BATCH_SIZE = 10;
/** Teto do lote vindo do hub — abaixo do `MAX_BATCH` da API (1000). */
export const DESEMPENHO_MAX_BATCH_SIZE = 60;

const GENERIC_ASSUNTO_HINTS = [
  'Urgências e Emergências',
  'Farmacodinâmica e Farmacocinética',
  'Atenção Básica / Saúde da Família',
] as const;

export function moduloMatchesBanca(
  moduloBanca: string | null | undefined,
  editalBanca: string | null | undefined,
): boolean {
  if (!editalBanca?.trim()) return true;
  if (!moduloBanca?.trim()) return false;
  const a = editalBanca.trim().toLowerCase();
  const b = moduloBanca.trim().toLowerCase();
  return b.includes(a) || a.includes(b);
}

export function buildNotebookTitleSuggestions(edital: NotebookEditalContext): string[] {
  if (!edital) {
    return ['Revisão diária', 'Minhas questões', 'Simulado focado', 'Meu caderno AVANT enf'];
  }

  const suggestions: string[] = [];
  if (edital.banca?.trim()) suggestions.push(`Meu edital — ${edital.banca.trim()}`);
  if (edital.orgao?.trim()) suggestions.push(`Revisão ${edital.orgao.trim()}`);
  if (edital.nome?.trim()) suggestions.push(edital.nome.trim());
  suggestions.push('Meu caderno AVANT enf');

  return [...new Set(suggestions)].slice(0, 4);
}

function countAssuntos(modulos: ModuloTemplateRow[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const m of modulos) {
    const titulo = m.titulo_aula?.trim();
    if (!titulo) continue;
    counts.set(titulo, (counts.get(titulo) ?? 0) + 1);
  }
  return counts;
}

function topAssuntosFromCounts(counts: Map<string, number>, limit = 3): AssuntoPresetEntry[] {
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pt-BR'))
    .slice(0, limit)
    .map(([titulo, count]) => ({ titulo, count }));
}

function genericAssuntoPresets(modulos: ModuloTemplateRow[]): AssuntoPresetEntry[] {
  const found: AssuntoPresetEntry[] = [];
  for (const hint of GENERIC_ASSUNTO_HINTS) {
    const count = modulos.filter((m) => m.titulo_aula === hint).length;
    if (count > 0) found.push({ titulo: hint, count });
  }
  if (found.length >= 3) return found.slice(0, 3);
  const fallback = topAssuntosFromCounts(countAssuntos(modulos), 3);
  const seen = new Set(found.map((f) => f.titulo));
  for (const entry of fallback) {
    if (found.length >= 3) break;
    if (seen.has(entry.titulo)) continue;
    found.push(entry);
    seen.add(entry.titulo);
  }
  return found;
}

export function buildQuickAddPreset(
  edital: NotebookEditalContext,
  modulos: ModuloTemplateRow[],
): QuickAddPreset {
  const banca = edital?.banca?.trim() || undefined;
  const filtered = banca
    ? modulos.filter((m) => moduloMatchesBanca(m.banca, banca))
    : modulos;

  const pool = filtered.length > 0 ? filtered : modulos;
  const assuntosTop3 =
    pool.length > 0 ? topAssuntosFromCounts(countAssuntos(pool), 3) : genericAssuntoPresets(modulos);

  return {
    banca,
    assuntosTop3,
    suggestedBatchSize: DEFAULT_WIZARD_BATCH_SIZE,
  };
}

/**
 * Preset a partir de assuntos escolhidos no hub `/desempenho`.
 *
 * Sempre estrito: o caderno recebe só questões dos assuntos marcados. Se não
 * houver questões liberadas, o lote fica vazio — a UI avisa em vez de completar
 * com outro assunto.
 */
export function buildDesempenhoPreset(
  assuntos: readonly string[],
  modulos: ModuloTemplateRow[],
): QuickAddPreset {
  const counts = countAssuntos(modulos);
  const selecionados = [...new Set(assuntos.map((a) => a.trim()).filter(Boolean))];

  return {
    origem: 'desempenho',
    strict: true,
    assuntosTop3: selecionados.map((titulo) => ({ titulo, count: counts.get(titulo) ?? 0 })),
    suggestedBatchSize: Math.min(
      Math.max(selecionados.length, 1) * DEFAULT_WIZARD_BATCH_SIZE,
      DESEMPENHO_MAX_BATCH_SIZE,
    ),
  };
}

export function pickWizardBatchModulos(
  modulos: ModuloTemplateRow[],
  preset: QuickAddPreset,
): ModuloTemplateRow[] {
  let pool = modulos;
  if (preset.banca) {
    const byBanca = modulos.filter((m) => moduloMatchesBanca(m.banca, preset.banca));
    // No modo estrito, banca sem match não volta ao pool inteiro: melhor lote
    // vazio do que caderno com questões que o aluno não pediu.
    if (byBanca.length > 0 || preset.strict) pool = byBanca;
  }

  if (preset.strict) {
    const titulos = new Set(preset.assuntosTop3.map((a) => a.titulo));
    pool = pool.filter((m) => titulos.has(m.titulo_aula ?? ''));
  }

  const assuntoOrder = preset.assuntosTop3.map((a) => a.titulo);
  const ranked = [...pool].sort((a, b) => {
    const ia = assuntoOrder.indexOf(a.titulo_aula ?? '');
    const ib = assuntoOrder.indexOf(b.titulo_aula ?? '');
    const ra = ia === -1 ? 999 : ia;
    const rb = ib === -1 ? 999 : ib;
    if (ra !== rb) return ra - rb;
    return a.modulo_slug.localeCompare(b.modulo_slug, 'pt-BR');
  });

  return ranked.slice(0, preset.suggestedBatchSize);
}

export function persistWizardPreset(preset: QuickAddPreset): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(WIZARD_PRESET_STORAGE_KEY, JSON.stringify(preset));
  } catch {
    // Storage indisponível — detail page segue sem filtro inicial.
  }
}

export function readWizardPreset(): QuickAddPreset | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(WIZARD_PRESET_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as QuickAddPreset;
    if (!parsed || !Array.isArray(parsed.assuntosTop3)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Remove o preset após consumo, para não vazar seleção antiga em outro caderno. */
export function clearWizardPreset(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(WIZARD_PRESET_STORAGE_KEY);
  } catch {
    // Storage indisponível — nada a limpar.
  }
}

/** Resolve valor do select de banca a partir do rótulo do edital. */
export function resolveBancaFilterOption(
  editalBanca: string | null | undefined,
  bancas: string[],
): string {
  if (!editalBanca?.trim()) return '';
  const match = bancas.find((b) => moduloMatchesBanca(b, editalBanca));
  return match ?? '';
}
