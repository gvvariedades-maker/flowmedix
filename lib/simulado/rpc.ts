import { z } from 'zod';
import { createServerSupabase } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export const SIMULADO_POOL_RPC = 'get_simulado_question_pool' as const;

const SimuladoPoolItemSchema = z.object({
  modulo_id: z.string().uuid(),
  modulo_slug: z.string().min(1),
  ordem: z.number().int().min(1),
});

export type SimuladoPoolItem = z.infer<typeof SimuladoPoolItemSchema>;

export type FetchSimuladoPoolRpcParams = {
  userId: string;
  quantidade: number;
  filters?: {
    banca?: string;
    assunto?: string;
    q?: string;
  };
};

export async function fetchSimuladoQuestionPoolFromRpc(
  params: FetchSimuladoPoolRpcParams,
): Promise<SimuladoPoolItem[]> {
  const { userId, quantidade, filters = {} } = params;
  const supabase = await createServerSupabase();

  const { data, error } = await supabase.rpc(SIMULADO_POOL_RPC, {
    p_user_id: userId,
    p_quantidade: quantidade,
    p_banca: filters.banca?.trim() || null,
    p_assunto: filters.assunto?.trim() || null,
    p_q: filters.q?.trim() || null,
  });

  if (error) {
    logger.warn('RPC get_simulado_question_pool falhou', {
      userId,
      quantidade,
      code: error.code,
      message: error.message,
    });
    throw error;
  }

  const parsed = z.array(SimuladoPoolItemSchema).safeParse(data);
  if (!parsed.success) {
    logger.warn('RPC get_simulado_question_pool payload inválido', {
      userId,
      issues: parsed.error.issues.length,
    });
    throw new Error('Resposta RPC get_simulado_question_pool inválida');
  }

  return parsed.data;
}
