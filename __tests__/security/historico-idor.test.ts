/**
 * @jest-environment node
 *
 * Scorecard #6 — IDOR histórico: sessão A não lê/escreve histórico de B.
 */
jest.mock('next/cache', () => ({
  unstable_cache: (fn: () => Promise<unknown>) => fn,
  revalidateTag: jest.fn(),
}));

jest.mock('@/lib/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

const USER_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const USER_B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const SLUG = 'questao-idor-slug';

const historicoRowsA = [
  { modulo_slug: SLUG, acertou: true, estudo_reverso_concluido: true },
];

const eqCalls: Array<[string, string]> = [];
let historicoFromCalls = 0;
const mockFrom = jest.fn();

const mockHistoricoChain = {
  select: () => mockHistoricoChain,
  eq: (column: string, value: string) => {
    eqCalls.push([column, value]);
    return mockHistoricoChain;
  },
  order: () => mockHistoricoChain,
  limit: () => Promise.resolve({ data: historicoRowsA, error: null }),
};

jest.mock('@/lib/supabase/server', () => ({
  createServerSupabase: jest.fn(async () => ({
    from: (...args: unknown[]) => mockFrom(...args),
  })),
}));

import { getHistoricoQuestoesCached } from '@/lib/cache';
import { createServerSupabase } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/registrar-tentativa/route';

const mockGetUserAndClientFromBearer = jest.fn();
jest.mock('@/lib/supabase/api-request-user', () => ({
  getUserAndClientFromBearer: jest.fn((...args: unknown[]) =>
    mockGetUserAndClientFromBearer(...args),
  ),
}));

const mockUserHasModuloAccess = jest.fn();
jest.mock('@/lib/concursos/entitlements', () => ({
  userHasModuloAccess: jest.fn((...args: unknown[]) => mockUserHasModuloAccess(...args)),
}));

jest.mock('@/lib/freemium', () => ({
  assertCanAnswerQuestion: jest.fn().mockResolvedValue({ allowed: true }),
  countQuestoesHojeForUser: jest.fn().mockResolvedValue(0),
  getFreemiumDayBounds: jest.fn().mockReturnValue({ resetEm: new Date('2026-05-27T03:00:00Z') }),
  isFreemiumUnlimitedEmail: jest.fn().mockReturnValue(true),
  isUserPro: jest.fn().mockResolvedValue(false),
  FREEMIUM_ESTUDO_REVERSO_DAILY_LIMIT: 20,
}));

describe('IDOR — histórico (cache)', () => {
  beforeAll(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
  });

  beforeEach(() => {
    eqCalls.length = 0;
    historicoFromCalls = 0;
    jest.clearAllMocks();
    mockFrom.mockImplementation((table: string) => {
      if (table === 'historico_questoes') {
        historicoFromCalls += 1;
        return mockHistoricoChain;
      }
      return mockHistoricoChain;
    });
  });

  it('sem userId retorna [] e não consulta historico_questoes', async () => {
    const result = await getHistoricoQuestoesCached();
    expect(result).toEqual([]);
    expect(historicoFromCalls).toBe(0);
    expect(createServerSupabase).not.toHaveBeenCalled();
  });

  it('consulta sempre com .eq(user_id, sessão) — não vaza user B', async () => {
    const result = await getHistoricoQuestoesCached(USER_A);

    expect(createServerSupabase).toHaveBeenCalled();
    expect(eqCalls).toContainEqual(['user_id', USER_A]);
    expect(eqCalls).not.toContainEqual(['user_id', USER_B]);
    expect(result).toEqual(historicoRowsA);
  });
});

describe('IDOR — registrar-tentativa (escrita)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserAndClientFromBearer.mockResolvedValue({
      user: { id: USER_A, email: 'aluno-a@test.com' },
    });
    mockUserHasModuloAccess.mockResolvedValue(true);
  });

  function makeRequest(body: object) {
    return new NextRequest('https://avant.test/api/registrar-tentativa', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'content-type': 'application/json', authorization: 'Bearer token' },
    });
  }

  function mockPersistChains() {
    const insert = jest.fn().mockResolvedValue({ error: null });
    const update = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null }),
    });
    const historicoMaybeSingle = jest.fn().mockResolvedValue({ data: null, error: null });
    const historicoLimit = jest.fn().mockReturnValue({ maybeSingle: historicoMaybeSingle });
    const historicoOrder = jest.fn().mockReturnValue({ limit: historicoLimit });
    const historicoEqModulo = jest.fn().mockReturnValue({ order: historicoOrder });
    const historicoEqUser = jest.fn().mockReturnValue({ eq: historicoEqModulo });
    const historicoSelect = jest.fn().mockReturnValue({ eq: historicoEqUser });

    const moduloMaybeSingle = jest.fn().mockResolvedValue({
      data: {
        conteudo_json: {
          question_data: {
            options: [
              { id: 'A', text: 'Opção A', is_correct: false },
              { id: 'B', text: 'Opção B', is_correct: true },
            ],
          },
        },
      },
      error: null,
    });
    const moduloEq = jest.fn().mockReturnValue({ maybeSingle: moduloMaybeSingle });
    const moduloSelect = jest.fn().mockReturnValue({ eq: moduloEq });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'modulos_estudo') return { select: moduloSelect };
      if (table === 'historico_questoes') {
        return { select: historicoSelect, insert, update };
      }
      return { select: moduloSelect, insert, update };
    });

    return { insert, historicoEqUser };
  }

  it('ignora user_id no body e grava com user_id da sessão A', async () => {
    const { insert, historicoEqUser } = mockPersistChains();

    const response = await POST(
      makeRequest({
        modulo_slug: SLUG,
        opcao_id: 'B',
        user_id: USER_B,
      }),
    );

    expect(response.status).toBe(200);
    expect(historicoEqUser).toHaveBeenCalledWith('user_id', USER_A);
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: USER_A,
        modulo_slug: SLUG,
      }),
    );
    expect(insert).not.toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: USER_B,
      }),
    );
  });
});
