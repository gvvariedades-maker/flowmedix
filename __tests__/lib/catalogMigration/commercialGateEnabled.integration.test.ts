import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

jest.mock('@/lib/concursos/entitlements', () => ({
  userHasModuloAccess: jest.fn(async () => true),
  getAccessibleModuloSlugs: jest.fn(async () => new Set(['slug-permitido'])),
  fetchAccessibleModulosForNav: jest.fn(async () => []),
}));

jest.mock('@/lib/cache', () => ({
  getQuestaoBySlugCached: jest.fn(),
  getHistoricoQuestoesForSlugsCached: jest.fn(() => []),
  estudadosSetFromHistorico: jest.fn(() => new Set()),
}));

import {
  clearCommercialRuntimeApprovalCache,
  evaluateCommercialRuntimeApproval,
  fingerprintConteudoJson,
} from '@/lib/catalogMigration/commercialRuntimeGate';
import {
  stampEfficacyContentFingerprint,
} from '@/lib/catalogMigration/commercialContentApproval';
import {
  canServeCommercialContent,
  isModuloCommercialEligible,
} from '@/lib/catalogMigration/commercialAuthority';
import { buildEstudarQuestaoPlayerPayload } from '@/lib/estudar/questaoPlayerPayload';
import { buildSimuladoQuestaoPayload } from '@/lib/estudar/questaoSimuladoPayload';
import { userHasModuloAccess } from '@/lib/concursos/entitlements';
import { P0_DENIED_SLUGS } from '@/lib/catalogMigration/p0Denylist';

const GOLDEN_IMUNIZACAO = JSON.parse(
  readFileSync(
    resolve(process.cwd(), 'examples/questao-premium-cpcon-imunizacao-intervalos-vf.json'),
    'utf8',
  ),
);

describe('Commercial enforcement — gate LIGADO (RC-004)', () => {
  const prevGate = process.env.COMMERCIAL_RUNTIME_READINESS_GATE;

  beforeEach(() => {
    clearCommercialRuntimeApprovalCache();
    process.env.COMMERCIAL_RUNTIME_READINESS_GATE = 'true';
  });

  afterEach(() => {
    clearCommercialRuntimeApprovalCache();
    if (prevGate === undefined) delete process.env.COMMERCIAL_RUNTIME_READINESS_GATE;
    else process.env.COMMERCIAL_RUNTIME_READINESS_GATE = prevGate;
  });

  it('aprova golden Imunização com ready_100 e aprovação vinculada', () => {
    const fp = fingerprintConteudoJson(GOLDEN_IMUNIZACAO);
    const stamped = stampEfficacyContentFingerprint(GOLDEN_IMUNIZACAO, fp);
    const result = evaluateCommercialRuntimeApproval({
      slug: 'cpcon-imunizacao-intervalos-vf',
      tituloAula: 'Imunização',
      conteudoJson: stamped,
    });
    expect(result.approved).toBe(true);
    expect(result.contentFingerprint).toMatch(/^[a-f0-9]{64}$/);
  });

  it('bloqueia golden sem approved_content_fingerprint', () => {
    const result = evaluateCommercialRuntimeApproval({
      slug: 'cpcon-imunizacao-intervalos-vf',
      tituloAula: 'Imunização',
      conteudoJson: GOLDEN_IMUNIZACAO,
    });
    expect(result.approved).toBe(false);
    expect(result.reason).toBe('COMMERCIAL_APPROVAL_NOT_BOUND');
  });

  it('bloqueia subtópico fora do registry (vitrine slug-level)', () => {
    expect(
      isModuloCommercialEligible({
        slug: 'legacy-slug',
        tituloAula: 'Subtópico Legado Não Rastreado XYZ',
      }),
    ).toBe(false);
  });

  it('bloqueia conteúdo sem ready_100 em subtópico production_ready', () => {
    const result = canServeCommercialContent({
      slug: 'imunizacao-not-ready',
      tituloAula: 'Imunização',
      conteudoJson: {
        meta: { banca: 'T', topico: 'E', subtopico: 'Imunização' },
        question_data: {
          instruction: 'Pergunta',
          options: [{ id: 'A', text: 'A', is_correct: true }],
        },
        reverse_study_slides: [
          { type: 'concept_map', items: [{ label: 'A' }] },
          { type: 'logic_flow', steps: ['S'] },
          { type: 'golden_rule', content: 'G' },
          { type: 'danger_zone', content: 'D' },
        ],
      },
    });
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe('READINESS_NOT_APPROVED');
  });

  it('bloqueia todos os 16 slugs P0 denylist', () => {
    for (const slug of P0_DENIED_SLUGS) {
      expect(canServeCommercialContent({ slug }).eligible).toBe(false);
      expect(isModuloCommercialEligible({ slug })).toBe(false);
    }
  });

  it('bloqueia envelope cru', () => {
    const result = canServeCommercialContent({
      slug: 'env-test',
      tituloAula: 'Imunização',
      conteudoJson: {
        payload: {
          meta: { banca: 'T', topico: 'E', subtopico: 'Imunização' },
          question_data: {
            instruction: 'Q',
            options: [{ id: 'A', text: 'A', is_correct: true }],
          },
        },
      },
    });
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe('MALFORMED_CONTENT');
  });

  it('bloqueia gabarito ausente', () => {
    const result = canServeCommercialContent({
      slug: 'no-correct',
      tituloAula: 'Imunização',
      conteudoJson: {
        question_data: {
          instruction: 'Q',
          options: [
            { id: 'A', text: 'A', is_correct: false },
            { id: 'B', text: 'B', is_correct: false },
          ],
        },
      },
    });
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe('NO_CORRECT_ANSWER');
  });

  it('bloqueia figura obrigatória ausente', () => {
    const result = canServeCommercialContent({
      slug: 'fig-missing',
      tituloAula: 'Imunização',
      conteudoJson: {
        question_data: {
          instruction: 'Observe a figura abaixo:',
          options: [{ id: 'A', text: 'A', is_correct: true }],
          figures: [],
        },
      },
    });
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe('MISSING_FIGURE');
  });

  it('admin preview permanece não comercial (bypass explícito)', () => {
    const p0 = 'inaz-do-para-enfermagem-nocoes-de-anatomia-1775448275334-4';
    const result = canServeCommercialContent({ slug: p0, isAdmin: true });
    expect(result.eligible).toBe(true);
    expect(result.reason).toBe('ADMIN_BYPASS');
  });

  it('reavalia após mutação que quebra readiness (danger_zone reciclado)', () => {
    const slug = 'cpcon-imunizacao-intervalos-vf';
    const fp = fingerprintConteudoJson(GOLDEN_IMUNIZACAO);
    const stamped = stampEfficacyContentFingerprint(GOLDEN_IMUNIZACAO, fp);
    const first = evaluateCommercialRuntimeApproval({
      slug,
      tituloAula: 'Imunização',
      conteudoJson: stamped,
    });
    expect(first.approved).toBe(true);

    const dup =
      'Mesma justificativa copiada para todas as alternativas sem personalizar o distrator.';
    const mutated = {
      ...stamped,
      reverse_study_slides: stamped.reverse_study_slides.map((s: { type: string }) =>
        s.type === 'danger_zone'
          ? {
              ...s,
              items: [
                { label: 'A', detail: 'x', correct: dup },
                { label: 'B', detail: 'y', correct: dup },
              ],
            }
          : s,
      ),
    };
    const second = evaluateCommercialRuntimeApproval({
      slug,
      tituloAula: 'Imunização',
      conteudoJson: mutated,
    });
    expect(second.approved).toBe(false);
    expect(second.reason).toBe('READINESS_NOT_APPROVED');
    expect(second.contentFingerprint).not.toBe(first.contentFingerprint);
  });

  it('bloqueia acesso direto por slug P0 no player com gate ligado', async () => {
    const deniedSlug = 'inaz-do-para-enfermagem-nocoes-de-anatomia-1775448275334-4';
    const mockSupabase: any = {
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            maybeSingle: jest.fn().mockResolvedValue({
              data: {
                id: 'mod-denied',
                modulo_slug: deniedSlug,
                titulo_aula: 'Noções de Anatomia',
                conteudo_json: GOLDEN_IMUNIZACAO,
              },
              error: null,
            }),
          })),
        })),
      })),
    };

    const res = await buildEstudarQuestaoPlayerPayload({
      slug: deniedSlug,
      userId: 'user-pro',
      isAdmin: false,
      supabase: mockSupabase,
    });
    expect(res.status).toBe('forbidden');
  });

  it('bloqueia player com golden sem approved_content_fingerprint', async () => {
    const slug = 'cpcon-imunizacao-intervalos-vf';
    const mockSupabase: any = {
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            maybeSingle: jest.fn().mockResolvedValue({
              data: {
                id: 'mod-imun',
                modulo_slug: slug,
                titulo_aula: 'Imunização',
                conteudo_json: GOLDEN_IMUNIZACAO,
              },
              error: null,
            }),
          })),
        })),
      })),
    };

    const res = await buildEstudarQuestaoPlayerPayload({
      slug,
      userId: 'user-pro',
      isAdmin: false,
      supabase: mockSupabase,
    });
    expect(res.status).toBe('forbidden');
  });

  it('permite player com golden aprovado e fingerprint vinculado', async () => {
    const slug = 'cpcon-imunizacao-intervalos-vf';
    const fp = fingerprintConteudoJson(GOLDEN_IMUNIZACAO);
    const stamped = stampEfficacyContentFingerprint(GOLDEN_IMUNIZACAO, fp);
    const mockSupabase: any = {
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            maybeSingle: jest.fn().mockResolvedValue({
              data: {
                id: 'mod-imun',
                modulo_slug: slug,
                titulo_aula: 'Imunização',
                conteudo_json: stamped,
              },
              error: null,
            }),
          })),
        })),
      })),
    };

    const res = await buildEstudarQuestaoPlayerPayload({
      slug,
      userId: 'user-pro',
      isAdmin: false,
      supabase: mockSupabase,
    });
    expect(res.status).toBe('ok');
  });

  it('bloqueia simulado sem aprovação comercial vinculada', async () => {
    const slug = 'cpcon-imunizacao-intervalos-vf';
    const mockSupabase: any = {
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            maybeSingle: jest.fn().mockResolvedValue({
              data: {
                conteudo_json: GOLDEN_IMUNIZACAO,
                titulo_aula: 'Imunização',
              },
              error: null,
            }),
          })),
        })),
      })),
    };

    const res = await buildSimuladoQuestaoPayload({
      slug,
      userId: 'user-pro',
      isAdmin: false,
      supabase: mockSupabase,
    });
    expect(res.status).toBe('forbidden');
  });

  it('bloqueia usuário Free sem entitlement mesmo com conteúdo aprovado', async () => {
    (userHasModuloAccess as jest.Mock).mockResolvedValueOnce(false);
    const slug = 'cpcon-imunizacao-intervalos-vf';
    const fp = fingerprintConteudoJson(GOLDEN_IMUNIZACAO);
    const stamped = stampEfficacyContentFingerprint(GOLDEN_IMUNIZACAO, fp);

    const res = await buildEstudarQuestaoPlayerPayload({
      slug,
      userId: 'user-free',
      isAdmin: false,
      supabase: {
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              maybeSingle: jest.fn().mockResolvedValue({
                data: {
                  id: 'mod-imun',
                  modulo_slug: slug,
                  titulo_aula: 'Imunização',
                  conteudo_json: stamped,
                },
                error: null,
              }),
            })),
          })),
        })),
      } as any,
    });
    expect(res.status).toBe('forbidden');
  });

  it('resume/vitrine: P0 no histórico não é elegível', () => {
    const p0 = P0_DENIED_SLUGS.values().next().value as string;
    expect(isModuloCommercialEligible({ slug: p0, tituloAula: 'Noções de Anatomia' })).toBe(false);
  });

  it('bloqueia aprovação revogada (anchor_100 fail)', () => {
    const fp = fingerprintConteudoJson(GOLDEN_IMUNIZACAO);
    const revoked = {
      ...GOLDEN_IMUNIZACAO,
      meta: {
        ...GOLDEN_IMUNIZACAO.meta,
        anchor_100_approval: {
          status: 'fail',
          reviewed_at: '2026-09-08',
          approved_content_fingerprint: fp,
        },
      },
    };
    const result = canServeCommercialContent({
      slug: 'cpcon-imunizacao-intervalos-vf',
      tituloAula: 'Imunização',
      conteudoJson: revoked,
    });
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe('COMMERCIAL_APPROVAL_REVOKED');
  });

  it('caderno: subtópico fora do registry não é elegível para inserção', () => {
    expect(
      isModuloCommercialEligible({
        slug: 'legacy-caderno-slug',
        tituloAula: 'Subtópico Legado Não Rastreado XYZ',
      }),
    ).toBe(false);
  });
});
