#!/usr/bin/env tsx
/**
 * Provisiona bucket questao-figures no Supabase (Storage API + políticas SQL).
 *
 * Uso: npm run figures:provision-bucket
 *
 * Requer: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 * Políticas RLS: tenta SQL via connection string (SUPABASE_DB_URL ou DATABASE_URL) se disponível;
 * caso contrário, cria só o bucket (service role faz upload; leitura pública exige policies no Dashboard).
 */
import { loadEnvConfig } from '@next/env';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { QUESTAO_FIGURES_BUCKET } from '@/lib/questaoFiguresStorage';
import { createServerSupabase } from '@/lib/supabase/server';

const MIGRATION_SQL = readFileSync(
  resolve(process.cwd(), 'supabase/migrations/20260720120000_questao_figures_bucket.sql'),
  'utf8',
);

async function ensureBucket(): Promise<void> {
  const supabase = await createServerSupabase();

  const { data: existing, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    throw new Error(`listBuckets falhou: ${listError.message}`);
  }

  const found = existing?.find((b) => b.id === QUESTAO_FIGURES_BUCKET || b.name === QUESTAO_FIGURES_BUCKET);
  if (found) {
    console.log(`Bucket "${QUESTAO_FIGURES_BUCKET}" já existe (public=${found.public})`);
    return;
  }

  const { error } = await supabase.storage.createBucket(QUESTAO_FIGURES_BUCKET, {
    public: true,
    fileSizeLimit: 512 * 1024,
    allowedMimeTypes: ['image/webp'],
  });

  if (error) {
    throw new Error(`createBucket falhou: ${error.message}`);
  }

  console.log(`Bucket "${QUESTAO_FIGURES_BUCKET}" criado (public=true, WebP, máx 512 KB)`);
}

async function applyPoliciesViaPg(): Promise<boolean> {
  const dbUrl = process.env.SUPABASE_DB_URL?.trim() || process.env.DATABASE_URL?.trim();
  if (!dbUrl) return false;

  let pg: typeof import('pg');
  try {
    pg = await import('pg');
  } catch {
    console.warn('Pacote "pg" não instalado — políticas RLS não aplicadas via script.');
    console.warn('Instale com: npm install pg --save-dev');
    console.warn('Ou aplique manualmente: supabase/migrations/20260720120000_questao_figures_bucket.sql');
    return false;
  }

  const client = new pg.Client({ connectionString: dbUrl });
  await client.connect();
  try {
    await client.query(MIGRATION_SQL);
    console.log('Políticas RLS storage.objects aplicadas via SQL.');
    return true;
  } finally {
    await client.end();
  }
}

async function verifyBucket(): Promise<void> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.storage.listBuckets();
  if (error) throw new Error(error.message);
  const bucket = data?.find((b) => b.id === QUESTAO_FIGURES_BUCKET);
  if (!bucket) {
    throw new Error(`Verificação falhou: bucket "${QUESTAO_FIGURES_BUCKET}" não encontrado`);
  }
  console.log('Verificação OK:', {
    id: bucket.id,
    public: bucket.public,
    file_size_limit: bucket.file_size_limit,
    allowed_mime_types: bucket.allowed_mime_types,
  });
}

async function main(): Promise<void> {
  await ensureBucket();
  const policiesApplied = await applyPoliciesViaPg();
  await verifyBucket();

  if (!policiesApplied) {
    console.log('\nPróximo passo (políticas RLS):');
    console.log('  Supabase Dashboard → SQL Editor → colar conteúdo de:');
    console.log('  supabase/migrations/20260720120000_questao_figures_bucket.sql');
    console.log('  (apenas o bloco CREATE POLICY, se o bucket já existir)');
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
