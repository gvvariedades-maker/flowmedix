import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import {
  computeCandidateSha256,
  EVIDENCE_POLICY_ID,
  resolveSafeEvidenceArtifactPath,
  resolveTrustedEvidenceForSlug,
  verifyEvidenceGovernedApproval,
  type AgentReviewArtifact,
} from '@/lib/catalogMigration/evidenceGovernedApproval';
import {
  assertApprovalGate,
  requiresEvidenceApproval,
  requiresHumanApproval,
  type RiskResult,
} from '@/lib/catalogMigration/riskScoring';
import { issueServerCommercialApproval } from '@/lib/catalogMigration/commercialApprovalWriteBoundary';
import { validateQuestaoForWrite } from '@/lib/questaoSpec';
import { WRITE_SPEC_TEST_QUESTION } from '@/lib/questaoSpec/testFixtures';

const REPO = join(process.cwd(), '__tests__', 'fixtures', 'evidence-governed');
const ARTIFACTS = join(REPO, 'artifacts', 'evidence-reviews');

function baseReview(overrides: Partial<AgentReviewArtifact> = {}): AgentReviewArtifact {
  const candidate = { meta: { banca: 'X' }, question_data: { instruction: 'q' } };
  const sha = computeCandidateSha256(candidate);
  return {
    schema_version: '1.0',
    review_type: 'primary',
    review_id: 'rev-primary-001',
    reviewer_id: 'agent:primary-reviewer',
    slug: 'slug-test',
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
        claim: 'Afirmação crítica',
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

describe('evidenceGovernedApproval', () => {
  const candidate = {
    meta: { banca: 'X', topico: 'Enfermagem', subtopico: 'Anatomia' },
    question_data: {
      instruction: 'Pergunta',
      options: [{ id: 'A', text: 'ok', is_correct: true }],
    },
    reverse_study_slides: [],
  };
  const candidateSha = computeCandidateSha256(candidate);

  beforeAll(() => {
    mkdirSync(ARTIFACTS, { recursive: true });
  });

  afterAll(() => {
    rmSync(REPO, { recursive: true, force: true });
  });

  it('happy path PASS com primary e adversarial distintos', () => {
    const primary = baseReview({
      slug: 'slug-test',
      candidate_sha256: candidateSha,
      review_type: 'primary',
      review_id: 'p1',
      reviewer_id: 'agent:primary-a',
    });
    const adversarial = baseReview({
      slug: 'slug-test',
      candidate_sha256: candidateSha,
      review_type: 'adversarial',
      review_id: 'a1',
      reviewer_id: 'agent:adversarial-b',
    });
    const result = verifyEvidenceGovernedApproval({
      slug: 'slug-test',
      candidate,
      primaryReview: primary,
      primaryFileSha256: 'hash-primary',
      adversarialReview: adversarial,
      adversarialFileSha256: 'hash-adversarial',
    });
    expect(result.approved).toBe(true);
    expect(result.status).toBe('PASS');
  });

  it('bloqueia candidate hash mismatch (STALE)', () => {
    const primary = baseReview({ candidate_sha256: 'a'.repeat(64) });
    const adversarial = baseReview({
      review_type: 'adversarial',
      review_id: 'a2',
      reviewer_id: 'agent:adv-2',
      candidate_sha256: 'a'.repeat(64),
    });
    const result = verifyEvidenceGovernedApproval({
      slug: 'slug-test',
      candidate,
      primaryReview: primary,
      primaryFileSha256: 'h1',
      adversarialReview: adversarial,
      adversarialFileSha256: 'h2',
    });
    expect(result.approved).toBe(false);
    expect(result.status).toBe('STALE');
  });

  it('bloqueia mesmo reviewer_id', () => {
    const primary = baseReview({ review_id: 'p1', reviewer_id: 'agent:same' });
    const adversarial = baseReview({
      review_type: 'adversarial',
      review_id: 'a1',
      reviewer_id: 'agent:same',
      candidate_sha256: candidateSha,
    });
    const result = verifyEvidenceGovernedApproval({
      slug: 'slug-test',
      candidate,
      primaryReview: { ...primary, candidate_sha256: candidateSha },
      primaryFileSha256: 'h1',
      adversarialReview: adversarial,
      adversarialFileSha256: 'h2',
    });
    expect(result.codes).toContain('EVIDENCE_DUPLICATE_REVIEWER_ID');
    expect(result.approved).toBe(false);
  });

  it('bloqueia path traversal no manifest', () => {
    const resolved = resolveSafeEvidenceArtifactPath(REPO, '../../../etc/passwd');
    expect(resolved.ok).toBe(false);
    if (!resolved.ok) {
      expect(resolved.code).toBe('EVIDENCE_PATH_TRAVERSAL');
    }
  });

  it('bloqueia path absoluto fora da raiz permitida', () => {
    const outside = resolve(process.cwd(), 'package.json');
    const resolved = resolveSafeEvidenceArtifactPath(process.cwd(), outside);
    expect(resolved.ok).toBe(false);
    if (!resolved.ok) {
      expect(resolved.code).toBe('EVIDENCE_PATH_NOT_ALLOWED');
    }
  });

  it('bloqueia path relativo fora de artifacts permitidos', () => {
    const resolved = resolveSafeEvidenceArtifactPath(process.cwd(), 'lib/catalogMigration/riskScoring.ts');
    expect(resolved.ok).toBe(false);
    if (!resolved.ok) {
      expect(resolved.code).toBe('EVIDENCE_PATH_NOT_ALLOWED');
    }
  });

  it('resolveTrustedEvidenceForSlug PASS via manifest', () => {
    const slug = 'manifest-slug-test';
    const candidateSha = computeCandidateSha256(candidate);
    const primary = baseReview({
      slug,
      candidate_sha256: candidateSha,
      review_type: 'primary',
      review_id: 'manifest-p1',
      reviewer_id: 'agent:manifest-primary',
    });
    const adversarial = baseReview({
      slug,
      candidate_sha256: candidateSha,
      review_type: 'adversarial',
      review_id: 'manifest-a1',
      reviewer_id: 'agent:manifest-adversarial',
    });
    const primaryRel = 'artifacts/evidence-reviews/test-fixture/primary.json';
    const adversarialRel = 'artifacts/evidence-reviews/test-fixture/adversarial.json';
    const manifestRel = 'artifacts/evidence-reviews/test-fixture/manifest.json';
    const manifestDir = join(process.cwd(), 'artifacts', 'evidence-reviews', 'test-fixture');
    mkdirSync(manifestDir, { recursive: true });
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
            primary_review_path: primaryRel,
            adversarial_review_path: adversarialRel,
          },
        ],
      }),
    );

    const result = resolveTrustedEvidenceForSlug({
      repoRoot: process.cwd(),
      manifestPath: manifestRel,
      slug,
      candidate,
    });
    expect(result.approved).toBe(true);
    expect(result.status).toBe('PASS');
    rmSync(manifestDir, { recursive: true, force: true });
  });

  it.each([
    ['primary REJECT', { decision: 'REJECT' as const }, {}],
    ['adversarial REJECT', {}, { decision: 'REJECT' as const }],
    ['REQUEST_CHANGES', { decision: 'REQUEST_CHANGES' as const }, {}],
    [
      'source verification incompleta',
      {
        source_verification: {
          performed: false,
          vigency_checked: false,
          applicability_checked: false,
          conflict_search_performed: false,
        },
      },
      {},
    ],
    ['claim crítico sem suporte', { claims: [{ claim_id: 'c1', claim: 'x', critical: true, supported: false, source_ids: ['s1'] }] }, {}],
    ['claim crítico sem source', { claims: [{ claim_id: 'c1', claim: 'x', critical: true, supported: true, source_ids: [] }] }, {}],
    ['blocker presente', { blockers: ['dose divergente'] }, {}],
    ['disagreement não resolvido', { unresolved_disagreements: ['gabarito'] }, {}],
    ['confidence baixa', { confidence: 'baixa' as const }, {}],
    ['mesmo review_id', { review_id: 'dup-id' }, { review_id: 'dup-id' }],
  ] as Array<[string, Partial<AgentReviewArtifact>, Partial<AgentReviewArtifact>]>)(
    'fail case: %s',
    (_label, primaryOverrides, adversarialOverrides) => {
    const primary = baseReview({
      candidate_sha256: candidateSha,
      review_id: 'fail-p',
      reviewer_id: 'agent:fail-primary',
      ...primaryOverrides,
    });
    const adversarial = baseReview({
      candidate_sha256: candidateSha,
      review_type: 'adversarial',
      review_id: 'fail-a',
      reviewer_id: 'agent:fail-adversarial',
      ...adversarialOverrides,
    });
    const result = verifyEvidenceGovernedApproval({
      slug: 'slug-test',
      candidate,
      primaryReview: primary,
      primaryFileSha256: 'hash-p',
      adversarialReview: adversarial,
      adversarialFileSha256: 'hash-a',
    });
    expect(result.approved).toBe(false);
    },
  );

  it('bloqueia spoof evidence_approved no payload', () => {
    const forged = {
      ...WRITE_SPEC_TEST_QUESTION,
      meta: { ...WRITE_SPEC_TEST_QUESTION.meta, evidence_approved: true },
    };
    const result = validateQuestaoForWrite(forged as never);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.code === 'evidence_approval_spoof_untrusted')).toBe(true);
    }
  });
});

describe('assertApprovalGate — evidence_required', () => {
  const evidenceRisk: RiskResult = {
    risk_tier: 'alto',
    approval_mode: 'evidence_required',
    risk_factors: ['numeric_claim_critical'],
    reasons: ['dose'],
  };

  it('requiresEvidenceApproval true e requiresHumanApproval false', () => {
    expect(requiresEvidenceApproval(evidenceRisk)).toBe(true);
    expect(requiresHumanApproval(evidenceRisk)).toBe(false);
  });

  it('bloqueia sem evidência nem humano', () => {
    expect(assertApprovalGate({ meta: {} }, evidenceRisk).length).toBeGreaterThan(0);
  });

  it('PASS com trusted evidence', () => {
    const trusted = {
      status: 'PASS' as const,
      primary_review_id: 'p1',
      adversarial_review_id: 'a1',
      candidate_sha256: 'abc',
      codes: ['EVIDENCE_GOVERNED_PASS'],
    };
    expect(assertApprovalGate({ meta: {} }, evidenceRisk, trusted)).toEqual([]);
  });

  it('--skip-risk-approval não bypassa evidence_required', () => {
    expect(
      assertApprovalGate({ meta: {} }, evidenceRisk, null, { allowSkipRiskApproval: true }).length,
    ).toBeGreaterThan(0);
  });

  it('--skip-risk-approval bypassa auto', () => {
    const autoRisk: RiskResult = {
      risk_tier: 'baixo',
      approval_mode: 'auto',
      risk_factors: [],
      reasons: [],
    };
    expect(assertApprovalGate({ meta: {} }, autoRisk, null, { allowSkipRiskApproval: true })).toEqual(
      [],
    );
  });
});

describe('commercial boundary — evidence editorial ≠ RC004 binding', () => {
  it('EVIDENCE editorial PASS não carimba commercial fingerprint', () => {
    const payload = {
      meta: {
        banca: 'X',
        topico: 'Enfermagem',
        subtopico: 'Anatomia',
        family: 'calc',
        content_review: { reviewed_at: '2026-01-01', guideline_snapshot: 'x', exam_vs_current: 'none' },
        sources: [{ id: 's1', tier: 'A', issuer: 'MS', title: 'T', year: 2025, covers: ['dose'] }],
      },
      question_data: {
        instruction: 'Calcule 10 mg',
        options: [{ id: 'A', text: '10 mg', is_correct: true }],
      },
      reverse_study_slides: [
        { type: 'concept_map', items: [{ label: 'a', detail: 'b', icon: 'Target' }] },
        { type: 'logic_flow', reveal_mode: 'tap', steps: ['1', '2', '3', '4'] },
        { type: 'golden_rule', content: 'REGRA' },
        { type: 'danger_zone', content: 'z', items: [{ label: 'A', detail: 'd', correct: 'c' }] },
      ],
    };
    const trusted = {
      status: 'PASS' as const,
      primary_review_id: 'p1',
      adversarial_review_id: 'a1',
      candidate_sha256: computeCandidateSha256(payload),
      codes: ['EVIDENCE_GOVERNED_PASS'],
    };
    const issued = issueServerCommercialApproval({
      payload: payload as never,
      riskContext: { productionReady: true, autoApprovalEnabled: true },
      trustedEvidence: trusted,
    });
    expect(issued.stamped).toBe(false);
    expect(issued.reason).toBe('EVIDENCE_APPROVED_BUT_COMMERCIAL_BINDING_NOT_AUTHORIZED');
  });
});
