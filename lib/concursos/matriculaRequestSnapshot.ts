import { cache } from 'react';
import { createServerSupabase } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import type { Concurso, ConcursoMatriculaStatus } from '@/types/database';

export type MatriculaReadOptions = {
  /** Bypass do snapshot da requisição — obrigatório após escrita. */
  fresh?: boolean;
};

export interface ConcursoMatriculaSnapshotRow {
  concurso_id: string;
  status: ConcursoMatriculaStatus | string;
  expires_at: string | null;
  concurso?: Concurso | Concurso[] | null;
}

/**
 * Leitura viva de `concurso_matriculas` (sem memo).
 * Embed de `concursos` permite gate e shell compartilharem a mesma query.
 */
export async function fetchMatriculaRowsForUser(
  userId: string,
): Promise<ConcursoMatriculaSnapshotRow[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('concurso_matriculas')
    .select(
      'concurso_id, status, expires_at, concurso:concursos(id, slug, nome, cidade, orgao, banca, ano, cargo, tipo, status, created_at)',
    )
    .eq('user_id', userId);

  if (error) {
    logger.error('Falha ao listar matrículas do usuário', error, { userId });
    throw error;
  }

  return (data ?? []) as ConcursoMatriculaSnapshotRow[];
}

const loadMatriculaRowsMemo = cache(fetchMatriculaRowsForUser);

/**
 * Snapshot por requisição e por `userId` (React `cache()` — sem cache global).
 * `fresh: true` vai ao banco e não reutiliza snapshot negativo.
 */
export async function listMatriculaRowsForUser(
  userId: string,
  options?: MatriculaReadOptions,
): Promise<ConcursoMatriculaSnapshotRow[]> {
  if (options?.fresh) {
    return fetchMatriculaRowsForUser(userId);
  }
  return loadMatriculaRowsMemo(userId);
}
