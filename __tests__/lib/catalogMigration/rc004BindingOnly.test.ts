import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fingerprintConteudoJson } from '@/lib/catalogMigration/contentFingerprint';
import {
  assertBindingOnlyReviewerPolicy,
  discoverBindingOnlyCasPrimitive,
  parseBindingOnlyManifest,
  runRc004BindingOnlyBatch,
  type BindingOnlyApplySink,
  type BindingOnlyDataSource,
  type ModuloEstudoBindingRow,
} from '@/lib/catalogMigration/rc004BindingOnly';
import { isPacoteAutoApprovalEnabled, resolveRiskScoringContextFromPacote } from '@/lib/catalogMigration/rc004RiskContext';
import { loadHandcraftRegistry } from '@/lib/catalogMigration/handcraftRegistry';

const GOLDEN = JSON.parse(
  readFileSync(
    resolve(process.cwd(), 'examples/questao-premium-cpcon-imunizacao-intervalos-vf.json'),
    'utf8',
  ),
);

function rowFromPayload(slug: string, payload: unknown): ModuloEstudoBindingRow {
  return {
    id: `id-${slug}`,
    modulo_slug: slug,
    titulo_aula: (payload as { meta?: { subtopico?: string } }).meta?.subtopico ?? 'Imunização',
    conteudo_json: payload,
  };
}

describe('rc004BindingOnly', () => {
  it('reviewer GV passa policy', () => {
    expect(assertBindingOnlyReviewerPolicy('GV')).toBeNull();
  });

  it('rejeita agent:* e human:*', () => {
    expect(assertBindingOnlyReviewerPolicy('agent:foo')).not.toBeNull();
    expect(assertBindingOnlyReviewerPolicy('human:foo')).not.toBeNull();
  });

  it('rejeita placeholders da policy', () => {
    expect(assertBindingOnlyReviewerPolicy('admin')).not.toBeNull();
    expect(assertBindingOnlyReviewerPolicy('test-reviewer')).not.toBeNull();
  });

  it('valida manifest e rejeita fingerprint inválido', () => {
    const bad = parseBindingOnlyManifest([{ slug: 'a', expected_content_fingerprint: 'short' }]);
    expect(bad.ok).toBe(false);
    const fp = fingerprintConteudoJson(GOLDEN);
    const ok = parseBindingOnlyManifest([{ slug: 'slug-1', expected_content_fingerprint: fp }]);
    expect(ok.ok).toBe(true);
  });

  it('risk context epidemiologia alinha runtime default auto', () => {
    const registry = loadHandcraftRegistry();
    const pacote = registry.pacotes['Epidemiologia e Vigilância Epidemiológica'];
    expect(isPacoteAutoApprovalEnabled(pacote)).toBe(true);
    expect(resolveRiskScoringContextFromPacote(pacote).autoApprovalEnabled).toBe(true);
  });

  it('stamp=true com humano e fingerprint invariável (plain)', async () => {
    const slug = 'imunizacao-test';
    const fp = fingerprintConteudoJson(GOLDEN);
    const ds: BindingOnlyDataSource = {
      fetchRowBySlug: async () => rowFromPayload(slug, GOLDEN),
    };
    const batch = await runRc004BindingOnlyBatch(
      { items: [{ slug, expected_content_fingerprint: fp }] },
      ds,
      { reviewer: 'GV', approvedAt: '2026-09-12', dryRun: true },
    );
    expect(batch.totals.would_bind).toBe(1);
    expect(batch.productionWrites).toBe(0);
  });

  it('stamp=false sem humano', async () => {
    const slug = 'imunizacao-test';
    const fp = fingerprintConteudoJson(GOLDEN);
    const ds: BindingOnlyDataSource = {
      fetchRowBySlug: async () => rowFromPayload(slug, GOLDEN),
    };
    await expect(
      runRc004BindingOnlyBatch(
        { items: [{ slug, expected_content_fingerprint: fp }] },
        ds,
        { reviewer: 'agent:bot', approvedAt: '2026-09-12', dryRun: true },
      ),
    ).rejects.toThrow(/REVIEWER_POLICY_BLOCKED/);
  });

  it('falha em expected fingerprint divergente', async () => {
    const slug = 'imunizacao-test';
    const ds: BindingOnlyDataSource = {
      fetchRowBySlug: async () => rowFromPayload(slug, GOLDEN),
    };
    const batch = await runRc004BindingOnlyBatch(
      {
        items: [{ slug, expected_content_fingerprint: 'a'.repeat(64) }],
      },
      ds,
      { reviewer: 'GV', approvedAt: '2026-09-12', dryRun: true },
    );
    expect(batch.totals.failed).toBe(1);
    expect(batch.results[0].code).toBe('EXPECTED_CONTENT_FINGERPRINT_MISMATCH');
  });

  it('preserva wrapper reclassify', async () => {
    const slug = 'wrap-test';
    const wrapped = { changed: true, zodValid: true, payload: GOLDEN };
    const fp = fingerprintConteudoJson(wrapped);
    const ds: BindingOnlyDataSource = {
      fetchRowBySlug: async () => rowFromPayload(slug, wrapped),
    };
    const batch = await runRc004BindingOnlyBatch(
      { items: [{ slug, expected_content_fingerprint: fp }] },
      ds,
      { reviewer: 'GV', approvedAt: '2026-09-12', dryRun: true },
    );
    expect(batch.totals.would_bind).toBe(1);
  });

  it('dry-run nunca chama update sink', async () => {
    const slug = 'imunizacao-test';
    const fp = fingerprintConteudoJson(GOLDEN);
    const ds: BindingOnlyDataSource = {
      fetchRowBySlug: async () => rowFromPayload(slug, GOLDEN),
    };
    const sink: BindingOnlyApplySink = {
      updateConteudoJsonCas: async () => {
        throw new Error('update não deveria ser chamado');
      },
      reReadRowBySlug: async () => null,
    };
    const batch = await runRc004BindingOnlyBatch(
      { items: [{ slug, expected_content_fingerprint: fp }] },
      ds,
      { reviewer: 'GV', approvedAt: '2026-09-12', dryRun: true },
      sink,
    );
    expect(batch.productionWrites).toBe(0);
    expect(batch.totals.would_bind).toBe(1);
  });

  it('apply sem confirmação falha fechado', async () => {
    const slug = 'imunizacao-test';
    const fp = fingerprintConteudoJson(GOLDEN);
    const ds: BindingOnlyDataSource = {
      fetchRowBySlug: async () => rowFromPayload(slug, GOLDEN),
    };
    await expect(
      runRc004BindingOnlyBatch(
        { items: [{ slug, expected_content_fingerprint: fp }] },
        ds,
        {
          reviewer: 'GV',
          approvedAt: '2026-09-12',
          dryRun: false,
          apply: true,
          confirmProductionBinding: false,
          allowApplyArchitecture: true,
        },
        {
          updateConteudoJsonCas: async () => ({ updated: true }),
          reReadRowBySlug: async () => rowFromPayload(slug, GOLDEN),
        },
      ),
    ).rejects.toThrow(/PRODUCTION_BINDING_REQUIRES_EXPLICIT_CONFIRMATION/);
  });

  it('apply bloqueado quando CAS architecture não aprovada', async () => {
    const slug = 'imunizacao-test';
    const fp = fingerprintConteudoJson(GOLDEN);
    const ds: BindingOnlyDataSource = {
      fetchRowBySlug: async () => rowFromPayload(slug, GOLDEN),
    };
    await expect(
      runRc004BindingOnlyBatch(
        { items: [{ slug, expected_content_fingerprint: fp }] },
        ds,
        {
          reviewer: 'GV',
          approvedAt: '2026-09-12',
          dryRun: false,
          apply: true,
          confirmProductionBinding: true,
          allowApplyArchitecture: false,
        },
      ),
    ).rejects.toThrow(/RC004_BINDING_ONLY_APPLY_BLOCKED_CAS_UNAVAILABLE/);
  });

  it('CAS conflict em apply mode', async () => {
    const slug = 'imunizacao-test';
    const fp = fingerprintConteudoJson(GOLDEN);
    const ds: BindingOnlyDataSource = {
      fetchRowBySlug: async () => rowFromPayload(slug, GOLDEN),
    };
    const batch = await runRc004BindingOnlyBatch(
      { items: [{ slug, expected_content_fingerprint: fp }] },
      ds,
      {
        reviewer: 'GV',
        approvedAt: '2026-09-12',
        dryRun: false,
        apply: true,
        confirmProductionBinding: true,
        allowApplyArchitecture: true,
      },
      {
        updateConteudoJsonCas: async () => ({ updated: false, error: 'conflict' }),
        reReadRowBySlug: async () => rowFromPayload(slug, GOLDEN),
      },
    );
    expect(batch.totals.failed).toBe(1);
    expect(batch.results[0].code).toBe('CAS_CONFLICT');
  });

  it('CAS success + post-write verify', async () => {
    const slug = 'imunizacao-test';
    let stored = GOLDEN;
    const ds: BindingOnlyDataSource = {
      fetchRowBySlug: async () => rowFromPayload(slug, stored),
    };
    const batch = await runRc004BindingOnlyBatch(
      { items: [{ slug, expected_content_fingerprint: fingerprintConteudoJson(GOLDEN) }] },
      ds,
      {
        reviewer: 'GV',
        approvedAt: '2026-09-12',
        dryRun: false,
        apply: true,
        confirmProductionBinding: true,
        allowApplyArchitecture: true,
      },
      {
        updateConteudoJsonCas: async ({ nextConteudoJson }) => {
          stored = nextConteudoJson;
          return { updated: true };
        },
        reReadRowBySlug: async () => rowFromPayload(slug, stored),
      },
    );
    expect(batch.productionWrites).toBe(1);
    expect(batch.totals.would_bind).toBe(1);
    const ec = (stored as { meta?: { efficacy_contract?: { approved_content_fingerprint?: string } } })
      .meta?.efficacy_contract;
    expect(ec?.approved_content_fingerprint).toBe(fingerprintConteudoJson(GOLDEN));
  });

  it('discoverBindingOnlyCas documenta JSONB conditional sem migration', () => {
    const cas = discoverBindingOnlyCasPrimitive();
    expect(cas.primitive).toBe('SAFE_CONDITIONAL_UPDATE_AVAILABLE');
    expect(cas.mode).toBe('JSONB_EQUALITY_CONDITIONAL');
    expect(cas.applyImplementationStatus).toBe('BLOCKED_CAS_REQUIRES_SEPARATE_DECISION');
  });
});
