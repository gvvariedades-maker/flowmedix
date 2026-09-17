jest.mock('@/lib/cache', () => ({
  invalidateModulosCache: jest.fn(async () => undefined),
  invalidateQuestoesCache: jest.fn(async () => undefined),
  invalidateQuestaoSlugsCache: jest.fn(async () => undefined),
}));

jest.mock('@/lib/concursos/entitlements', () => ({
  getDefaultConcursoId: jest.fn(async () => 'concurso-test'),
  linkModuloToConcurso: jest.fn(async () => undefined),
}));

jest.mock('@/lib/contentHash', () => ({
  generateContentHash: jest.fn(async () => 'hash-test'),
}));

import fs from 'node:fs';
import path from 'node:path';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  applyLoteToSupabase,
  evaluateEditorialApprovalGate,
} from '@/lib/catalogMigration/applyLote';
import {
  computeCandidateSha256,
  EVIDENCE_POLICY_ID,
  type AgentReviewArtifact,
} from '@/lib/catalogMigration/evidenceGovernedApproval';
import * as evidenceModule from '@/lib/catalogMigration/evidenceGovernedApproval';
import {
  validateAndNormalizeQuestao,
  type ValidatedQuestao,
} from '@/lib/catalogMigration/validatePayload';

function highRiskPayload(): ValidatedQuestao {
  const file = path.join(
    process.cwd(),
    'examples/questao-premium-amauc-imunizacao-bcg-dose-a4.json',
  );
  return JSON.parse(fs.readFileSync(file, 'utf8')) as ValidatedQuestao;
}

function mockSupabaseDryRun() {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: { id: 'row-1', conteudo_json: {} },
            error: null,
          }),
        }),
      }),
      update: () => ({
        eq: async () => ({ error: null }),
      }),
      insert: () => ({
        select: () => ({
          single: async () => ({ data: { id: 'new-1' }, error: null }),
        }),
      }),
    }),
  };
}

describe('applyLoteToSupabase — mandatory editorial gate', () => {
  const slug = 'bcg-dose-test-slug';
  const payload = highRiskPayload();

  it('bloqueia evidence_required com riskApprovalGate=false', async () => {
    const { results, appliedSlugs } = await applyLoteToSupabase(
      mockSupabaseDryRun() as never,
      [{ modulo_slug: slug, payload }],
      {
        dryRun: true,
        strictGabarito: false,
        allowInsert: false,
        premiumGate: false,
        riskApprovalGate: false,
        riskContext: { productionReady: false, autoApprovalEnabled: true },
      },
    );
    expect(appliedSlugs).toHaveLength(0);
    expect(results[0]?.status).toBe('failed');
    expect(results[0]?.approval_mode).toBe('evidence_required');
    expect(results[0]?.detail).toMatch(/risk approval/);
  });

  it('bloqueia evidence_required com riskApprovalGate omitido', async () => {
    const { results } = await applyLoteToSupabase(
      mockSupabaseDryRun() as never,
      [{ modulo_slug: slug, payload }],
      {
        dryRun: true,
        strictGabarito: false,
        allowInsert: false,
        premiumGate: false,
        riskContext: { productionReady: false, autoApprovalEnabled: true },
      },
    );
    expect(results[0]?.status).toBe('failed');
    expect(results[0]?.approval_mode).toBe('evidence_required');
  });

  it('--skip-risk-approval não bypassa evidence_required no apply', async () => {
    const { results } = await applyLoteToSupabase(
      mockSupabaseDryRun() as never,
      [{ modulo_slug: slug, payload }],
      {
        dryRun: true,
        strictGabarito: false,
        allowInsert: false,
        premiumGate: false,
        riskApprovalGate: false,
        allowSkipRiskApproval: true,
        riskContext: { productionReady: false, autoApprovalEnabled: true },
      },
    );
    expect(results[0]?.status).toBe('failed');
    expect(results[0]?.approval_mode).toBe('evidence_required');
  });

  it('baixo/auto passa com riskApprovalGate=false', async () => {
    const low: ValidatedQuestao = {
      meta: {
        banca: 'EBSERH',
        topico: 'Enfermagem',
        subtopico: 'História da Enfermagem',
      },
      question_data: {
        instruction: 'Sobre história da enfermagem, assinale a correta.',
        options: [
          { id: 'A', text: 'Florence Nightingale', is_correct: true },
          { id: 'B', text: 'Outra', is_correct: false },
        ],
      },
      reverse_study_slides: [],
    };
    const { results, appliedSlugs } = await applyLoteToSupabase(
      mockSupabaseDryRun() as never,
      [{ modulo_slug: 'low-risk-slug', payload: low }],
      {
        dryRun: true,
        strictGabarito: false,
        allowInsert: false,
        premiumGate: false,
        riskApprovalGate: false,
        riskContext: { productionReady: true, autoApprovalEnabled: true },
      },
    );
    expect(results[0]?.status).toBe('ok');
    expect(appliedSlugs).toHaveLength(0);
  });
});

describe('applyLote — TOCTOU binding', () => {
  it('candidato mutado após gate invalida boundCandidateSha256', () => {
    const low: ValidatedQuestao = {
      meta: {
        banca: 'EBSERH',
        topico: 'Enfermagem',
        subtopico: 'História da Enfermagem',
      },
      question_data: {
        instruction: 'Sobre história da enfermagem, assinale a correta.',
        options: [
          { id: 'A', text: 'Florence Nightingale', is_correct: true },
          { id: 'B', text: 'Outra', is_correct: false },
        ],
      },
      reverse_study_slides: [],
    };
    const editorial = evaluateEditorialApprovalGate('toctou-slug', low, {
      riskApprovalGate: false,
      riskContext: { productionReady: true, autoApprovalEnabled: true },
    });
    low.question_data.instruction = 'instrução mutada após gate';
    expect(evidenceModule.computeCandidateSha256(low)).not.toBe(editorial.boundCandidateSha256);
  });
});

function reviewArtifact(
  overrides: Partial<AgentReviewArtifact> = {},
): AgentReviewArtifact {
  const candidate = highRiskPayload();
  const sha = computeCandidateSha256(candidate);
  return {
    schema_version: '1.0',
    review_type: 'primary',
    review_id: 'rev-primary-apply',
    reviewer_id: 'agent:primary-reviewer',
    slug: 'bcg-dose-test-slug',
    candidate_sha256: sha,
    decision: 'APPROVE',
    confidence: 'alta',
    answer_verified: true,
    pedagogy_verified: true,
    source_verification: {
      performed: true,
      vigency_checked: true,
      applicability_checked: true,
      conflict_search_performed: true,
    },
    claims: [
      {
        claim_id: 'c1',
        claim: 'Dose BCG conforme PNI',
        critical: true,
        supported: true,
        source_ids: ['s1'],
      },
    ],
    findings: [],
    blockers: [],
    unresolved_disagreements: [],
    ...overrides,
  };
}

describe('catalog apply load → applyLote positive-path plumbing', () => {
  const slug = 'bcg-dose-test-slug';
  const manifestDir = join(process.cwd(), 'artifacts', 'evidence-reviews', 'apply-lote-plumbing');
  const manifestRel = 'artifacts/evidence-reviews/apply-lote-plumbing/manifest.json';

  beforeAll(() => {
    mkdirSync(manifestDir, { recursive: true });
  });

  afterAll(() => {
    rmSync(manifestDir, { recursive: true, force: true });
  });

  it('load com mandatoryEditorialGate=false + manifest válido → dry-run ok', async () => {
    const raw = highRiskPayload();
    const loaded = validateAndNormalizeQuestao(slug, raw, { mandatoryEditorialGate: false });
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;

    const candidateSha = computeCandidateSha256(loaded.data);
    const primary = reviewArtifact({
      slug,
      candidate_sha256: candidateSha,
      review_type: 'primary',
      review_id: 'plumb-p1',
      reviewer_id: 'agent:plumb-primary',
    });
    const adversarial = reviewArtifact({
      slug,
      candidate_sha256: candidateSha,
      review_type: 'adversarial',
      review_id: 'plumb-a1',
      reviewer_id: 'agent:plumb-adversarial',
    });
    writeFileSync(join(manifestDir, 'primary.json'), JSON.stringify(primary));
    writeFileSync(join(manifestDir, 'adversarial.json'), JSON.stringify(adversarial));
    writeFileSync(
      join(manifestDir, 'manifest.json'),
      JSON.stringify({
        schema_version: '1.0',
        policy: EVIDENCE_POLICY_ID,
        items: [
          {
            slug,
            candidate_sha256: candidateSha,
            primary_review_path: 'artifacts/evidence-reviews/apply-lote-plumbing/primary.json',
            adversarial_review_path:
              'artifacts/evidence-reviews/apply-lote-plumbing/adversarial.json',
          },
        ],
      }),
    );

    const { results, appliedSlugs } = await applyLoteToSupabase(
      mockSupabaseDryRun() as never,
      [{ modulo_slug: slug, payload: loaded.data }],
      {
        dryRun: true,
        strictGabarito: false,
        allowInsert: false,
        premiumGate: false,
        riskApprovalGate: true,
        riskContext: { productionReady: false, autoApprovalEnabled: true },
        evidenceManifestPath: manifestRel,
        repoRoot: process.cwd(),
      },
    );

    expect(results[0]?.status).toBe('ok');
    expect(results[0]?.mode).toBe('update');
    expect(results[0]?.detail).toMatch(/dry-run: would update/);
    expect(appliedSlugs).toHaveLength(0);

    const gate = evaluateEditorialApprovalGate(slug, loaded.data, {
      riskApprovalGate: true,
      riskContext: { productionReady: false, autoApprovalEnabled: true },
      evidenceManifestPath: manifestRel,
      repoRoot: process.cwd(),
    });
    expect(gate.risk.approval_mode).toBe('evidence_required');
    expect(gate.blockers).toHaveLength(0);
    expect(gate.evidenceStatus).toBe('PASS');
    expect(gate.primaryReviewId).toBe('plumb-p1');
    expect(gate.adversarialReviewId).toBe('plumb-a1');
  });
});

describe('evaluateEditorialApprovalGate — library caller', () => {
  it('evidence_required sempre gera blockers sem manifest', () => {
    const evalResult = evaluateEditorialApprovalGate('slug', highRiskPayload(), {
      riskApprovalGate: false,
      riskContext: { productionReady: false, autoApprovalEnabled: true },
    });
    expect(evalResult.risk.approval_mode).toBe('evidence_required');
    expect(evalResult.blockers.length).toBeGreaterThan(0);
    expect(evalResult.evidenceStatus).toBe('MISSING');
  });
});
