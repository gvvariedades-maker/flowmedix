import type { SupabaseClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { isE2eBypassEnabled } from '@/lib/e2e/bypass';
import { getE2eSimuladoSession } from '@/lib/e2e/simuladoSeed';
import {
  buildSimuladoQuestaoRespondida,
  computeSimuladoResumo,
  extractQuestaoMetaFromModulo,
  type SimuladoRespostaProgressRow,
} from '@/lib/simulado/sessionProgress';
import type {
  SimuladoModo,
  SimuladoQuestaoItem,
  SimuladoSessionDetailResponse,
} from '@/lib/simulado/types';

export type { SimuladoRespostaProgressRow };

export type SimuladoSessionDbRow = {
  id: string;
  status: 'aberto' | 'concluido' | 'cancelado';
  total_questoes: number;
  titulo?: string | null;
  ritmo_meta_segundos_por_questao?: number | null;
  prova_iniciada_em?: string | null;
  filtros: Record<string, unknown>;
  created_at: string;
  concluida_em: string | null;
};

export function resolveSessionMode(filtros?: Record<string, unknown>): SimuladoModo {
  return filtros?.modo === 'prova' ? 'prova' : 'treino';
}

export function buildSimuladoSessionDetail(
  session: SimuladoSessionDbRow,
  rows: SimuladoRespostaProgressRow[],
): SimuladoSessionDetailResponse {
  const sessionMode = resolveSessionMode(session.filtros);
  const resumo = computeSimuladoResumo(rows, session.total_questoes);

  const questoes: SimuladoQuestaoItem[] = rows.map((row) => {
    const respondida = row.acertou !== null;
    const base = {
      ordem: row.ordem,
      modulo_slug: row.modulo_slug,
      meta: extractQuestaoMetaFromModulo(row.modulos_estudo),
    };

    if (!respondida) {
      return { ...base, respondida: false as const };
    }

    return buildSimuladoQuestaoRespondida(row, {
      sessionMode,
      sessionStatus: session.status,
    });
  });

  return {
    session: {
      id: session.id,
      status: session.status,
      modo: sessionMode,
      titulo: session.titulo?.trim() ?? '',
      ritmo_meta_segundos_por_questao: session.ritmo_meta_segundos_por_questao ?? null,
      prova_iniciada_em: session.prova_iniciada_em ?? null,
      total_questoes: session.total_questoes,
      filtros: session.filtros,
      created_at: session.created_at,
      concluida_em: session.concluida_em,
    },
    resumo,
    questoes,
  };
}

const SIMULADO_RESPOSTAS_SELECT = `
  ordem,
  modulo_slug,
  opcao_id,
  opcao_correta_id,
  acertou,
  respondida_em,
  tempo_ms,
  modulos_estudo (
    banca,
    titulo_aula,
    modulo_nome
  )
`;

export type SimuladoSessionDetailResult =
  | { data: SimuladoSessionDetailResponse; error: null }
  | { data: null; error: 'not_found' }
  | { data: null; error: 'db' };

export async function getSimuladoSessionDetailForUser(
  supabase: SupabaseClient,
  userId: string,
  sessionId: string,
): Promise<SimuladoSessionDetailResult> {
  const { data: session, error: sessionError } = await supabase
    .from('simulado_sessions')
    .select(
      'id, status, total_questoes, titulo, ritmo_meta_segundos_por_questao, prova_iniciada_em, filtros, created_at, concluida_em',
    )
    .eq('id', sessionId)
    .eq('user_id', userId)
    .maybeSingle<SimuladoSessionDbRow>();

  if (sessionError) {
    logger.error('Falha ao buscar sessão de simulado', sessionError, { userId, sessionId });
    return { data: null, error: 'db' };
  }

  if (!session) {
    return { data: null, error: 'not_found' };
  }

  const { data: respostas, error: respostasError } = await supabase
    .from('simulado_respostas')
    .select(SIMULADO_RESPOSTAS_SELECT)
    .eq('session_id', sessionId)
    .eq('user_id', userId)
    .order('ordem', { ascending: true });

  if (respostasError) {
    logger.error('Falha ao listar respostas do simulado', respostasError, { userId, sessionId });
    return { data: null, error: 'db' };
  }

  const rows = (respostas ?? []) as SimuladoRespostaProgressRow[];
  return { data: buildSimuladoSessionDetail(session, rows), error: null };
}

/**
 * Carrega detalhe da sessão no servidor (RSC ou API), com suporte a seed E2E.
 */
export async function loadSimuladoSessionDetail(
  supabase: SupabaseClient | null,
  userId: string | undefined,
  sessionId: string,
): Promise<SimuladoSessionDetailResult> {
  if (isE2eBypassEnabled('E2E_DASHBOARD_BYPASS')) {
    const seeded = getE2eSimuladoSession(sessionId);
    if (!seeded) {
      return { data: null, error: 'not_found' };
    }
    return { data: seeded, error: null };
  }

  if (!supabase || !userId) {
    return { data: null, error: 'not_found' };
  }

  return getSimuladoSessionDetailForUser(supabase, userId, sessionId);
}
