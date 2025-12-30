import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'As variáveis NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias'
  )
}

export async function createServerSupabase() {
  // Fallback server client usando a service role key para operações server-side.
  // Função async para satisfazer as expectativas de Server Actions do Next.
  return createClient(supabaseUrl!, supabaseServiceKey!)
}

