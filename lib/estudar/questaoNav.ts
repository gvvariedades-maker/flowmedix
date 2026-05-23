/**
 * Lista de navegação do player (/estudar/[slug]) sem carregar o catálogo completo da vitrine.
 * Modo vitrine filtrado: SQL em entitlements + histórico só dos slugs do contexto.
 */

import {
  getQuestoesByAssuntoCached,
  getHistoricoQuestoesForSlugsCached,
  estudadosSetFromHistorico,
} from '@/lib/cache';
import {
  fetchAccessibleModulosForNav,
  type AccessibleModulosNavSqlFilters,
} from '@/lib/concursos/entitlements';
import {
  buildVitrineFilteredSlugList,
  listaModulosQuestaoPorTituloAulaNoCatalogo,
  type HistoricoQuestaoRow,
  type ModuloEstudoRow,
} from '@/lib/vitrineFilters';
import { isDataServiceUnavailableError } from '@/lib/dataServiceError';

export type QuestaoNavVitrineFilters = {
  banca?: string;
  assunto?: string;
  q?: string;
};

export type QuestaoNavListInput = {
  userId?: string;
  slug: string;
  tituloAula: string;
  vitrineFilters?: QuestaoNavVitrineFilters;
};

export type QuestaoNavListItem = { id: string; modulo_slug: string };

export type QuestaoNavListResult = {
  lista: QuestaoNavListItem[];
  questoesDoAssunto: { slug: string; estudada: boolean }[];
  indexAtual: number;
};

function hasVitrineFilters(filters?: QuestaoNavVitrineFilters): boolean {
  if (!filters) return false;
  return Boolean(filters.banca?.trim() || filters.assunto?.trim() || filters.q?.trim());
}

/** Filtros que o PostgREST aplica em `modulos_estudo!inner` (reduz volume antes do filtro `q`). */
export function vitrineFiltersToSqlNavFilters(
  filters: QuestaoNavVitrineFilters,
): AccessibleModulosNavSqlFilters | undefined {
  const banca = filters.banca?.trim();
  const assunto = filters.assunto?.trim();
  const out: AccessibleModulosNavSqlFilters = {};
  if (banca) out.banca = banca;
  if (assunto) out.titulo_aula = assunto;
  return Object.keys(out).length > 0 ? out : undefined;
}

async function listaPorAssuntoSemVitrine(
  userId: string | undefined,
  tituloAula: string,
): Promise<QuestaoNavListItem[]> {
  if (!tituloAula) return [];

  if (userId) {
    try {
      const modulos = (await fetchAccessibleModulosForNav(userId, {
        titulo_aula: tituloAula,
      })) as ModuloEstudoRow[];
      if (modulos.length > 0) {
        return listaModulosQuestaoPorTituloAulaNoCatalogo(modulos, tituloAula);
      }
    } catch (e) {
      if (!isDataServiceUnavailableError(e)) throw e;
    }
  }

  try {
    return (await getQuestoesByAssuntoCached(tituloAula)) as QuestaoNavListItem[];
  } catch (e) {
    if (isDataServiceUnavailableError(e)) return [];
    throw e;
  }
}

async function fetchModulosForVitrineNav(
  userId: string,
  filters: QuestaoNavVitrineFilters,
): Promise<ModuloEstudoRow[]> {
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
  const { userId, slug, tituloAula, vitrineFilters } = input;
  const filters = vitrineFilters ?? {};

  let lista: QuestaoNavListItem[] = [];
  let historicoVitrine: HistoricoQuestaoRow[] | null = null;

  if (hasVitrineFilters(filters) && userId) {
    const modulos = await fetchModulosForVitrineNav(userId, filters);
    const modulosSlugs = modulos.map((m) => m.modulo_slug);

    historicoVitrine = (await getHistoricoQuestoesForSlugsCached(
      userId,
      modulosSlugs,
    )) as HistoricoQuestaoRow[];

    const slugList = buildVitrineFilteredSlugList(modulos, historicoVitrine, {
      banca: filters.banca,
      assunto: filters.assunto,
      q: filters.q,
    });

    if (slugList.length > 0 && slugList.includes(slug)) {
      lista = listaFromSlugList(slugList);
    } else {
      lista = await listaPorAssuntoSemVitrine(userId, tituloAula);
      historicoVitrine = null;
    }
  } else {
    lista = await listaPorAssuntoSemVitrine(userId, tituloAula);
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
