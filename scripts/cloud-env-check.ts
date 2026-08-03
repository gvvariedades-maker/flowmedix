#!/usr/bin/env tsx
/**
 * Verifica se o Cloud Agent consegue falar com o Supabase (service role).
 * Uso: npm run cloud:env-check
 */
import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

async function main() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim();
  const anon = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').trim();
  const service = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim();
  const app = (process.env.NEXT_PUBLIC_APP_URL ?? '').trim();

  const rows: Array<[string, boolean, string]> = [
    ['NEXT_PUBLIC_SUPABASE_URL', Boolean(url) && url.includes('supabase'), url ? `${url.slice(0, 40)}…` : 'ausente'],
    ['NEXT_PUBLIC_SUPABASE_ANON_KEY', anon.length > 40, anon ? `${anon.length} chars` : 'ausente'],
    ['SUPABASE_SERVICE_ROLE_KEY', service.length > 40, service ? `${service.length} chars` : 'ausente'],
    ['NEXT_PUBLIC_APP_URL', Boolean(app), app || 'ausente'],
  ];

  let ok = true;
  for (const [name, pass, detail] of rows) {
    console.log(`${pass ? '✅' : '❌'} ${name} — ${detail}`);
    if (!pass) ok = false;
  }

  if (!ok) {
    console.error(`
[cloud:env-check] FAIL — escolha UM caminho:

A) Cursor Secrets (recomendado para próximos agents)
   https://cursor.com/dashboard/cloud-agents → Secrets → Runtime Secret
   Adicione: SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
   Depois: novo Cloud Agent (ou Update Environment).

B) Vercel token (esta VM)
   VERCEL_TOKEN=... npm run cloud:pull-env

C) Colar no chat (esta conversa)
   Envie a SUPABASE_SERVICE_ROLE_KEY (e opcionalmente VERCEL_TOKEN).
   O agente grava em .env.local (gitignored) e segue o Cap 1.
`);
    process.exit(1);
  }

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { count, error } = await supabase
    .from('modulos_estudo')
    .select('modulo_slug', { count: 'exact', head: true })
    .eq('titulo_aula', 'Noções de Anatomia');

  if (error) {
    console.error('[cloud:env-check] Supabase query FAIL:', error.message);
    process.exit(1);
  }
  console.log(`[cloud:env-check] OK — Noções de Anatomia count=${count ?? 0}`);
}

main().catch((err) => {
  console.error('[cloud:env-check]', err instanceof Error ? err.message : err);
  process.exit(1);
});
