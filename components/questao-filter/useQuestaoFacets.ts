'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';
import type { VitrineFacets } from '@/lib/vitrine/types';

const EMPTY_FACETS: VitrineFacets = { bancas: [], assuntos: [] };

function facetsEqual(a: VitrineFacets, b: VitrineFacets): boolean {
  return (
    a.bancas.length === b.bancas.length &&
    a.assuntos.length === b.assuntos.length &&
    a.bancas.every((v, i) => v === b.bancas[i]) &&
    a.assuntos.every((v, i) => v === b.assuntos[i])
  );
}

function facetsQueryKey(bancas: string[]): string {
  return [...bancas].sort().join('\0');
}

function mergeFacets(primary: VitrineFacets, fallback: VitrineFacets): VitrineFacets {
  const bancas = primary.bancas.length ? primary.bancas : fallback.bancas;
  const assuntos = primary.assuntos.length ? primary.assuntos : fallback.assuntos;
  return { bancas, assuntos };
}

export type UseQuestaoFacetsOptions = {
  /** Lista local quando a API falha ou retorna vazio (ex.: módulos do caderno). */
  fallbackFacets?: VitrineFacets;
  /** Desliga fetch interno quando o pai controla facets (ex.: vitrine SSR). */
  enabled?: boolean;
};

export function useQuestaoFacets(
  bancasSelected: string[],
  options: UseQuestaoFacetsOptions = {},
) {
  const { fallbackFacets = EMPTY_FACETS, enabled = true } = options;
  const [facets, setFacets] = useState<VitrineFacets>(fallbackFacets);
  const [facetsLoading, setFacetsLoading] = useState(enabled);
  const bancasKey = useMemo(() => facetsQueryKey(bancasSelected), [bancasSelected]);
  const fallbackKey = useMemo(
    () => `${fallbackFacets.bancas.join('|')}::${fallbackFacets.assuntos.join('|')}`,
    [fallbackFacets.assuntos, fallbackFacets.bancas],
  );

  useEffect(() => {
    if (!enabled) {
      setFacets((prev) => (facetsEqual(prev, fallbackFacets) ? prev : fallbackFacets));
      setFacetsLoading(false);
      return;
    }

    let cancelled = false;

    async function loadFacets() {
      setFacetsLoading(true);
      const params = new URLSearchParams();
      bancasSelected.forEach((b) => params.append('bancas', b));

      try {
        const query = params.toString();
        const res = await fetchWithAuth(
          query ? `/api/vitrine/facets?${query}` : '/api/vitrine/facets',
        );
        if (!res.ok) throw new Error('facets');
        const data = (await res.json()) as VitrineFacets;
        if (cancelled) return;
        setFacets(mergeFacets(data, fallbackFacets));
      } catch {
        if (!cancelled) setFacets(fallbackFacets);
      } finally {
        if (!cancelled) setFacetsLoading(false);
      }
    }

    void loadFacets();
    return () => {
      cancelled = true;
    };
  }, [bancasKey, bancasSelected, enabled, fallbackFacets, fallbackKey]);

  return { facets, facetsLoading };
}

/** Deriva facets a partir de módulos locais (fallback do painel caderno). */
export function deriveFacetsFromModulos(
  modulos: { banca?: string | null; titulo_aula?: string | null }[],
): VitrineFacets {
  const bancas = new Set<string>();
  const assuntos = new Set<string>();
  for (const m of modulos) {
    if (m.banca?.trim()) bancas.add(m.banca.trim());
    if (m.titulo_aula?.trim()) assuntos.add(m.titulo_aula.trim());
  }
  return {
    bancas: [...bancas].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    assuntos: [...assuntos].sort((a, b) => a.localeCompare(b, 'pt-BR')),
  };
}
