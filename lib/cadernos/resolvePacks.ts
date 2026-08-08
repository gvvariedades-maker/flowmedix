import type { ModuloEstudoListRow } from '@/lib/concursos/entitlements';
import {
  CADERNO_PACKS,
  MINUTES_PER_QUESTAO,
  PACK_MAX_SIZE,
  type PackDefinition,
} from '@/lib/cadernos/packs';
import { moduloMatchesBanca } from '@/lib/cadernos/templates';

export type PackHistoricoRow = {
  modulo_slug: string;
  acertou: boolean | null;
  estudo_reverso_concluido: boolean | null;
};

/** Subconjunto de NotebookSummary necessário para CTA / deep-link. */
export type ClonedPackNotebook = {
  id: string;
  studyEntrySlug: string | null;
  studiedCount: number;
  itemCount: number;
};

export type ResolvedPackItem = {
  modulo_slug: string;
  titulo_aula: string | null;
  topico: string | null;
};

export type ResolvedPack = {
  def: PackDefinition;
  /** `{banca}` já interpolado. */
  title: string;
  slugs: string[];
  items: ResolvedPackItem[];
  estimatedMinutes: number;
  clonedNotebookId: string | null;
  /** Próxima questão (clonado) ou primeiro slug do pack. */
  entrySlug: string | null;
  studiedCount: number;
  cta: 'start' | 'continue' | 'review';
};

export type ResolvePacksInput = {
  /** Já filtrados por entitlement. */
  modulos: ModuloEstudoListRow[];
  historico: PackHistoricoRow[];
  editalBanca: string | null;
  clonedByPackId: Map<string, ClonedPackNotebook>;
};

function sortModulosStable(modulos: ModuloEstudoListRow[]): ModuloEstudoListRow[] {
  return [...modulos].sort((a, b) => {
    const ca = a.avant_codigo ?? Number.MAX_SAFE_INTEGER;
    const cb = b.avant_codigo ?? Number.MAX_SAFE_INTEGER;
    if (ca !== cb) return ca - cb;
    return a.modulo_slug.localeCompare(b.modulo_slug, 'pt-BR');
  });
}

function takePackSize(modulos: ModuloEstudoListRow[], size: number): ModuloEstudoListRow[] {
  const limit = Math.min(Math.max(0, size), PACK_MAX_SIZE);
  return sortModulosStable(modulos).slice(0, limit);
}

function interpolateTitle(template: string, editalBanca: string | null): string {
  const banca = editalBanca?.trim() || 'seu edital';
  return template.replaceAll('{banca}', banca);
}

function selectPool(
  def: PackDefinition,
  modulos: ModuloEstudoListRow[],
  historico: PackHistoricoRow[],
  editalBanca: string | null,
): ModuloEstudoListRow[] | null {
  const { rule } = def;

  if (rule.kind === 'edital') {
    if (!editalBanca?.trim()) return null;
    return modulos.filter((m) => moduloMatchesBanca(m.banca, editalBanca));
  }

  if (rule.kind === 'assunto') {
    return modulos.filter((m) => (m.titulo_aula ?? '') === rule.tituloAula);
  }

  if (rule.kind === 'erros') {
    const wrongSlugs = new Set(
      historico.filter((h) => h.acertou === false).map((h) => h.modulo_slug),
    );
    return modulos.filter((m) => wrongSlugs.has(m.modulo_slug));
  }

  // mix — amostra ampla / estável do catálogo acessível
  return modulos;
}

function resolveCta(
  cloned: ClonedPackNotebook | undefined,
  studiedCount: number,
): ResolvedPack['cta'] {
  if (!cloned) return 'start';
  if (cloned.itemCount > 0 && studiedCount >= cloned.itemCount) return 'review';
  if (studiedCount > 0) return 'continue';
  return 'start';
}

/**
 * Resolve packs visíveis a partir do catálogo acessível + histórico.
 * Função pura — sem I/O (testável com Jest sem mock de Supabase).
 */
export function resolvePacks(input: ResolvePacksInput): ResolvedPack[] {
  const { modulos, historico, editalBanca, clonedByPackId } = input;
  const out: ResolvedPack[] = [];

  for (const def of CADERNO_PACKS) {
    const pool = selectPool(def, modulos, historico, editalBanca);
    if (!pool) continue;

    const picked = takePackSize(pool, def.size);
    if (picked.length < def.minSize) continue;

    const items: ResolvedPackItem[] = picked.map((m) => ({
      modulo_slug: m.modulo_slug,
      titulo_aula: m.titulo_aula,
      topico: m.modulo_nome,
    }));
    const slugs = items.map((i) => i.modulo_slug);
    const cloned = clonedByPackId.get(def.id);
    const studiedCount = cloned?.studiedCount ?? 0;
    const entrySlug = cloned?.studyEntrySlug ?? slugs[0] ?? null;

    out.push({
      def,
      title: interpolateTitle(def.title, editalBanca),
      slugs,
      items,
      estimatedMinutes: slugs.length * MINUTES_PER_QUESTAO,
      clonedNotebookId: cloned?.id ?? null,
      entrySlug,
      studiedCount,
      cta: resolveCta(cloned, studiedCount),
    });
  }

  return out;
}
