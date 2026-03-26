import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

/** Cliente browser alinhado ao login/middleware (sessão em cookies, não só localStorage). */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

