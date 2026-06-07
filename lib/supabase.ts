/**
 * @deprecated Use `@/lib/supabase/client` (browser) ou `@/lib/supabase/server` (service role).
 * Mantido apenas para referência legada — não importar em código novo.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variáveis SUPABASE não configuradas em NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_ANON_KEY',
  );
}

/** @deprecated Preferir `lib/supabase/client.ts` */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
