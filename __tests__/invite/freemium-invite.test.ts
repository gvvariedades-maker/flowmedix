jest.mock('@/lib/logger', () => ({
  logger: { error: jest.fn(), warn: jest.fn() },
}));

jest.mock('@/lib/supabase/server', () => ({
  createServerSupabase: jest.fn(),
}));

import { createServerSupabase } from '@/lib/supabase/server';
import {
  assertCanAnswerQuestion,
  getFreemiumStatusForUser,
  isUserPro,
} from '@/lib/freemium';

const mockCreateServerSupabase = createServerSupabase as jest.MockedFunction<
  typeof createServerSupabase
>;

type GeralMatriculaData = {
  origem: string;
  status: string | null;
  expires_at: string | null;
};

function buildFreemiumSupabaseMock(opts: {
  geralMatricula?: GeralMatriculaData | null;
  questoesHoje?: number;
  simuladoQuestoesHoje?: number;
}) {
  const from = jest.fn((table: string) => {
    if (table === 'concurso_matriculas') {
      return {
        select: () => ({
          eq: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: opts.geralMatricula
                  ? {
                      origem: opts.geralMatricula.origem,
                      status: opts.geralMatricula.status,
                      expires_at: opts.geralMatricula.expires_at,
                      concurso: { slug: 'geral' },
                    }
                  : null,
                error: null,
              }),
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
              lt: async () => ({
                count: opts.questoesHoje ?? 0,
                error: null,
              }),
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
                lt: async () => ({
                  count: opts.simuladoQuestoesHoje ?? 0,
                  error: null,
                }),
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

describe('freemium com convite (invite)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('isUserPro é true com matrícula invite ativa e expires_at no futuro', async () => {
    const future = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();
    mockCreateServerSupabase.mockResolvedValue(
      buildFreemiumSupabaseMock({
        geralMatricula: { origem: 'invite', status: 'ativo', expires_at: future },
      }) as never,
    );

    await expect(isUserPro('user-1')).resolves.toBe(true);
  });

  it('isUserPro é false após expiração do trial (expires_at no passado)', async () => {
    const past = new Date(Date.now() - 60_000).toISOString();
    mockCreateServerSupabase.mockResolvedValue(
      buildFreemiumSupabaseMock({
        geralMatricula: { origem: 'invite', status: 'ativo', expires_at: past },
      }) as never,
    );

    await expect(isUserPro('user-1')).resolves.toBe(false);
  });

  it('isUserPro é false com status expirado (pós-cron)', async () => {
    mockCreateServerSupabase.mockResolvedValue(
      buildFreemiumSupabaseMock({
        geralMatricula: {
          origem: 'invite',
          status: 'expirado',
          expires_at: '2020-01-01T00:00:00.000Z',
        },
      }) as never,
    );

    await expect(isUserPro('user-1')).resolves.toBe(false);
  });

  it('getFreemiumStatusForUser aplica limite diário quando invite expirou', async () => {
    const past = new Date(Date.now() - 60_000).toISOString();
    mockCreateServerSupabase.mockResolvedValue(
      buildFreemiumSupabaseMock({
        geralMatricula: { origem: 'invite', status: 'expirado', expires_at: past },
        questoesHoje: 1,
      }) as never,
    );

    const status = await getFreemiumStatusForUser('user-1', 'aluno@test.com');

    expect(status.isPro).toBe(false);
    expect(status.limiteAtingido).toBe(true);
    expect(status.proSource).toBeNull();
  });

  it('assertCanAnswerQuestion bloqueia no freemium após expiração do convite', async () => {
    const past = new Date(Date.now() - 60_000).toISOString();
    mockCreateServerSupabase.mockResolvedValue(
      buildFreemiumSupabaseMock({
        geralMatricula: { origem: 'invite', status: 'ativo', expires_at: past },
        questoesHoje: 1,
      }) as never,
    );

    const result = await assertCanAnswerQuestion('user-1', 'aluno@test.com');

    expect(result).toEqual(expect.objectContaining({ allowed: false }));
    if (!result.allowed) {
      expect(result.resetEm).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    }
  });
});
