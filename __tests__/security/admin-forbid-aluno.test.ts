/**
 * @jest-environment node
 *
 * Scorecard #6 — JWT de aluno em rota admin → 403 (requireAdminApi).
 */

const mockGetUser = jest.fn();
const mockCreateServerSupabase = jest.fn();

jest.mock('next/headers', () => ({
  cookies: jest.fn(async () => ({
    getAll: () => [],
  })),
}));

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => ({
    auth: {
      getUser: (...args: unknown[]) => mockGetUser(...args),
    },
  })),
}));

jest.mock('@/lib/supabase/server', () => ({
  createServerSupabase: (...args: unknown[]) => mockCreateServerSupabase(...args),
}));

jest.mock('@/lib/constants', () => ({
  isAdminSessionEmail: (email: string | null | undefined) =>
    Boolean(email && email.toLowerCase() === 'admin@avant.test'),
}));

import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin/requireAdmin';
import { GET as getScaleHealth } from '@/app/api/admin/scale-health/route';

jest.mock('@/lib/scale/healthCheck', () => ({
  runScaleHealthCheck: jest.fn(),
}));

jest.mock('@/lib/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('requireAdminApi — aluno vs admin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('retorna 401 sem sessão', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'not authenticated' },
    });

    const result = await requireAdminApi();
    expect('error' in result).toBe(true);
    if (!('error' in result)) return;

    expect(result.error).toBeInstanceOf(NextResponse);
    expect(result.error.status).toBe(401);
    expect(await result.error.json()).toEqual({ error: 'Não autenticado' });
    expect(mockCreateServerSupabase).not.toHaveBeenCalled();
  });

  it('retorna 403 com JWT de aluno (não está na allowlist)', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'aluno-1', email: 'aluno@test.com' } },
      error: null,
    });

    const result = await requireAdminApi();
    expect('error' in result).toBe(true);
    if (!('error' in result)) return;

    expect(result.error.status).toBe(403);
    expect(await result.error.json()).toEqual({ error: 'Acesso negado' });
    expect(mockCreateServerSupabase).not.toHaveBeenCalled();
  });

  it('libera service role só para email admin', async () => {
    const adminClient = { from: jest.fn() };
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-1', email: 'Admin@Avant.test' } },
      error: null,
    });
    mockCreateServerSupabase.mockResolvedValue(adminClient);

    const result = await requireAdminApi();
    expect('error' in result).toBe(false);
    if ('error' in result) return;

    expect(result.email).toBe('admin@avant.test');
    expect(result.user.id).toBe('admin-1');
    expect(result.admin).toBe(adminClient);
    expect(mockCreateServerSupabase).toHaveBeenCalledTimes(1);
  });
});

describe('GET /api/admin/scale-health — aluno → 403', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'aluno-1', email: 'aluno@test.com' } },
      error: null,
    });
  });

  it('bloqueia aluno antes de coletar métricas', async () => {
    const { runScaleHealthCheck } = await import('@/lib/scale/healthCheck');
    const response = await getScaleHealth();

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: 'Acesso negado' });
    expect(runScaleHealthCheck).not.toHaveBeenCalled();
  });
});
