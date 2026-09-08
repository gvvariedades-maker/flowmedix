import { buildEstudarQuestaoPlayerPayload } from '@/lib/estudar/questaoPlayerPayload';
import { userHasModuloAccess, getAccessibleModuloSlugs } from '@/lib/concursos/entitlements';
import { getQuestaoBySlugCached } from '@/lib/cache';

jest.mock('@/lib/concursos/entitlements', () => ({
  userHasModuloAccess: jest.fn(),
  getAccessibleModuloSlugs: jest.fn(),
  fetchAccessibleModulosForNav: jest.fn(async () => []),
}));

jest.mock('@/lib/cache', () => ({
  getQuestaoBySlugCached: jest.fn(),
  getHistoricoQuestoesForSlugsCached: jest.fn(() => []),
  estudadosSetFromHistorico: jest.fn(() => new Set()),
}));

describe('Negative Bypass Tests - Commercial Enforcement', () => {
  const mockUserHasAccess = userHasModuloAccess as jest.MockedFunction<typeof userHasModuloAccess>;
  const mockGetAccessible = getAccessibleModuloSlugs as jest.MockedFunction<typeof getAccessibleModuloSlugs>;
  const mockGetCached = getQuestaoBySlugCached as jest.MockedFunction<typeof getQuestaoBySlugCached>;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.COMMERCIAL_RUNTIME_READINESS_GATE = 'false';
    mockUserHasAccess.mockResolvedValue(true);
    mockGetAccessible.mockResolvedValue(new Set(['slug-permitido']));
  });

  it('bloqueia acesso direto a slug da P0 Denylist no player (mesmo com entitlement Pro/ativo)', async () => {
    const deniedSlug = 'inaz-do-para-enfermagem-nocoes-de-anatomia-1775448275334-4';
    const mockSupabase: any = {
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            maybeSingle: jest.fn().mockResolvedValue({
              data: {
                id: 'mod-denied-1',
                modulo_slug: deniedSlug,
                titulo_aula: 'Noções de Anatomia',
                conteudo_json: { question_data: { options: [{ id: 'A', is_correct: true, text: 'X' }] } },
              },
              error: null,
            }),
          })),
        })),
      })),
    };

    const res = await buildEstudarQuestaoPlayerPayload({
      slug: deniedSlug,
      userId: 'user-pro-123',
      isAdmin: false,
      supabase: mockSupabase,
    });

    expect(res.status).toBe('forbidden');
  });

  it('bloqueia questao com zero is_correct ao tentar abrir no player', async () => {
    const zeroCorrectSlug = 'ivin-enfermagem-enfermagem-em-centro-cirurgico-1777103887798-5';
    const mockSupabase: any = {
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            maybeSingle: jest.fn().mockResolvedValue({
              data: {
                id: 'mod-zero-1',
                modulo_slug: zeroCorrectSlug,
                titulo_aula: 'Centro Cirúrgico',
                conteudo_json: {
                  question_data: {
                    instruction: 'Enunciado',
                    options: [
                      { id: 'A', is_correct: false, text: 'A' },
                      { id: 'B', is_correct: false, text: 'B' },
                    ],
                  },
                },
              },
              error: null,
            }),
          })),
        })),
      })),
    };

    const res = await buildEstudarQuestaoPlayerPayload({
      slug: zeroCorrectSlug,
      userId: 'user-pro-123',
      isAdmin: false,
      supabase: mockSupabase,
    });

    expect(res.status).toBe('forbidden');
  });

  it('permite acesso normal a questao homologada', async () => {
    const okSlug = 'slug-valido-homologado-ok';
    const mockSupabase: any = {
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            maybeSingle: jest.fn().mockResolvedValue({
              data: {
                id: 'mod-ok-1',
                modulo_slug: okSlug,
                titulo_aula: 'Urgências e Emergências',
                conteudo_json: {
                  question_data: {
                    instruction: 'Enunciado valido',
                    options: [
                      { id: 'A', is_correct: true, text: 'A' },
                      { id: 'B', is_correct: false, text: 'B' },
                    ],
                  },
                  reverse_study_slides: [
                    { type: 'concept_map', items: [{ label: 'M' }] },
                    { type: 'logic_flow', steps: ['L'] },
                    { type: 'golden_rule', content: 'G' },
                    { type: 'danger_zone', content: 'D' },
                  ],
                },
              },
              error: null,
            }),
          })),
        })),
      })),
    };

    const res = await buildEstudarQuestaoPlayerPayload({
      slug: okSlug,
      userId: 'user-pro-123',
      isAdmin: false,
      supabase: mockSupabase,
    });

    expect(res.status).toBe('ok');
  });
});
