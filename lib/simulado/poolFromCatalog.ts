import { resolveAccessibleModulosWhenEmpty } from '@/lib/concursos/resolveCatalogWhenEmpty';
import { filterModulosLikeVitrine } from '@/lib/vitrineFilters';
import type { SimuladoPoolItem, SimuladoPoolRpcFilters } from '@/lib/simulado/rpc';

function shuffleInPlace<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j]!, items[i]!];
  }
  return items;
}

/**
 * Pool de simulado a partir do catálogo acessível (fallback quando RPC de matrícula retorna vazio).
 * Admin usa catálogo global; aluno free usa pacote após ensureGeral.
 */
export async function fetchSimuladoQuestionPoolFromCatalog(params: {
  userId: string;
  quantidade: number;
  filters?: SimuladoPoolRpcFilters;
  isAdmin: boolean;
}): Promise<SimuladoPoolItem[]> {
  const { userId, quantidade, filters = {}, isAdmin } = params;
  const modulos = await resolveAccessibleModulosWhenEmpty(userId, isAdmin);

  const placeholder = modulos.map((m) => ({
    ...m,
    estudoReversoConcluido: false,
    stats: { acertos: 0, total: 0, percentual: 0, priorityScore: 0 },
  }));

  const filtered = filterModulosLikeVitrine(placeholder, {
    bancas: filters.bancas,
    assuntos: filters.assuntos,
    q: filters.q,
  });

  const picked = shuffleInPlace([...filtered]).slice(0, Math.max(0, quantidade));

  return picked.map((m, idx) => ({
    modulo_id: m.id,
    modulo_slug: m.modulo_slug,
    ordem: idx + 1,
  }));
}

export async function fetchSimuladoQuestionPoolCountFromCatalog(params: {
  userId: string;
  filters?: SimuladoPoolRpcFilters;
  isAdmin: boolean;
}): Promise<number> {
  const pool = await fetchSimuladoQuestionPoolFromCatalog({
    userId: params.userId,
    quantidade: 10_000,
    filters: params.filters,
    isAdmin: params.isAdmin,
  });
  return pool.length;
}
