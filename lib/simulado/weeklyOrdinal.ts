import type { SupabaseClient } from '@supabase/supabase-js';
import { isWeeklySimuladoFiltros } from '@/lib/simulado/weeklySimuladoCore';

export type WeeklySessionOrdinalRow = {
  id: string;
  created_at: string;
  filtros: Record<string, unknown> | null;
};

/** Mapa session_id → posição (1-based) entre missões com `origem: weekly`, por `created_at`. */
export function buildWeeklyOrdinalMap(rows: WeeklySessionOrdinalRow[]): Map<string, number> {
  const weekly = rows
    .filter((row) => isWeeklySimuladoFiltros(row.filtros))
    .sort((a, b) => {
      const byDate = a.created_at.localeCompare(b.created_at);
      if (byDate !== 0) return byDate;
      return a.id.localeCompare(b.id);
    });

  const map = new Map<string, number>();
  weekly.forEach((row, index) => {
    map.set(row.id, index + 1);
  });
  return map;
}

export async function loadWeeklySessionOrdinals(
  supabase: SupabaseClient,
  userId: string,
): Promise<Map<string, number>> {
  const { data, error } = await supabase
    .from('simulado_sessions')
    .select('id, created_at, filtros')
    .eq('user_id', userId)
    .filter('filtros->>origem', 'eq', 'weekly')
    .order('created_at', { ascending: true });

  if (error) throw error;

  return buildWeeklyOrdinalMap((data ?? []) as WeeklySessionOrdinalRow[]);
}

export function getWeeklyOrdinalFromMap(
  map: Map<string, number>,
  sessionId: string | null | undefined,
): number | null {
  if (!sessionId) return null;
  return map.get(sessionId) ?? null;
}
