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
import {
  applyLoteToSupabase,
  evaluateEditorialApprovalGate,
} from '@/lib/catalogMigration/applyLote';
import * as evidenceModule from '@/lib/catalogMigration/evidenceGovernedApproval';
import type { ValidatedQuestao } from '@/lib/catalogMigration/validatePayload';

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
