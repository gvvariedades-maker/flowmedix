/**
 * Lista de navegação do player (/estudar/[slug]) sem carregar o catálogo completo da vitrine.
 * Modo vitrine filtrado: SQL em entitlements + histórico só dos slugs do contexto.
 */

import {
  getHistoricoQuestoesForSlugsCached,
  estudadosSetFromHistorico,
  getModulosEstudoCached,
} from '@/lib/cache';
import { fetchAccessibleModulosForNav } from '@/lib/concursos/entitlements';
import {
  buildVitrineFilteredSlugList,
  filterModulosLikeVitrine,
  listaModulosQuestaoPorTituloAulaNoCatalogo,
  vitrineFiltersToSqlNavFilters,
  type HistoricoQuestaoRow,
  type ModuloEstudoRow,
} from '@/lib/vitrineFilters';
import { isDataServiceUnavailableError } from '@/lib/dataServiceError';

export type QuestaoNavVitrineFilters = {
  bancas?: string[];
  assuntos?: string[];
  /** @deprecated use bancas */
  banca?: string;
  /** @deprecated use assuntos */
  assunto?: string;
  q?: string;
};

export type QuestaoNavListInput = {
  userId?: string;
  slug: string;
  tituloAula: string;
  vitrineFilters?: QuestaoNavVitrineFilters;
  isAdmin?: boolean;
};

export type QuestaoNavListItem = { id: string; modulo_slug: string };

export type QuestaoNavListResult = {
  lista: QuestaoNavListItem[];
  questoesDoAssunto: { slug: string; estudada: boolean }[];
  indexAtual: number;
};

function hasVitrineFilters(filters?: QuestaoNavVitrineFilters): boolean {
  if (!filters) return false;
  return Boolean(
    filters.bancas?.length ||
      filters.banca?.trim() ||
      filters.assuntos?.length ||
      filters.assunto?.trim() ||
      filters.q?.trim(),
  );
}

export { vitrineFiltersToSqlNavFilters };

async function listaPorAssuntoSemVitrine(
  userId: string | undefined,
  tituloAula: string,
  isAdmin = false,
): Promise<QuestaoNavListItem[]> {
  if (!tituloAula) return [];

  if (isAdmin) {
    const modulos = (await getModulosEstudoCached()) as ModuloEstudoRow[];
    return listaModulosQuestaoPorTituloAulaNoCatalogo(modulos, tituloAula);
  }

  if (userId) {
    try {
      const modulos = (await fetchAccessibleModulosForNav(userId, {
        titulo_aula: tituloAula,
      })) as ModuloEstudoRow[];
      return listaModulosQuestaoPorTituloAulaNoCatalogo(modulos, tituloAula);
    } catch (e) {
      if (isDataServiceUnavailableError(e)) return [];
      throw e;
    }
  }

  return [];
}

async function fetchModulosForVitrineNav(
  userId: string,
  filters: QuestaoNavVitrineFilters,
  isAdmin = false,
): Promise<ModuloEstudoRow[]> {
  if (isAdmin) {
    const modulos = (await getModulosEstudoCached()) as ModuloEstudoRow[];
    const sqlFilters = vitrineFiltersToSqlNavFilters(filters);
    if (!sqlFilters) return modulos;
    const placeholder = modulos.map((m) => ({
      ...m,
      estudoReversoConcluido: false,
      stats: { acertos: 0, total: 0, percentual: 0, priorityScore: 0 },
    }));
    return filterModulosLikeVitrine(placeholder, {
      bancas: filters.bancas,
      assuntos: filters.assuntos,
      q: filters.q,
    }) as ModuloEstudoRow[];
  }

  const sqlFilters = vitrineFiltersToSqlNavFilters(filters);
  try {
    return (await fetchAccessibleModulosForNav(userId, sqlFilters)) as ModuloEstudoRow[];
  } catch (e) {
    if (isDataServiceUnavailableError(e)) return [];
    throw e;
  }
}

function listaFromSlugList(slugList: string[]): QuestaoNavListItem[] {
  return slugList.map((s) => ({ id: s, modulo_slug: s }));
}

function buildQuestoesComEstudada(
  lista: QuestaoNavListItem[],
  estudadosSet: Set<string>,
): { slug: string; estudada: boolean }[] {
  return lista.map((item) => ({
    slug: item.modulo_slug,
    estudada: estudadosSet.has(item.modulo_slug),
  }));
}

/**
 * Monta lista ordenada, índice e flags de estudo para o player (modo normal / vitrine).
 * Plano e caderno continuam na page — listas pequenas e origem diferente.
 */
export async function getQuestaoNavList(input: QuestaoNavListInput): Promise<QuestaoNavListResult> {
  const { userId, slug, tituloAula, vitrineFilters, isAdmin = false } = input;
  const filters = vitrineFilters ?? {};

  let lista: QuestaoNavListItem[] = [];
  let historicoVitrine: HistoricoQuestaoRow[] | null = null;

  if (hasVitrineFilters(filters) && (userId || isAdmin)) {
    const modulos = await fetchModulosForVitrineNav(userId ?? '', filters, isAdmin);
    const modulosSlugs = modulos.map((m) => m.modulo_slug);

    historicoVitrine = (await getHistoricoQuestoesForSlugsCached(
      userId,
      modulosSlugs,
    )) as HistoricoQuestaoRow[];

    const slugList = buildVitrineFilteredSlugList(modulos, historicoVitrine, filters);

    if (slugList.length > 0 && slugList.includes(slug)) {
      lista = listaFromSlugList(slugList);
    } else {
      lista = await listaPorAssuntoSemVitrine(userId, tituloAula, isAdmin);
      historicoVitrine = null;
    }
  } else {
    lista = await listaPorAssuntoSemVitrine(userId, tituloAula, isAdmin);
  }

  const listaSlugs = lista.map((item) => item.modulo_slug);
  const historicoParaDots =
    userId && historicoVitrine
      ? historicoVitrine.filter((h) => listaSlugs.includes(h.modulo_slug))
      : userId
        ? await getHistoricoQuestoesForSlugsCached(userId, listaSlugs)
        : [];

  const estudadosSet = estudadosSetFromHistorico(historicoParaDots);
  const questoesDoAssunto = buildQuestoesComEstudada(lista, estudadosSet);
  const indexAtual = lista.findIndex((item) => item.modulo_slug === slug);

  return { lista, questoesDoAssunto, indexAtual };
}
