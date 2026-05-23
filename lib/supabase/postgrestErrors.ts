import type { PostgrestError } from '@supabase/supabase-js';

/**
 * Tabela/rel no PostgREST ausente (schema desatualizado ou tabela removida).
 */
export function isPostgrestRelationMissingError(error: PostgrestError | null): boolean {
  if (!error) return false;
  const msg = `${error.message ?? ''} ${error.details ?? ''} ${error.hint ?? ''}`;
  if (error.code === 'PGRST205' || error.code === '42P01') return true;
  if (/does not exist|schema cache|Could not find the table|relation .+ does not exist/i.test(msg)) {
    return true;
  }
  return false;
}
