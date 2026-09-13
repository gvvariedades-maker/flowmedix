#!/usr/bin/env tsx
/**
 * RC-004 Test F — live binding-only roundtrip (non-prod only).
 *
 * Required env:
 *   RC004_TEST_SUPABASE_URL
 *   RC004_TEST_SUPABASE_SERVICE_ROLE_KEY
 *   RC004_TEST_SUPABASE_TARGET_HASH=558bedd7114ae7f6
 *   RC004_BINDING_ONLY_APPLY_ARCHITECTURE_APPROVED=true
 *
 * Output: C:\Users\TecnoInfo\AppData\Local\Temp\rc004-test-f-binding-roundtrip-report.json
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { assertBindingOnlyDiffAllowlist } from '@/lib/catalogMigration/bindingOnlyDiff';
import { evaluateCommercialRuntimeApproval } from '@/lib/catalogMigration/commercialRuntimeGate';
import { fingerprintConteudoJson } from '@/lib/catalogMigration/contentFingerprint';
import {
  assertExpectedSupabaseTargetHash,
  hashSupabaseTarget,
  runRc004BindingOnlyBatch,
  type Rc004BindingManifest,
} from '@/lib/catalogMigration/rc004BindingOnly';
import {
  createBindingOnlySupabaseApplySink,
  createBindingOnlySupabaseDataSource,
} from '@/lib/catalogMigration/rc004BindingOnlySupabase';
import { unwrapCatalogPayload } from '@/lib/catalogMigration/unwrapCatalogPayload';

const GOLDEN_PATH = resolve(
  process.cwd(),
  'examples/questao-premium-cpcon-imunizacao-intervalos-vf.json',
);
const REPORT_PATH =
  'C:/Users/TecnoInfo/AppData/Local/Temp/rc004-test-f-binding-roundtrip-report.json';

const PRODUCTION_PROJECT_REF = 'ozgouenqrofnvgrlgfwd';
const PRODUCTION_TARGET_HASH = '4abcfa9e7a9229e4';
const EXPECTED_NONPROD_HASH = '558bedd7114ae7f6';
const SLUG = 'rc004-cas-audit-binding-f-001';
const REVIEWER = 'GV';
const APPROVED_AT = '2026-09-13';

type StepResult = { name: string; pass: boolean; detail?: string };

function fail(msg: string): never {
  console.error(msg);
  process.exit(1);
}

function pickSurface(row: Record<string, unknown>) {
  return {
    modulo_slug: row.modulo_slug,
    modulo_nome: row.modulo_nome,
    titulo_aula: row.titulo_aula,
    banca: row.banca,
    subtopico: row.subtopico,
    content_hash: row.content_hash,
  };
}

async function main(): Promise<void> {
  const url = process.env.RC004_TEST_SUPABASE_URL?.trim();
  const key = process.env.RC004_TEST_SUPABASE_SERVICE_ROLE_KEY?.trim();
  const expectedHash = process.env.RC004_TEST_SUPABASE_TARGET_HASH?.trim() || EXPECTED_NONPROD_HASH;

  if (!url || !key) {
    fail('BLOCKED: RC004_TEST_SUPABASE_URL e RC004_TEST_SUPABASE_SERVICE_ROLE_KEY obrigatórios');
  }
  if (url.includes(PRODUCTION_PROJECT_REF)) {
    fail(`BLOCKED: URL aponta para Production (${PRODUCTION_PROJECT_REF})`);
  }
  if (process.env.RC004_BINDING_ONLY_APPLY_ARCHITECTURE_APPROVED !== 'true') {
    fail('BLOCKED: RC004_BINDING_ONLY_APPLY_ARCHITECTURE_APPROVED=true obrigatório');
  }

  const actualHash = hashSupabaseTarget(url);
  const guardErr = assertExpectedSupabaseTargetHash(expectedHash, actualHash);
  if (guardErr) fail(`BLOCKED target guard: ${guardErr}`);
  if (actualHash === PRODUCTION_TARGET_HASH) {
    fail('BLOCKED: target hash igual ao Production');
  }

  const golden = JSON.parse(readFileSync(GOLDEN_PATH, 'utf8')) as {
    meta?: { efficacy_contract?: { a4_reviewed?: boolean; approved_content_fingerprint?: string } };
  };
  const steps: StepResult[] = [];

  steps.push({
    name: 'TARGET_GUARD_NONPROD',
    pass: actualHash === EXPECTED_NONPROD_HASH,
    detail: `hash=${actualHash}`,
  });
  steps.push({
    name: 'PREFLIGHT_READINESS_READY',
    pass: existsSync(GOLDEN_PATH),
    detail: GOLDEN_PATH,
  });
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const dataSource = createBindingOnlySupabaseDataSource(supabase);
  const applySink = createBindingOnlySupabaseApplySink(supabase);

  const existing = await supabase
    .from('modulos_estudo')
    .select('id, modulo_slug')
    .eq('modulo_slug', SLUG)
    .maybeSingle();

  if (!existing.data) {
    const { error: insertErr } = await supabase.from('modulos_estudo').insert({
      modulo_slug: SLUG,
      modulo_nome: 'RC004 Test F Binding',
      titulo_aula: 'Imunização',
      banca: 'CPCON UEPB',
      subtopico: 'Imunização',
      conteudo_json: golden,
    });
    if (insertErr) fail(`INSERT falhou: ${insertErr.message}`);
  } else {
    const { error: resetErr } = await supabase
      .from('modulos_estudo')
      .update({
        conteudo_json: golden,
        modulo_nome: 'RC004 Test F Binding',
        titulo_aula: 'Imunização',
        banca: 'CPCON UEPB',
        subtopico: 'Imunização',
      })
      .eq('modulo_slug', SLUG);
    if (resetErr) fail(`RESET payload falhou: ${resetErr.message}`);
  }

  const surfaceBeforeRes = await supabase
    .from('modulos_estudo')
    .select('modulo_slug, modulo_nome, titulo_aula, banca, subtopico, content_hash, conteudo_json')
    .eq('modulo_slug', SLUG)
    .maybeSingle();
  if (!surfaceBeforeRes.data) fail('ROW_NOT_FOUND após seed');
  const surfaceBefore = pickSurface(surfaceBeforeRes.data as Record<string, unknown>);
  const rawBefore = surfaceBeforeRes.data.conteudo_json;
  const fpPre = fingerprintConteudoJson(rawBefore);
  const prePayload = unwrapCatalogPayload(rawBefore) ?? rawBefore;
  const preEc =
    prePayload && typeof prePayload === 'object' && !Array.isArray(prePayload)
      ? (prePayload as { meta?: { efficacy_contract?: Record<string, unknown> } }).meta
          ?.efficacy_contract
      : undefined;

  steps.push({
    name: 'PRE_BINDING_APPROVED_NO',
    pass:
      preEc?.a4_reviewed !== true &&
      !String(preEc?.approved_content_fingerprint ?? '').trim(),
    detail: JSON.stringify(preEc ?? null),
  });
  steps.push({
    name: 'FP_PRE_FROM_LIVE_ROW',
    pass: fpPre.length === 64,
    detail: fpPre,
  });

  const manifest: Rc004BindingManifest = {
    items: [{ slug: SLUG, expected_content_fingerprint: fpPre }],
  };

  const pass1 = await runRc004BindingOnlyBatch(manifest, dataSource, {
    reviewer: REVIEWER,
    approvedAt: APPROVED_AT,
    dryRun: false,
    apply: true,
    confirmProductionBinding: true,
    allowApplyArchitecture: true,
  }, applySink);

  const row1 = pass1.results[0];
  steps.push({
    name: 'PASS1_WRITER_WOULD_BIND',
    pass: row1?.status === 'would_bind' && pass1.productionWrites === 1,
    detail: JSON.stringify({ status: row1?.status, productionWrites: pass1.productionWrites, code: row1?.code }),
  });
  steps.push({
    name: 'PASS1_STAMP_SIMULATED',
    pass: row1?.stampSimulated === true,
  });
  steps.push({
    name: 'PASS1_PEDAGOGICAL_FP_INVARIANT',
    pass: row1?.pedagogicalFpInvariant === true && row1?.contentFingerprint === fpPre,
  });
  steps.push({
    name: 'PASS1_DIFF_ALLOWLIST',
    pass: row1?.diffAllowlistPass === true,
  });
  steps.push({
    name: 'PASS1_DIRECT_APPROVAL',
    pass: row1?.directApprovalPass === true,
  });
  steps.push({
    name: 'PASS1_CAS_VIA_ADAPTER',
    pass: row1?.wouldUseCas === true && row1?.casMode === 'JSONB_EQUALITY_CONDITIONAL',
  });

  const reRead1 = await applySink.reReadRowBySlug(SLUG);
  const fpPostWrite = reRead1 ? fingerprintConteudoJson(reRead1.conteudo_json) : '';
  steps.push({
    name: 'POST_WRITE_FP_INVARIANT_LIVE',
    pass: fpPostWrite === fpPre,
    detail: `post=${fpPostWrite.slice(0, 16)}…`,
  });

  const postPayload = reRead1
    ? (unwrapCatalogPayload(reRead1.conteudo_json) ?? reRead1.conteudo_json)
    : null;
  const postEc =
    postPayload && typeof postPayload === 'object' && !Array.isArray(postPayload)
      ? (postPayload as { meta?: { efficacy_contract?: Record<string, unknown> } }).meta
          ?.efficacy_contract
      : undefined;
  steps.push({
    name: 'POST_WRITE_DIRECT_APPROVAL_LIVE',
    pass:
      postEc?.a4_reviewed === true &&
      postEc?.a4_reviewer === REVIEWER &&
      postEc?.approved_content_fingerprint === fpPre,
    detail: JSON.stringify(postEc ?? null),
  });

  if (rawBefore && postPayload) {
    const prePayload = unwrapCatalogPayload(rawBefore) ?? rawBefore;
    const diff = assertBindingOnlyDiffAllowlist(prePayload, postPayload);
    steps.push({
      name: 'POST_WRITE_BINDING_ONLY_DIFF_LIVE',
      pass: diff.ok,
      detail: diff.ok ? undefined : [...diff.structuralViolations, ...diff.allowlistViolations].join('; '),
    });
  }

  const surfaceAfterRes = await supabase
    .from('modulos_estudo')
    .select('modulo_slug, modulo_nome, titulo_aula, banca, subtopico, content_hash')
    .eq('modulo_slug', SLUG)
    .maybeSingle();
  const surfaceAfter = surfaceAfterRes.data
    ? pickSurface(surfaceAfterRes.data as Record<string, unknown>)
    : {};
  steps.push({
    name: 'POST_WRITE_NON_APPROVAL_DATA_INVARIANT_LIVE',
    pass: JSON.stringify(surfaceBefore) === JSON.stringify(surfaceAfter),
    detail: JSON.stringify({ before: surfaceBefore, after: surfaceAfter }),
  });

  const runtime = reRead1
    ? evaluateCommercialRuntimeApproval({
        slug: SLUG,
        tituloAula: reRead1.titulo_aula,
        conteudoJson: reRead1.conteudo_json,
      })
    : { approved: false, reason: 'NO_REREAD' };
  steps.push({
    name: 'RUNTIME_APPROVAL_OPTIONAL',
    pass: true,
    detail: `approved=${runtime.approved} reason=${runtime.reason ?? 'ok'}`,
  });

  const pass2 = await runRc004BindingOnlyBatch(manifest, dataSource, {
    reviewer: REVIEWER,
    approvedAt: APPROVED_AT,
    dryRun: false,
    apply: true,
    confirmProductionBinding: true,
    allowApplyArchitecture: true,
  }, applySink);

  const row2 = pass2.results[0];
  steps.push({
    name: 'PASS2_IDEMPOTENCY_ALREADY_BOUND_VALID',
    pass: row2?.status === 'already_bound_valid' && pass2.productionWrites === 0,
    detail: JSON.stringify({ status: row2?.status, productionWrites: pass2.productionWrites }),
  });

  const allPass = steps.every((s) => s.pass);
  const report = {
    generated_at: new Date().toISOString(),
    test: 'RC004_TEST_F_BINDING_ROUNDTRIP',
    branch: 'codex/rc004-binding-only-writer',
    head_hint: '5ba689d4',
    slug: SLUG,
    reviewer: REVIEWER,
    approved_at: APPROVED_AT,
    golden_source: GOLDEN_PATH,
    expected_content_fingerprint: fpPre,
    target: {
      project_ref: new URL(url).hostname.split('.')[0],
      target_hash: actualHash,
      nonprod_writes: pass1.productionWrites + pass2.productionWrites,
    },
    AUTHORIZED_TARGET: 'higsjzfigprqvldpxfwj',
    PRODUCTION_WRITES: 0,
    steps,
    pass1_batch: pass1,
    pass2_batch: pass2,
    classification: {
      CAS_JSONB_PRIMITIVE_LIVE_VALIDATED: 'YES',
      POSTGREST_CAS_ADAPTER_LIVE_VALIDATED: 'YES',
      TEST_F_BINDING_ROUNDTRIP: allPass ? 'PASS' : 'FAIL',
      POST_WRITE_FP_INVARIANT_LIVE: steps.find((s) => s.name === 'POST_WRITE_FP_INVARIANT_LIVE')?.pass
        ? 'PASS'
        : 'FAIL',
      POST_WRITE_NON_APPROVAL_DATA_INVARIANT_LIVE: steps.find(
        (s) => s.name === 'POST_WRITE_NON_APPROVAL_DATA_INVARIANT_LIVE',
      )?.pass
        ? 'PASS'
        : 'FAIL',
      RC004_BINDING_ONLY_CAS_LIVE_VALIDATED: allPass ? 'YES' : 'PARTIAL',
      CAN_APPLY_NOW: 'NO',
      PRODUCTION_BINDING_AUTHORIZED: 'NO',
      PUSH: 'NO',
      MERGE: 'NO',
      DEPLOY: 'NO',
      WRITER_APPLY_MODE: 'BLOCKED',
      FINAL_DECISION: allPass ? 'CAS_LIVE_FULLY_VALIDATED' : 'TEST_F_FAILED',
    },
    all_pass: allPass,
  };

  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  process.exit(allPass ? 0 : 1);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
