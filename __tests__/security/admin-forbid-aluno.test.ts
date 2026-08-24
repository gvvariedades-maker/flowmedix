/**
 * @jest-environment node
 *
 * Scorecard #6 e #11 — Defesa em profundidade:
 * - JWT de aluno em rota admin → 403 Acesso negado
 * - Admin AAL1 (sem MFA verificado) → 403 MFA_REQUIRED (service_role bloqueado)
 * - Admin AAL2 (com MFA verificado) → permitido + service_role liberado
 */

const mockGetUser = jest.fn();
const mockGetAuthenticatorAssuranceLevel = jest.fn();
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
      mfa: {
        getAuthenticatorAssuranceLevel: (...args: unknown[]) =>
          mockGetAuthenticatorAssuranceLevel(...args),
      },
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

describe('requireAdminApi — matriz de segurança AAL / autorização', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('1. retorna 401 para usuário anônimo (sem sessão)', async () => {
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

  it('2. retorna 403 para aluno AAL1 (fora da allowlist admin)', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'aluno-1', email: 'aluno@test.com' } },
      error: null,
    });
    mockGetAuthenticatorAssuranceLevel.mockResolvedValue({
      data: { currentLevel: 'aal1', nextLevel: 'aal1' },
      error: null,
    });

    const result = await requireAdminApi();
    expect('error' in result).toBe(true);
    if (!('error' in result)) return;

    expect(result.error.status).toBe(403);
    expect(await result.error.json()).toEqual({ error: 'Acesso negado' });
    expect(mockCreateServerSupabase).not.toHaveBeenCalled();
  });

  it('3. retorna 403 para aluno AAL2 (fora da allowlist admin)', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'aluno-mfa', email: 'aluno-com-mfa@test.com' } },
      error: null,
    });
    mockGetAuthenticatorAssuranceLevel.mockResolvedValue({
      data: { currentLevel: 'aal2', nextLevel: 'aal2' },
      error: null,
    });

    const result = await requireAdminApi();
    expect('error' in result).toBe(true);
    if (!('error' in result)) return;

    expect(result.error.status).toBe(403);
    expect(await result.error.json()).toEqual({ error: 'Acesso negado' });
    expect(mockCreateServerSupabase).not.toHaveBeenCalled();
  });

  it('4. nega admin AAL1 / next AAL1 (sem fator) com 403 MFA_REQUIRED sem criar service_role', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-1', email: 'Admin@Avant.test' } },
      error: null,
    });
    mockGetAuthenticatorAssuranceLevel.mockResolvedValue({
      data: { currentLevel: 'aal1', nextLevel: 'aal1' },
      error: null,
    });

    const result = await requireAdminApi();
    expect('error' in result).toBe(true);
    if (!('error' in result)) return;

    expect(result.error.status).toBe(403);
    const body = await result.error.json();
    expect(body.error).toBe('MFA_REQUIRED');
    expect(body.code).toBe('NO_MFA_FACTOR');
    expect(mockCreateServerSupabase).not.toHaveBeenCalled();
  });

  it('5. nega admin AAL1 / next AAL2 (desafio pendente) com 403 MFA_REQUIRED sem criar service_role', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-1', email: 'Admin@Avant.test' } },
      error: null,
    });
    mockGetAuthenticatorAssuranceLevel.mockResolvedValue({
      data: { currentLevel: 'aal1', nextLevel: 'aal2' },
      error: null,
    });

    const result = await requireAdminApi();
    expect('error' in result).toBe(true);
    if (!('error' in result)) return;

    expect(result.error.status).toBe(403);
    const body = await result.error.json();
    expect(body.error).toBe('MFA_REQUIRED');
    expect(body.code).toBe('MFA_CHALLENGE_REQUIRED');
    expect(mockCreateServerSupabase).not.toHaveBeenCalled();
  });

  it('6. libera service role e acesso privilegiado APENAS para admin AAL2 verificado', async () => {
    const adminClient = { from: jest.fn() };
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-1', email: 'Admin@Avant.test' } },
      error: null,
    });
    mockGetAuthenticatorAssuranceLevel.mockResolvedValue({
      data: { currentLevel: 'aal2', nextLevel: 'aal2' },
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

  it('7. nega com FAIL_CLOSED se ocorrer erro na verificação de AAL', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-1', email: 'Admin@Avant.test' } },
      error: null,
    });
    mockGetAuthenticatorAssuranceLevel.mockResolvedValue({
      data: null,
      error: { message: 'Erro de comunicação Auth' },
    });

    const result = await requireAdminApi();
    expect('error' in result).toBe(true);
    if (!('error' in result)) return;

    expect(result.error.status).toBe(403);
    const body = await result.error.json();
    expect(body.error).toBe('MFA_REQUIRED');
    expect(body.code).toBe('FAIL_CLOSED');
    expect(mockCreateServerSupabase).not.toHaveBeenCalled();
  });

  it('8. nega com FAIL_CLOSED se a resposta de AAL for nula ou inesperada', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-1', email: 'Admin@Avant.test' } },
      error: null,
    });
    mockGetAuthenticatorAssuranceLevel.mockResolvedValue({
      data: { currentLevel: null, nextLevel: null },
      error: null,
    });

    const result = await requireAdminApi();
    expect('error' in result).toBe(true);
    if (!('error' in result)) return;

    expect(result.error.status).toBe(403);
    const body = await result.error.json();
    expect(body.error).toBe('MFA_REQUIRED');
    expect(body.code).toBe('FAIL_CLOSED');
    expect(mockCreateServerSupabase).not.toHaveBeenCalled();
  });
});

describe('GET /api/admin/scale-health — integração de guard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('bloqueia aluno antes de coletar métricas', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'aluno-1', email: 'aluno@test.com' } },
      error: null,
    });
    mockGetAuthenticatorAssuranceLevel.mockResolvedValue({
      data: { currentLevel: 'aal1', nextLevel: 'aal1' },
      error: null,
    });

    const { runScaleHealthCheck } = await import('@/lib/scale/healthCheck');
    const response = await getScaleHealth();

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: 'Acesso negado' });
    expect(runScaleHealthCheck).not.toHaveBeenCalled();
  });

  it('bloqueia admin AAL1 antes de coletar métricas', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-1', email: 'admin@avant.test' } },
      error: null,
    });
    mockGetAuthenticatorAssuranceLevel.mockResolvedValue({
      data: { currentLevel: 'aal1', nextLevel: 'aal2' },
      error: null,
    });

    const { runScaleHealthCheck } = await import('@/lib/scale/healthCheck');
    const response = await getScaleHealth();

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.error).toBe('MFA_REQUIRED');
    expect(runScaleHealthCheck).not.toHaveBeenCalled();
  });
});
