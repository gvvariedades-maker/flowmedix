#!/usr/bin/env tsx
/**
 * Ajusta Max Rows do PostgREST no projeto Supabase (Management API).
 *
 * Pré-requisito: Personal Access Token com permissão `data_api_config_write`.
 * Crie em https://supabase.com/dashboard/account/tokens
 *
 * Uso:
 *   SUPABASE_ACCESS_TOKEN=sbp_... npm run supabase:max-rows
 *   npm run supabase:max-rows -- --max-rows 15000
 *   npm run supabase:max-rows -- --dry-run
 */

import { loadEnvConfig } from '@next/env';
import { createClient } from '@supabase/supabase-js';
import { SCALE_LIMITS } from '../lib/scale/constants';

loadEnvConfig(process.cwd());

const MANAGEMENT_API = 'https://api.supabase.com/v1';
const DEFAULT_TARGET = Math.max(SCALE_LIMITS.VITRINE_MODULOS, 15_000);

type PostgrestConfig = {
  max_rows?: number;
  db_schema?: string;
  db_extra_search_path?: string;
  db_pool?: number;
};

function projectRefFromUrl(url: string): string | null {
  const match = url.match(/https:\/\/([^.]+)\.supabase\.co/i);
  return match?.[1] ?? null;
}

function parseArgs() {
  const args = process.argv.slice(2);
  let maxRows = DEFAULT_TARGET;
  let dryRun = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--max-rows' && args[i + 1]) {
      maxRows = Number.parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--dry-run') {
      dryRun = true;
    }
  }

  if (!Number.isFinite(maxRows) || maxRows < SCALE_LIMITS.VITRINE_MODULOS) {
    throw new Error(
      `max-rows inválido. Use >= ${SCALE_LIMITS.VITRINE_MODULOS} (teto do código AVANT).`,
    );
  }

  return { maxRows, dryRun };
}

async function managementFetch(
  token: string,
  path: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(`${MANAGEMENT_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
}

async function probeCatalogRows(): Promise<{ total: number; returned: number }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return { total: 0, returned: 0 };

  const supabase = createClient(url, key);
  const [{ count }, { data }] = await Promise.all([
    supabase.from('modulos_estudo').select('*', { count: 'exact', head: true }),
    supabase
      .from('modulos_estudo')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(SCALE_LIMITS.VITRINE_MODULOS),
  ]);

  return { total: count ?? 0, returned: data?.length ?? 0 };
}

function validateManagementToken(token: string): string | null {
  if (token.startsWith('eyJ')) {
    return (
      'Parece SUPABASE_SERVICE_ROLE_KEY ou ANON_KEY (JWT eyJ...).\n' +
      '   A Management API exige Personal Access Token (sbp_...) de:\n' +
      '   https://supabase.com/dashboard/account/tokens'
    );
  }
  if (!token.startsWith('sbp_')) {
    return (
      'Formato inesperado. Use Personal Access Token que começa com sbp_\n' +
      '   (não é a service role nem a anon key do projeto).'
    );
  }
  return null;
}

async function main() {
  const { maxRows, dryRun } = parseArgs();
  const token = process.env.SUPABASE_ACCESS_TOKEN?.trim();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

  if (!token) {
    console.error(
      '❌ SUPABASE_ACCESS_TOKEN ausente.\n' +
        '   Crie um token em https://supabase.com/dashboard/account/tokens\n' +
        '   (permissão data_api_config_write) e adicione em .env.local:\n' +
        '   SUPABASE_ACCESS_TOKEN=sbp_...',
    );
    process.exit(1);
  }

  const tokenError = validateManagementToken(token);
  if (tokenError) {
    console.error(`❌ SUPABASE_ACCESS_TOKEN inválido para Management API.\n   ${tokenError}`);
    process.exit(1);
  }

  if (!supabaseUrl) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL ausente.');
    process.exit(1);
  }

  const ref = projectRefFromUrl(supabaseUrl);
  if (!ref) {
    console.error('❌ Não foi possível extrair project ref da URL Supabase.');
    process.exit(1);
  }

  const beforeProbe = await probeCatalogRows();
  console.log(`\n📦 Catálogo: ${beforeProbe.total} módulos no banco`);
  console.log(`   PostgREST devolveu: ${beforeProbe.returned} linhas (limit ${SCALE_LIMITS.VITRINE_MODULOS})`);

  const getRes = await managementFetch(token, `/projects/${ref}/postgrest`);
  if (!getRes.ok) {
    const body = await getRes.text();
    console.error(`❌ Falha ao ler config PostgREST (${getRes.status}):`, body);
    if (getRes.status === 401) {
      console.error(
        '\n💡 401 "JWT could not be decoded" = token errado.\n' +
          '   Use Personal Access Token (sbp_...) de Account → Access Tokens,\n' +
          '   não SUPABASE_SERVICE_ROLE_KEY nem NEXT_PUBLIC_SUPABASE_ANON_KEY.',
      );
    }
    process.exit(1);
  }

  const current = (await getRes.json()) as PostgrestConfig;
  console.log(`\n⚙️  Max Rows atual: ${current.max_rows ?? '(desconhecido)'}`);
  console.log(`   Alvo: ${maxRows}`);

  if (current.max_rows != null && current.max_rows >= maxRows) {
    console.log('\n✅ Max Rows já está no teto desejado ou acima. Nada a fazer.');
    process.exit(0);
  }

  if (dryRun) {
    console.log('\n(dry-run) PATCH não enviado.');
    process.exit(0);
  }

  const patchRes = await managementFetch(token, `/projects/${ref}/postgrest`, {
    method: 'PATCH',
    body: JSON.stringify({ max_rows: maxRows }),
  });

  if (!patchRes.ok) {
    const body = await patchRes.text();
    console.error(`❌ Falha ao atualizar Max Rows (${patchRes.status}):`, body);
    process.exit(1);
  }

  const updated = (await patchRes.json()) as PostgrestConfig;
  console.log(`\n✅ Max Rows atualizado para ${updated.max_rows ?? maxRows}`);

  // Aguarda propagação breve
  await new Promise((r) => setTimeout(r, 2000));

  const afterProbe = await probeCatalogRows();
  console.log(`\n🔍 Verificação: PostgREST devolveu ${afterProbe.returned} / ${afterProbe.total} módulos`);

  if (afterProbe.total > afterProbe.returned && afterProbe.returned < maxRows) {
    console.warn(
      '⚠️  Ainda há truncamento. Aguarde 1–2 min e rode de novo, ou invalide cache (modulos-estudo).',
    );
    process.exit(1);
  }

  console.log('\n✅ Catálogo completo acessível via API.');
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
