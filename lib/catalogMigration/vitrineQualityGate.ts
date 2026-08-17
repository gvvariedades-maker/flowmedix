/**
 * Fase 3 — vitrine e entitlements só expõem subtópicos com canSell().
 * Subtópicos fora do handcraft-registry permanecem visíveis (legado).
 */
import {
  findPacoteBySubtopico,
  loadHandcraftRegistry,
  type HandcraftRegistry,
} from '@/lib/catalogMigration/handcraftRegistry';
import { canSell } from '@/lib/catalogMigration/shipGate';
import type { VitrinePageResponse } from '@/lib/vitrine/types';
import type { VitrineFacets } from '@/lib/vitrine/types';

export type VitrineQualityGateState = {
  gatedKeys: Set<string>;
  sellableKeys: Set<string>;
};

export const CACHE_TTL_MS = 60_000;
let cachedState: VitrineQualityGateState | null = null;
let cachedAt = 0;

export function isQualityVitrineGateEnabled(): boolean {
  const raw = process.env.QUALITY_VITRINE_GATE?.trim().toLowerCase();
  if (raw === 'false' || raw === '0' || raw === 'off') return false;
  return true;
}

export function buildVitrineQualityGateState(
  registry: HandcraftRegistry = loadHandcraftRegistry(),
): VitrineQualityGateState {
  const gatedKeys = new Set<string>();
  const sellableKeys = new Set<string>();

  for (const [key, pacote] of Object.entries(registry.pacotes)) {
    const norm = key.trim().toLowerCase();
    gatedKeys.add(norm);
    if (canSell(pacote)) sellableKeys.add(norm);
  }

  return { gatedKeys, sellableKeys };
}

export function getVitrineQualityGateState(force = false): VitrineQualityGateState {
  if (!force && cachedState && Date.now() - cachedAt < CACHE_TTL_MS) {
    return cachedState;
  }
  cachedState = buildVitrineQualityGateState();
  cachedAt = Date.now();
  return cachedState;
}

export function invalidateVitrineQualityGateCache(): void {
  cachedState = null;
  cachedAt = 0;
}

/**
 * Subtópico rastreado no registry mas ainda não vendável.
 */
export function isTituloAulaQualityGated(tituloAula: string | null | undefined): boolean {
  const title = tituloAula?.trim();
  if (!title) return false;
  const registry = loadHandcraftRegistry();
  return findPacoteBySubtopico(registry, title) !== null;
}

/**
 * Visível para aluno na vitrine / player.
 * Admin e gate desligado → sempre true.
 */
export function isTituloAulaVisibleInVitrine(
  tituloAula: string | null | undefined,
  options?: { isAdmin?: boolean },
): boolean {
  if (options?.isAdmin) return true;
  if (!isQualityVitrineGateEnabled()) return true;

  const title = tituloAula?.trim();
  if (!title) return true;

  const { gatedKeys, sellableKeys } = getVitrineQualityGateState();
  const key = title.toLowerCase();
  if (!gatedKeys.has(key)) return true;
  return sellableKeys.has(key);
}

export function filterModulosByVitrineQualityGate<T extends { titulo_aula?: string | null }>(
  modulos: T[],
  options?: { isAdmin?: boolean },
): T[] {
  if (options?.isAdmin || !isQualityVitrineGateEnabled()) return modulos;
  return modulos.filter((m) => isTituloAulaVisibleInVitrine(m.titulo_aula, options));
}

export function filterVitrineFacetsByQualityGate(
  facets: VitrineFacets,
  options?: { isAdmin?: boolean },
): VitrineFacets {
  if (options?.isAdmin || !isQualityVitrineGateEnabled()) return facets;
  return {
    bancas: facets.bancas,
    assuntos: facets.assuntos.filter((a) => isTituloAulaVisibleInVitrine(a, options)),
  };
}

export function applyVitrineQualityGateToPage(
  page: VitrinePageResponse,
  options?: { isAdmin?: boolean },
): VitrinePageResponse {
  if (options?.isAdmin || !isQualityVitrineGateEnabled()) return page;

  const groups = page.groups.filter((g) => isTituloAulaVisibleInVitrine(g.titulo_aula, options));
  const facets = page.facets
    ? filterVitrineFacetsByQualityGate(page.facets, options)
    : page.facets;

  const totalModulosFiltrados = groups.reduce((sum, g) => sum + g.totalQuestoes, 0);

  return {
    ...page,
    groups,
    facets,
    totalModulosFiltrados,
    pagination: {
      ...page.pagination,
      totalGroups: groups.length > 0 ? page.pagination.totalGroups : 0,
    },
  };
}
