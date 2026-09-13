import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fingerprintConteudoJson } from '@/lib/catalogMigration/contentFingerprint';
import { stampEfficacyContentFingerprint } from '@/lib/catalogMigration/commercialContentApproval';
import {
  assertBindingOnlyReviewerPolicy,
  assertExpectedSupabaseTargetHash,
  classifyExistingCommercialBinding,
  discoverBindingOnlyCasPrimitive,
  hashSupabaseTarget,
  parseBindingOnlyManifest,
  RC004_BINDING_ONLY_DIFFERENT_REVIEWER,
  resolveEffectiveFailFast,
  resolveWriterApplyModeReport,
  runRc004BindingOnlyBatch,
  type BindingOnlyApplySink,
  type BindingOnlyDataSource,
  type ModuloEstudoBindingRow,
} from '@/lib/catalogMigration/rc004BindingOnly';
import { scoreQuestaoRisk } from '@/lib/catalogMigration/riskScoring';
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

function boundPayload(payload: unknown, reviewer: string): unknown {
  const fp = fingerprintConteudoJson(payload);
  return stampEfficacyContentFingerprint(payload as never, fp, { reviewer });
}

const APPLY_OPTS = {
  dryRun: false,
  apply: true,
  confirmProductionBinding: true,
  allowApplyArchitecture: true,
} as const;

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

  describe('TARGET GUARD (apply-only)', () => {
    it('apply sem expected hash => FAIL', () => {
      const actual = hashSupabaseTarget('https://abcdefgh.supabase.co');
      expect(assertExpectedSupabaseTargetHash(undefined, actual)).toBe(
        'RC004_BINDING_ONLY_EXPECTED_TARGET_REQUIRED',
      );
      expect(assertExpectedSupabaseTargetHash('', actual)).toBe(
        'RC004_BINDING_ONLY_EXPECTED_TARGET_REQUIRED',
      );
    });

    it('apply com hash inválido => FAIL', () => {
      const actual = hashSupabaseTarget('https://abcdefgh.supabase.co');
      expect(assertExpectedSupabaseTargetHash('not-hex', actual)).toBe(
        'RC004_BINDING_ONLY_EXPECTED_TARGET_REQUIRED',
      );
      expect(assertExpectedSupabaseTargetHash('abc', actual)).toBe(
        'RC004_BINDING_ONLY_EXPECTED_TARGET_REQUIRED',
      );
    });

    it('apply com hash divergente => FAIL', () => {
      const actual = hashSupabaseTarget('https://abcdefgh.supabase.co');
      expect(assertExpectedSupabaseTargetHash('0000000000000000', actual)).toBe(
        'RC004_BINDING_ONLY_TARGET_MISMATCH',
      );
    });

    it('apply com hash correto passa target guard e falha no próximo gate (CAS architecture)', async () => {
      const slug = 'imunizacao-test';
      const fp = fingerprintConteudoJson(GOLDEN);
      const ds: BindingOnlyDataSource = {
        fetchRowBySlug: async () => rowFromPayload(slug, GOLDEN),
      };
      const actual = hashSupabaseTarget('https://abcdefgh.supabase.co');
      expect(assertExpectedSupabaseTargetHash(actual!, actual)).toBeNull();

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

    it('dry-run continua sem write mesmo com apply sink presente', async () => {
      const slug = 'imunizacao-test';
      const fp = fingerprintConteudoJson(GOLDEN);
      const ds: BindingOnlyDataSource = {
        fetchRowBySlug: async () => rowFromPayload(slug, GOLDEN),
      };
      const batch = await runRc004BindingOnlyBatch(
        { items: [{ slug, expected_content_fingerprint: fp }] },
        ds,
        { reviewer: 'GV', approvedAt: '2026-09-12', dryRun: true },
        {
          updateConteudoJsonCas: async () => {
            throw new Error('write não deveria ocorrer');
          },
          reReadRowBySlug: async () => rowFromPayload(slug, GOLDEN),
        },
      );
      expect(batch.productionWrites).toBe(0);
      expect(batch.totals.would_bind).toBe(1);
    });
  });

  describe('WRITER_APPLY_MODE report', () => {
    it('architecture env false => BLOCKED', () => {
      expect(resolveWriterApplyModeReport({ allowApplyArchitecture: false })).toBe('BLOCKED');
    });

    it('architecture env true sem homologação CAS => READY_CODE_ONLY', () => {
      expect(resolveWriterApplyModeReport({ allowApplyArchitecture: true })).toBe('READY_CODE_ONLY');
    });

    it('nunca emite READY ou OPERATIONALLY_READY apenas por env=true', () => {
      const modes = new Set<string>();
      for (const allow of [false, true]) {
        modes.add(resolveWriterApplyModeReport({ allowApplyArchitecture: allow }));
      }
      expect(modes.has('READY')).toBe(false);
      expect(modes.has('OPERATIONALLY_READY')).toBe(false);
      expect(modes.has('ENV_ARMED_CODE_ONLY')).toBe(false);
    });
  });

  describe('REGISTRY fail-closed', () => {
    it('pacote conhecido => PASS', async () => {
      const slug = 'imunizacao-known';
      const fp = fingerprintConteudoJson(GOLDEN);
      const ds: BindingOnlyDataSource = {
        fetchRowBySlug: async () => rowFromPayload(slug, GOLDEN),
      };
      const batch = await runRc004BindingOnlyBatch(
        { items: [{ slug, expected_content_fingerprint: fp }] },
        ds,
        { reviewer: 'GV', approvedAt: '2026-09-12', dryRun: true },
      );
      expect(batch.totals.failed).toBe(0);
      expect(batch.totals.would_bind).toBe(1);
    });

    it('subtópico desconhecido => FAIL_CLOSED sem fallback otimista', async () => {
    const slug = 'orphan-slug';
    const orphan = {
      ...GOLDEN,
      meta: { ...GOLDEN.meta, subtopico: 'Subtópico Inexistente XYZ' },
    };
    const fp = fingerprintConteudoJson(orphan);
    const ds: BindingOnlyDataSource = {
      fetchRowBySlug: async () => ({
        id: 'id-1',
        modulo_slug: slug,
        titulo_aula: 'Subtópico Inexistente XYZ',
        conteudo_json: orphan,
      }),
    };
    const batch = await runRc004BindingOnlyBatch(
      { items: [{ slug, expected_content_fingerprint: fp }] },
      ds,
      { reviewer: 'GV', approvedAt: '2026-09-12', dryRun: true },
    );
      expect(batch.totals.failed).toBe(1);
      expect(batch.results[0].code).toBe('RC004_BINDING_ONLY_REGISTRY_NOT_FOUND');
      expect(batch.results[0].stampSimulated).toBeUndefined();
      expect(batch.productionWrites).toBe(0);
    });
  });

  describe('M2 — rebind policy', () => {
    it('M2-A: valid binding same reviewer => already_bound_valid, zero writes', async () => {
      const slug = 'm2-a';
      const bound = boundPayload(GOLDEN, 'GV');
      const fp = fingerprintConteudoJson(bound);
      let writeCalls = 0;
      const ds: BindingOnlyDataSource = {
        fetchRowBySlug: async () => rowFromPayload(slug, bound),
      };
      const batch = await runRc004BindingOnlyBatch(
        { items: [{ slug, expected_content_fingerprint: fp }] },
        ds,
        { reviewer: 'GV', approvedAt: '2026-09-12', dryRun: true },
        {
          updateConteudoJsonCas: async () => {
            writeCalls += 1;
            return { updated: true };
          },
          reReadRowBySlug: async () => rowFromPayload(slug, bound),
        },
      );
      expect(batch.results[0]?.status).toBe('already_bound_valid');
      expect(batch.productionWrites).toBe(0);
      expect(writeCalls).toBe(0);
    });

    it('M2-B: valid binding different reviewer => already_bound_different_reviewer, zero writes', async () => {
      const slug = 'm2-b';
      const bound = boundPayload(GOLDEN, 'PC');
      const fp = fingerprintConteudoJson(bound);
      let writeCalls = 0;
      const ds: BindingOnlyDataSource = {
        fetchRowBySlug: async () => rowFromPayload(slug, bound),
      };
      const batch = await runRc004BindingOnlyBatch(
        { items: [{ slug, expected_content_fingerprint: fp }] },
        ds,
        { reviewer: 'GV', approvedAt: '2026-09-12', dryRun: true },
        {
          updateConteudoJsonCas: async () => {
            writeCalls += 1;
            return { updated: true };
          },
          reReadRowBySlug: async () => rowFromPayload(slug, bound),
        },
      );
      expect(batch.results[0]?.status).toBe('already_bound_different_reviewer');
      expect(batch.results[0]?.code).toBe(RC004_BINDING_ONLY_DIFFERENT_REVIEWER);
      expect(batch.productionWrites).toBe(0);
      expect(writeCalls).toBe(0);
    });

    it('M2-C: different reviewer em dry-run continua avaliando próximo item', async () => {
      const slugA = 'm2-c-a';
      const slugB = 'm2-c-b';
      const boundA = boundPayload(GOLDEN, 'PC');
      const fpA = fingerprintConteudoJson(boundA);
      const fpB = fingerprintConteudoJson(GOLDEN);
      const ds: BindingOnlyDataSource = {
        fetchRowBySlug: async (slug) => {
          if (slug === slugA) return rowFromPayload(slugA, boundA);
          if (slug === slugB) return rowFromPayload(slugB, GOLDEN);
          return null;
        },
      };
      const batch = await runRc004BindingOnlyBatch(
        {
          items: [
            { slug: slugA, expected_content_fingerprint: fpA },
            { slug: slugB, expected_content_fingerprint: fpB },
          ],
        },
        ds,
        { reviewer: 'GV', approvedAt: '2026-09-12', dryRun: true },
      );
      expect(batch.results).toHaveLength(2);
      expect(batch.results[0]?.status).toBe('already_bound_different_reviewer');
      expect(batch.results[1]?.status).toBe('would_bind');
      expect(batch.productionWrites).toBe(0);
    });

    it('M2-D: different reviewer em apply aborta itens seguintes', async () => {
      const slugA = 'm2-d-a';
      const slugB = 'm2-d-b';
      const boundA = boundPayload(GOLDEN, 'PC');
      const fpA = fingerprintConteudoJson(boundA);
      const fpB = fingerprintConteudoJson(GOLDEN);
      const ds: BindingOnlyDataSource = {
        fetchRowBySlug: async (slug) => {
          if (slug === slugA) return rowFromPayload(slugA, boundA);
          if (slug === slugB) return rowFromPayload(slugB, GOLDEN);
          return null;
        },
      };
      const batch = await runRc004BindingOnlyBatch(
        {
          items: [
            { slug: slugA, expected_content_fingerprint: fpA },
            { slug: slugB, expected_content_fingerprint: fpB },
          ],
        },
        ds,
        { reviewer: 'GV', approvedAt: '2026-09-12', ...APPLY_OPTS },
        {
          updateConteudoJsonCas: async () => ({ updated: true }),
          reReadRowBySlug: async (slug) => {
            if (slug === slugA) return rowFromPayload(slugA, boundA);
            return rowFromPayload(slugB, GOLDEN);
          },
        },
      );
      expect(batch.results).toHaveLength(1);
      expect(batch.results[0]?.status).toBe('already_bound_different_reviewer');
      expect(batch.report.abortedAfterFailure).toBe(true);
      expect(batch.productionWrites).toBe(0);
    });

    it('M2-E: stale binding não classifica como reviewer conflict', async () => {
      const slug = 'm2-e';
      const fp = fingerprintConteudoJson(GOLDEN);
      const stale = {
        ...GOLDEN,
        meta: {
          ...GOLDEN.meta,
          efficacy_contract: {
            a4_reviewed: true,
            a4_reviewer: 'PC',
            approved_content_fingerprint: 'b'.repeat(64),
            auto_approved_at: '2026-09-08',
          },
        },
      };
      const risk = scoreQuestaoRisk(GOLDEN as never);
      expect(
        classifyExistingCommercialBinding(stale, fp, 'GV', risk).kind,
      ).toBe('not_already_bound');
      const batch = await runRc004BindingOnlyBatch(
        { items: [{ slug, expected_content_fingerprint: fp }] },
        {
          fetchRowBySlug: async () => rowFromPayload(slug, stale),
        },
        { reviewer: 'GV', approvedAt: '2026-09-12', dryRun: true },
      );
      expect(batch.results[0]?.status).not.toBe('already_bound_different_reviewer');
      expect(batch.totals.would_bind).toBe(1);
    });

    it('M2-F: fingerprint mismatch preserva segurança existente', async () => {
      const slug = 'm2-f';
      const bound = boundPayload(GOLDEN, 'PC');
      const ds: BindingOnlyDataSource = {
        fetchRowBySlug: async () => rowFromPayload(slug, bound),
      };
      const batch = await runRc004BindingOnlyBatch(
        { items: [{ slug, expected_content_fingerprint: 'a'.repeat(64) }] },
        ds,
        { reviewer: 'GV', approvedAt: '2026-09-12', dryRun: true },
      );
      expect(batch.results[0]?.code).toBe('EXPECTED_CONTENT_FINGERPRINT_MISMATCH');
      expect(batch.results[0]?.status).toBe('failed');
    });
  });

  describe('M3 — PER_ITEM fail-fast e partial writes', () => {
    it('M3-A: dry-run avalia item após falha do anterior', async () => {
      const slugA = 'm3-a-miss';
      const slugB = 'm3-a-ok';
      const fpB = fingerprintConteudoJson(GOLDEN);
      const batch = await runRc004BindingOnlyBatch(
        {
          items: [
            { slug: slugA, expected_content_fingerprint: fpB },
            { slug: slugB, expected_content_fingerprint: fpB },
          ],
        },
        {
          fetchRowBySlug: async (slug) =>
            slug === slugB ? rowFromPayload(slugB, GOLDEN) : null,
        },
        { reviewer: 'GV', approvedAt: '2026-09-12', dryRun: true },
      );
      expect(batch.results).toHaveLength(2);
      expect(batch.results[0]?.status).toBe('failed');
      expect(batch.results[1]?.status).toBe('would_bind');
      expect(batch.productionWrites).toBe(0);
      expect(batch.report.applyFailFast).toBe(false);
      expect(batch.report.abortedAfterFailure).toBe(false);
    });

    it('M3-B: apply aborta após primeira falha', async () => {
      const slugA = 'm3-b-miss';
      const slugB = 'm3-b-ok';
      const fpB = fingerprintConteudoJson(GOLDEN);
      const batch = await runRc004BindingOnlyBatch(
        {
          items: [
            { slug: slugA, expected_content_fingerprint: fpB },
            { slug: slugB, expected_content_fingerprint: fpB },
          ],
        },
        {
          fetchRowBySlug: async (slug) =>
            slug === slugB ? rowFromPayload(slugB, GOLDEN) : null,
        },
        { reviewer: 'GV', approvedAt: '2026-09-12', ...APPLY_OPTS },
        {
          updateConteudoJsonCas: async () => ({ updated: true }),
          reReadRowBySlug: async (slug) => rowFromPayload(slug, GOLDEN),
        },
      );
      expect(batch.results).toHaveLength(1);
      expect(batch.report.applyFailFast).toBe(true);
      expect(batch.report.abortedAfterFailure).toBe(true);
    });

    it('M3-C: apply reporta partial writes após CAS_CONFLICT', async () => {
      const slugA = 'm3-c-1';
      const slugB = 'm3-c-2';
      const slugC = 'm3-c-3';
      const fp = fingerprintConteudoJson(GOLDEN);
      const store = new Map<string, unknown>([
        [slugA, GOLDEN],
        [slugB, GOLDEN],
        [slugC, GOLDEN],
      ]);
      let casCalls = 0;
      const ds: BindingOnlyDataSource = {
        fetchRowBySlug: async (slug) => {
          const payload = store.get(slug);
          return payload ? rowFromPayload(slug, payload) : null;
        },
      };
      const sink: BindingOnlyApplySink = {
        updateConteudoJsonCas: async ({ nextConteudoJson, id }) => {
          casCalls += 1;
          if (casCalls === 1) {
            const slug = id.replace('id-', '');
            store.set(slug, nextConteudoJson);
            return { updated: true };
          }
          return { updated: false, error: 'conflict' };
        },
        reReadRowBySlug: async (slug) => {
          const payload = store.get(slug);
          return payload ? rowFromPayload(slug, payload) : null;
        },
      };
      const batch = await runRc004BindingOnlyBatch(
        {
          items: [
            { slug: slugA, expected_content_fingerprint: fp },
            { slug: slugB, expected_content_fingerprint: fp },
            { slug: slugC, expected_content_fingerprint: fp },
          ],
        },
        ds,
        { reviewer: 'GV', approvedAt: '2026-09-12', ...APPLY_OPTS, failFast: false },
        sink,
      );
      expect(batch.results).toHaveLength(2);
      expect(batch.results[0]?.status).toBe('would_bind');
      expect(batch.results[1]?.code).toBe('CAS_CONFLICT');
      expect(batch.productionWrites).toBe(1);
      expect(batch.report.successfulWrites).toBe(1);
      expect(batch.report.partialWritesCount).toBe(1);
      expect(batch.report.abortedAfterFailure).toBe(true);
      expect(batch.report.failedCode).toBe('CAS_CONFLICT');
    });

    it('M3-D: apply com failFast=false ainda força effective fail-fast', () => {
      expect(
        resolveEffectiveFailFast({
          reviewer: 'GV',
          approvedAt: '2026-09-12',
          dryRun: false,
          apply: true,
          failFast: false,
        }),
      ).toBe(true);
      expect(
        resolveEffectiveFailFast({
          reviewer: 'GV',
          approvedAt: '2026-09-12',
          dryRun: true,
          failFast: false,
        }),
      ).toBe(false);
    });

    it('M3-E: apply sem confirmação permanece fail-closed', async () => {
      const slug = 'm3-e';
      const fp = fingerprintConteudoJson(GOLDEN);
      await expect(
        runRc004BindingOnlyBatch(
          { items: [{ slug, expected_content_fingerprint: fp }] },
          { fetchRowBySlug: async () => rowFromPayload(slug, GOLDEN) },
          {
            reviewer: 'GV',
            approvedAt: '2026-09-12',
            dryRun: false,
            apply: true,
            confirmProductionBinding: false,
            allowApplyArchitecture: true,
            failFast: false,
          },
        ),
      ).rejects.toThrow(/PRODUCTION_BINDING_REQUIRES_EXPLICIT_CONFIRMATION/);
    });
  });
});
