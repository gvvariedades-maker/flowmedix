import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';
import { ESTUDAR_IDB_DB_VERSION } from '@/lib/estudar/estudarL0Config';

const L0_GENERATION_CACHE_ID = 'estudar-l0-generation-v1';

let supabaseAnonSingleton: SupabaseClient | null | undefined;

function getSupabaseAnon(): SupabaseClient | null {
  if (supabaseAnonSingleton !== undefined) return supabaseAnonSingleton;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url?.trim() || !key?.trim()) {
    supabaseAnonSingleton = null;
    return null;
  }
  supabaseAnonSingleton = createClient(url, key);
  return supabaseAnonSingleton;
}

/**
 * Fingerprint do catálogo de questões — muda em insert/delete em `modulos_estudo`.
 * Prefixo inclui versão IDB para forçar purge único após bump de schema/chave.
 */
export async function computeEstudarL0Generation(): Promise<string> {
  const supabase = getSupabaseAnon();
  if (!supabase) {
    return `idb${ESTUDAR_IDB_DB_VERSION}-offline`;
  }

  const [{ count, error: countError }, { data: latest, error: latestError }] = await Promise.all([
    supabase.from('modulos_estudo').select('id', { count: 'exact', head: true }),
    supabase
      .from('modulos_estudo')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (countError || latestError) {
    return `idb${ESTUDAR_IDB_DB_VERSION}-error`;
  }

  const total = count ?? 0;
  const maxCreated = latest?.created_at ?? '0';
  return `idb${ESTUDAR_IDB_DB_VERSION}-${total}-${maxCreated}`;
}

/** Cache curto — invalidado com tag `modulos-estudo` no publish/delete. */
export const getEstudarL0GenerationCached = unstable_cache(
  computeEstudarL0Generation,
  [L0_GENERATION_CACHE_ID],
  {
    revalidate: 60,
    tags: ['modulos-estudo', 'estudar-l0-generation'],
  },
);
