'use client';

import useSWR, { preload } from 'swr';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';
import {
  vitrineListQueryKey,
  type VitrineListQuery,
} from '@/lib/vitrine/parseListQuery';
import type { VitrinePageResponse } from '@/lib/vitrine/types';

export type UseVitrineListSwrOptions = {
  /** Primeira página do SSR — evita refetch imediato quando a chave bate. */
  fallbackData?: VitrinePageResponse | null;
  ssrListQueryKey?: string;
  /** Bump para retry manual (banner SSR / erro). */
  retryNonce?: number;
};

/** Resposta SWR com a chave da query que produziu os dados (anti-flash keepPreviousData). */
export type VitrinePageWithQueryKey = VitrinePageResponse & {
  listQueryKey: string;
};

function buildVitrineSwrKey(query: VitrineListQuery, retryNonce = 0): string {
  return `${vitrineListQueryKey(query)}#${retryNonce}`;
}

async function fetchVitrinePage(query: VitrineListQuery): Promise<VitrinePageWithQueryKey> {
  const params = new URLSearchParams();
  params.set('page', String(query.page));
  query.bancas.forEach((b) => params.append('bancas', b));
  query.assuntos.forEach((a) => params.append('assuntos', a));
  if (query.q?.trim()) params.set('q', query.q.trim());
  if (query.disciplina) params.set('disciplina', query.disciplina);

  const res = await fetchWithAuth(`/api/vitrine?${params.toString()}`);
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Erro ${res.status}`);
  }
  const data = (await res.json()) as VitrinePageResponse;
  return { ...data, listQueryKey: vitrineListQueryKey(query) };
}

function withListQueryKey(
  data: VitrinePageResponse,
  listKey: string,
): VitrinePageWithQueryKey {
  return { ...data, listQueryKey: listKey };
}

/**
 * Aquece o cache SWR da lista (hub → disciplina) para o clique não esperar o skeleton.
 * Deduplica com o fetcher do hook via mesma chave `listKey#retryNonce`.
 */
export function prefetchVitrineList(
  query: VitrineListQuery,
  retryNonce = 0,
): Promise<VitrinePageWithQueryKey> {
  return preload(buildVitrineSwrKey(query, retryNonce), () => fetchVitrinePage(query));
}

/**
 * Lista paginada da vitrine com SWR (`keepPreviousData`): mantém grupos anteriores
 * enquanto filtro/página atualiza; `isValidating` indica “Atualizando…”.
 *
 * `dataMatchesQuery` é false enquanto o payload ainda é da chave anterior
 * (ex.: flash Enfermagem → Português) — a UI deve mostrar skeleton, não cards stale.
 * Prefetch no hub (`prefetchVitrineList`) evita o skeleton no clique.
 */
export function useVitrineListSwr(
  query: VitrineListQuery,
  options: UseVitrineListSwrOptions = {},
) {
  const listKey = vitrineListQueryKey(query);
  const retryNonce = options.retryNonce ?? 0;
  const swrKey = buildVitrineSwrKey(query, retryNonce);

  const ssrMatches =
    Boolean(options.fallbackData) &&
    options.ssrListQueryKey === listKey &&
    retryNonce === 0;

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    swrKey,
    () => fetchVitrinePage(query),
    {
      keepPreviousData: true,
      fallbackData:
        ssrMatches && options.fallbackData
          ? withListQueryKey(options.fallbackData, listKey)
          : undefined,
      revalidateOnMount: !ssrMatches,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
    },
  );

  const dataMatchesQuery = data != null && data.listQueryKey === listKey;

  return {
    data: data ?? null,
    dataMatchesQuery,
    error: error instanceof Error ? error.message : error ? String(error) : null,
    isLoading: isLoading && !data,
    isValidating,
    mutate,
    listKey,
  };
}
