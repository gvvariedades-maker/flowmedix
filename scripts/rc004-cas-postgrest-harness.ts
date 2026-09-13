#!/usr/bin/env tsx
/**
 * RC-004 CAS live harness — PostgREST + supabase-js (non-prod only).
 *
 * Required env (test project only — never Production):
 *   RC004_TEST_SUPABASE_URL=https://<test-ref>.supabase.co
 *   RC004_TEST_SUPABASE_SERVICE_ROLE_KEY=...
 *   RC004_TEST_SUPABASE_TARGET_HASH=<16hex>
 *
 * Optional:
 *   RC004_TEST_SLUG=rc004-cas-audit-001
 */
import { createClient } from '@supabase/supabase-js';
import {
  assertExpectedSupabaseTargetHash,
  hashSupabaseTarget,
} from '@/lib/catalogMigration/rc004BindingOnly';
import {
  createBindingOnlySupabaseApplySink,
  createBindingOnlySupabaseDataSource,
} from '@/lib/catalogMigration/rc004BindingOnlySupabase';

const PRODUCTION_TARGET_HASH = '4abcfa9e7a9229e4';
const PRODUCTION_PROJECT_REF = 'ozgouenqrofnvgrlgfwd';

type CasResult = { name: string; pass: boolean; detail?: string };

function fail(msg: string): never {
  console.error(msg);
  process.exit(1);
}

async function main(): Promise<void> {
  const url = process.env.RC004_TEST_SUPABASE_URL?.trim();
  const key = process.env.RC004_TEST_SUPABASE_SERVICE_ROLE_KEY?.trim();
  const expectedHash = process.env.RC004_TEST_SUPABASE_TARGET_HASH?.trim();
  const slug = process.env.RC004_TEST_SLUG?.trim() || 'rc004-cas-audit-postgrest';

  if (!url || !key) {
    fail('BLOCKED: RC004_TEST_SUPABASE_URL e RC004_TEST_SUPABASE_SERVICE_ROLE_KEY obrigatórios');
  }

  if (url.includes(PRODUCTION_PROJECT_REF)) {
    fail(`BLOCKED: URL aponta para Production (${PRODUCTION_PROJECT_REF})`);
  }

  const actualHash = hashSupabaseTarget(url);
  const guardErr = assertExpectedSupabaseTargetHash(expectedHash, actualHash);
  if (guardErr) fail(`BLOCKED target guard: ${guardErr}`);
  if (actualHash === PRODUCTION_TARGET_HASH) {
    fail('BLOCKED: target hash igual ao Production');
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const dataSource = createBindingOnlySupabaseDataSource(supabase);
  const applySink = createBindingOnlySupabaseApplySink(supabase);
  const results: CasResult[] = [];

  const row = await dataSource.fetchRowBySlug(slug);
  if (!row) {
    fail(`ROW_NOT_FOUND: ${slug} — crie a linha sintética no projeto de teste primeiro`);
  }

  const id = row.id;
  const stateA = { x: 1, y: 2 };
  const stateB = { rc004: 'postgrest-bound', v: 1 };
  const stateC = { concurrent: true };

  await supabase
    .from('modulos_estudo')
    .update({ conteudo_json: stateA })
    .eq('id', id);

  const casA = await applySink.updateConteudoJsonCas({
    id,
    expectedConteudoJson: stateA,
    nextConteudoJson: stateB,
  });
  results.push({
    name: 'CAS_IDENTICAL_CURRENT_JSONB',
    pass: casA.updated === true,
    detail: casA.error,
  });

  const reReadA = await applySink.reReadRowBySlug(slug);
  const reReadJson = reReadA?.conteudo_json as Record<string, unknown> | undefined;
  results.push({
    name: 'POST_WRITE_REREAD',
    pass:
      reReadJson?.rc004 === stateB.rc004 &&
      reReadJson?.v === stateB.v,
  });

  await supabase.from('modulos_estudo').update({ conteudo_json: stateA }).eq('id', id);
  const casB = await applySink.updateConteudoJsonCas({
    id,
    expectedConteudoJson: { y: 2, x: 1 },
    nextConteudoJson: stateB,
  });
  results.push({
    name: 'JSONB_PROPERTY_ORDER_EQUALITY',
    pass: casB.updated === true,
    detail: casB.error,
  });

  await supabase.from('modulos_estudo').update({ conteudo_json: stateA }).eq('id', id);
  await supabase.from('modulos_estudo').update({ conteudo_json: stateC }).eq('id', id);
  const casC = await applySink.updateConteudoJsonCas({
    id,
    expectedConteudoJson: stateA,
    nextConteudoJson: stateB,
  });
  const afterC = await applySink.reReadRowBySlug(slug);
  results.push({
    name: 'CAS_CONCURRENT_CHANGE_REJECTED',
    pass: casC.updated === false,
    detail: casC.error ?? 'zero rows',
  });
  results.push({
    name: 'CAS_DOES_NOT_OVERWRITE_CONCURRENT_MUTATION',
    pass: JSON.stringify(afterC?.conteudo_json) === JSON.stringify(stateC),
  });

  const casD = await applySink.updateConteudoJsonCas({
    id,
    expectedConteudoJson: { wrong: true },
    nextConteudoJson: stateB,
  });
  results.push({
    name: 'CAS_ZERO_ROWS_TREATED_AS_CONFLICT',
    pass: casD.updated === false,
    detail: 'writer maps to CAS_CONFLICT',
  });

  const report = {
    generated_at: new Date().toISOString(),
    target_hash: actualHash,
    slug,
    AUTHORIZED_TARGET: new URL(url).hostname.split('.')[0],
    PRODUCTION_WRITES: 0,
    results,
    all_pass: results.every((r) => r.pass),
  };

  console.log(JSON.stringify(report, null, 2));
  process.exit(report.all_pass ? 0 : 1);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
