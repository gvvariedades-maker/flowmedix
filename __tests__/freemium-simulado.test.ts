jest.mock('@/lib/logger', () => ({
  logger: { error: jest.fn(), warn: jest.fn() },
}));

jest.mock('@/lib/supabase/server', () => ({
  createServerSupabase: jest.fn(),
}));

import { createServerSupabase } from '@/lib/supabase/server';
import {
  assertCanAnswerSimuladoQuestion,
  countSimuladoQuestoesHojeForUser,
  FREEMIUM_PLAN_LIMITS_COMPACT,
  FREEMIUM_PLAN_LIMITS_DESCRIPTION,
  FREEMIUM_SIMULADO_DAILY_LIMIT,
  getFreemiumStatusForUser,
} from '@/lib/freemium';

const mockCreateServerSupabase = createServerSupabase as jest.MockedFunction<
  typeof createServerSupabase
>;

function buildSupabaseMock(simuladoQuestoesHoje: number) {
  const from = jest.fn((table: string) => {
    if (table === 'concurso_matriculas') {
      return {
        select: () => ({
          eq: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: null, error: null }),
            }),
          }),
        }),
      };
    }
    if (table === 'historico_questoes') {
      return {
        select: () => ({
          eq: () => ({
            gte: () => ({
              lt: async () => ({ count: 0, error: null }),
            }),
          }),
        }),
      };
    }
    if (table === 'simulado_respostas') {
      return {
        select: () => ({
          eq: () => ({
            not: () => ({
              gte: () => ({
                lt: async () => ({ count: simuladoQuestoesHoje, error: null }),
              }),
            }),
          }),
        }),
      };
    }
    throw new Error(`unexpected table ${table}`);
  });
  return { from };
}

describe('freemium simulado', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('countSimuladoQuestoesHojeForUser retorna contagem do dia', async () => {
    mockCreateServerSupabase.mockResolvedValue(buildSupabaseMock(3) as never);
    await expect(countSimuladoQuestoesHojeForUser('user-1')).resolves.toBe(3);
  });

  it('assertCanAnswerSimuladoQuestion permite abaixo do limite', async () => {
    mockCreateServerSupabase.mockResolvedValue(
      buildSupabaseMock(FREEMIUM_SIMULADO_DAILY_LIMIT - 1) as never,
    );
    await expect(assertCanAnswerSimuladoQuestion('user-1', 'free@test.com')).resolves.toEqual({
      allowed: true,
    });
  });

  it('assertCanAnswerSimuladoQuestion bloqueia no limite diário', async () => {
    mockCreateServerSupabase.mockResolvedValue(
      buildSupabaseMock(FREEMIUM_SIMULADO_DAILY_LIMIT) as never,
    );
    const result = await assertCanAnswerSimuladoQuestion('user-1', 'free@test.com');
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.resetEm).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    }
  });

  it('getFreemiumStatusForUser expõe simulado.limiteAtingido quando no limite', async () => {
    mockCreateServerSupabase.mockResolvedValue(
      buildSupabaseMock(FREEMIUM_SIMULADO_DAILY_LIMIT) as never,
    );
    const status = await getFreemiumStatusForUser('user-1', 'free@test.com');
    expect(status.simulado).toEqual({
      questoesHoje: FREEMIUM_SIMULADO_DAILY_LIMIT,
      limite: FREEMIUM_SIMULADO_DAILY_LIMIT,
      restantes: 0,
      limiteAtingido: true,
    });
  });

  it('expõe copy canônica dos limites do plano gratuito', () => {
    expect(FREEMIUM_PLAN_LIMITS_COMPACT).toBe('1 estudo reverso + 5 simulados/dia');
    expect(FREEMIUM_PLAN_LIMITS_DESCRIPTION).toBe(
      '1 questão de estudo reverso e 5 questões de simulado por dia para treinar',
    );
  });
});
