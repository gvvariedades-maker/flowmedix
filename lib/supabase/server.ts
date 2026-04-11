import { createClient } from '@supabase/supabase-js'

/**
 * Cliente admin (service role). Validação só em runtime — evita throw no import
 * durante `next build` (coleta de rotas) quando a service key não está no ambiente.
 */
export async function createServerSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl?.trim() || !supabaseServiceKey?.trim()) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias para operações admin no servidor'
    )
  }

  return createClient(supabaseUrl, supabaseServiceKey)
}

