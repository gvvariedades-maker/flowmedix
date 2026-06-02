'use client';

import useSWR from 'swr';
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

async function fetchVitrinePage(query: VitrineListQuery): Promise<VitrinePageResponse> {
  const params = new URLSearchParams();
  params.set('page', String(query.page));
  query.bancas.forEach((b) => params.append('bancas', b));
  query.assuntos.forEach((a) => params.append('assuntos', a));
  if (query.q?.trim()) params.set('q', query.q.trim());

  const res = await fetchWithAuth(`/api/vitrine?${params.toString()}`);
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Erro ${res.status}`);
  }
  return (await res.json()) as VitrinePageResponse;
}

/**
 * Lista paginada da vitrine com SWR (`keepPreviousData`): mantém grupos anteriores
 * enquanto filtro/página atualiza; `isValidating` indica “Atualizando…”.
 */
export function useVitrineListSwr(
  query: VitrineListQuery,
  options: UseVitrineListSwrOptions = {},
) {
  const listKey = vitrineListQueryKey(query);
  const retryNonce = options.retryNonce ?? 0;
  const swrKey = `${listKey}#${retryNonce}`;

  const ssrMatches =
    Boolean(options.fallbackData) &&
    options.ssrListQueryKey === listKey &&
    retryNonce === 0;

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    swrKey,
    () => fetchVitrinePage(query),
    {
      keepPreviousData: true,
      fallbackData: ssrMatches ? options.fallbackData ?? undefined : undefined,
      revalidateOnMount: !ssrMatches,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
    },
  );

  return {
    data: data ?? null,
    error: error instanceof Error ? error.message : error ? String(error) : null,
    isLoading: isLoading && !data,
    isValidating,
    mutate,
    listKey,
  };
}
