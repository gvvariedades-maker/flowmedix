/**
 * @jest-environment node
 */
import { buildSimuladoQuestaoPayload } from '@/lib/estudar/questaoSimuladoPayload';

const mockUserHasModuloAccess = jest.fn();
jest.mock('@/lib/concursos/entitlements', () => ({
  userHasModuloAccess: jest.fn((...args: unknown[]) => mockUserHasModuloAccess(...args)),
}));

const USER_ID = '550e8400-e29b-41d4-a716-446655440000';
const SLUG = 'questao-simulado-slim';

const conteudoJson = {
  meta: { banca: 'FGV', topico: 'Urgências', subtopico: 'RCP' },
  question_data: {
    instruction: 'Enunciado',
    options: [
      { id: 'A', text: 'Opção A', is_correct: true },
      { id: 'B', text: 'Opção B', is_correct: false },
    ],
  },
  reverse_study_slides: [{ type: 'golden_rule', content: 'Regra' }],
};

describe('buildSimuladoQuestaoPayload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('retorna forbidden sem entitlement', async () => {
    mockUserHasModuloAccess.mockResolvedValue(false);

    const result = await buildSimuladoQuestaoPayload({
      slug: SLUG,
      userId: USER_ID,
      supabase: { from: jest.fn() } as never,
    });

    expect(result).toEqual({ status: 'forbidden' });
  });

  it('retorna not_found quando módulo não existe', async () => {
    mockUserHasModuloAccess.mockResolvedValue(true);
    const maybeSingle = jest.fn().mockResolvedValue({ data: null, error: null });
    const eq = jest.fn().mockReturnValue({ maybeSingle });
    const select = jest.fn().mockReturnValue({ eq });
    const from = jest.fn().mockReturnValue({ select });

    const result = await buildSimuladoQuestaoPayload({
      slug: SLUG,
      userId: USER_ID,
      supabase: { from } as never,
    });

    expect(result).toEqual({ status: 'not_found' });
    expect(from).toHaveBeenCalledWith('modulos_estudo');
    expect(select).toHaveBeenCalledWith('conteudo_json');
  });

  it('retorna payload slim sem slides nem gabarito', async () => {
    mockUserHasModuloAccess.mockResolvedValue(true);
    const maybeSingle = jest.fn().mockResolvedValue({
      data: { conteudo_json: conteudoJson },
      error: null,
    });
    const eq = jest.fn().mockReturnValue({ maybeSingle });
    const select = jest.fn().mockReturnValue({ eq });
    const from = jest.fn().mockReturnValue({ select });

    const result = await buildSimuladoQuestaoPayload({
      slug: SLUG,
      userId: USER_ID,
      supabase: { from } as never,
    });

    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;

    expect(result.payload.dados.meta).toEqual(conteudoJson.meta);
    expect(result.payload.dados.question_data.options).toEqual([
      { id: 'A', text: 'Opção A' },
      { id: 'B', text: 'Opção B' },
    ]);
    expect(result.payload.dados).not.toHaveProperty('reverse_study_slides');
    expect(result.payload.dados).not.toHaveProperty('study_slides');
  });
});
