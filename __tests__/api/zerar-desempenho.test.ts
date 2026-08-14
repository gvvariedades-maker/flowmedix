/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

import { POST } from '@/app/api/zerar-desempenho/route';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

jest.mock('@/lib/logger', () => ({
  logger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

const mockRevalidateTag = jest.fn();
jest.mock('next/cache', () => ({
  revalidateTag: (...args: unknown[]) => mockRevalidateTag(...args),
}));

jest.mock('@/lib/cache', () => ({
  CACHE_REVALIDATE_IMMEDIATE: { expire: 0 },
}));

const mockGetUserAndClientFromBearer = jest.fn();
jest.mock('@/lib/supabase/api-request-user', () => ({
  getUserAndClientFromBearer: (...args: unknown[]) => mockGetUserAndClientFromBearer(...args),
}));

type DeleteCall = { table: string; column: string; value: string };

function buildSupabaseStub(deleteResult: { error: unknown } = { error: null }) {
  const calls: DeleteCall[] = [];
  const supabase = {
    from(table: string) {
      return {
        delete() {
          return {
            eq(column: string, value: string) {
              calls.push({ table, column, value });
              return Promise.resolve(deleteResult);
            },
          };
        },
      };
    },
  };
  return { supabase, calls };
}

function makeRequest() {
  return new NextRequest('https://avant.test/api/zerar-desempenho', {
    method: 'POST',
    headers: { authorization: 'Bearer token' },
  });
}

describe('POST /api/zerar-desempenho', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('retorna 401 sem sessão', async () => {
    mockGetUserAndClientFromBearer.mockResolvedValue(null);

    const response = await POST(makeRequest());

    expect(response.status).toBe(401);
    expect(mockRevalidateTag).not.toHaveBeenCalled();
  });

  it('apaga só historico_questoes do próprio usuário e declara o escopo', async () => {
    const { supabase, calls } = buildSupabaseStub();
    mockGetUserAndClientFromBearer.mockResolvedValue({ user: { id: 'user-1' }, supabase });

    const response = await POST(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(calls).toEqual([
      { table: 'historico_questoes', column: 'user_id', value: 'user-1' },
    ]);
    expect(body).toMatchObject({
      success: true,
      scope: 'estudo',
      cleared: ['historico_questoes'],
    });
    expect(body.preserved).toContain('simulados');
  });

  it('não toca em simulados nem no ledger de evidências', async () => {
    const { supabase, calls } = buildSupabaseStub();
    mockGetUserAndClientFromBearer.mockResolvedValue({ user: { id: 'user-1' }, supabase });

    await POST(makeRequest());

    const tabelas = calls.map((c) => c.table);
    expect(tabelas).not.toContain('simulado_sessions');
    expect(tabelas).not.toContain('simulado_analytics_daily');
    expect(tabelas).not.toContain('evidence_attempt_events');
  });

  it('invalida cache de histórico e do usuário', async () => {
    const { supabase } = buildSupabaseStub();
    mockGetUserAndClientFromBearer.mockResolvedValue({ user: { id: 'user-1' }, supabase });

    await POST(makeRequest());

    expect(mockRevalidateTag).toHaveBeenCalledWith('historico', { expire: 0 });
    expect(mockRevalidateTag).toHaveBeenCalledWith('user-user-1', { expire: 0 });
  });

  it('responde 500 sem invalidar cache quando o delete falha', async () => {
    const { supabase } = buildSupabaseStub({ error: { message: 'rls' } });
    mockGetUserAndClientFromBearer.mockResolvedValue({ user: { id: 'user-1' }, supabase });

    const response = await POST(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toMatch(/desempenho de estudo/i);
    expect(mockRevalidateTag).not.toHaveBeenCalled();
  });

  it('mantém JWT + RLS — não troca o delete para service role', () => {
    const source = readFileSync(join(process.cwd(), 'app/api/zerar-desempenho/route.ts'), 'utf8');
    expect(source).toContain('getUserAndClientFromBearer');
    expect(source).not.toMatch(/createServerSupabase/);
  });
});
