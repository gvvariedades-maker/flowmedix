import type { SupabaseClient } from '@supabase/supabase-js';
import { formatDurationFriendly } from '@/lib/simulado/provaMeta';
import { resolveSessionMode } from '@/lib/simulado/sessionDetail';

const TENTATIVA_SUFFIX_RE = / — tentativa \d+$/i;

/** Normaliza título para agrupar tentativas (trim, lower, remove sufixo " — tentativa N"). */
export function normalizeTituloForEvolucao(titulo: string): string {
  const trimmed = titulo.trim().toLowerCase();
  return trimmed.replace(TENTATIVA_SUFFIX_RE, '').trim();
}

export type ProvaEvolucaoItem = {
  id: string;
  titulo: string;
  percentual_acerto: number | null;
  tempo_total_ms: number | null;
  tempo_label: string | null;
  concluida_em: string | null;
  created_at: string;
};

type ProvaEvolucaoRow = {
  id: string;
  titulo?: string | null;
  modo?: string | null;
  filtros?: Record<string, unknown> | null;
  percentual_acerto?: number | null;
  tempo_total_ms?: number | null;
  concluida_em?: string | null;
  created_at: string;
};

export async function getProvaEvolucaoPorTitulo(
  supabase: SupabaseClient,
  userId: string,
  titulo: string,
  limit = 5,
): Promise<ProvaEvolucaoItem[]> {
  const normalized = normalizeTituloForEvolucao(titulo);
  if (!normalized) return [];

  const { data, error } = await supabase
    .from('simulado_sessions')
    .select(
      'id, titulo, modo, filtros, percentual_acerto, tempo_total_ms, concluida_em, created_at',
    )
    .eq('user_id', userId)
    .eq('status', 'concluido')
    .order('concluida_em', { ascending: false, nullsFirst: false })
    .limit(100);

  if (error || !data?.length) return [];

  return (data as ProvaEvolucaoRow[])
    .filter((row) => resolveSessionMode(row.filtros ?? {}) === 'prova' || row.modo === 'prova')
    .filter((row) => normalizeTituloForEvolucao(row.titulo ?? '') === normalized)
    .slice(0, limit)
    .map((row) => ({
      id: row.id,
      titulo: row.titulo?.trim() ?? '',
      percentual_acerto: row.percentual_acerto ?? null,
      tempo_total_ms: row.tempo_total_ms ?? null,
      tempo_label:
        row.tempo_total_ms != null ? formatDurationFriendly(row.tempo_total_ms) : null,
      concluida_em: row.concluida_em ?? null,
      created_at: row.created_at,
    }));
}
