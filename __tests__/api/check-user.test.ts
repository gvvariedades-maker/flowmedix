/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/check-user/route';

const mockGetServerUser = jest.fn();
const mockCreateSupabaseServerClient = jest.fn();
const mockGetAdminAssuranceLevel = jest.fn();
const mockCreateServerSupabase = jest.fn();
const mockFindAuthUserByEmail = jest.fn();

jest.mock('@/lib/supabase/server-auth', () => ({
  getServerUser: () => mockGetServerUser(),
  createSupabaseServerClient: () => mockCreateSupabaseServerClient(),
}));

jest.mock('@/lib/admin/adminAssurance', () => ({
  getAdminAssuranceLevel: () => mockGetAdminAssuranceLevel(),
}));

jest.mock('@/lib/supabase/server', () => ({
  createServerSupabase: () => mockCreateServerSupabase(),
}));

jest.mock('@/lib/supabase/adminUsers', () => ({
  findAuthUserByEmail: (...args: unknown[]) => mockFindAuthUserByEmail(...args),
}));

jest.mock('@/lib/constants', () => ({
  isAdminSessionEmail: (email: string | null | undefined) =>
    Boolean(email && email.toLowerCase() === 'admin@avant.test'),
}));

jest.mock('@/lib/rate-limit', () => ({
  distributedRateLimit: jest.fn(async () => true),
}));

describe('GET /api/check-user — AAL2 e controle de acesso', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('retorna 400 se email não for informado', async () => {
    const req = new NextRequest('https://avant.test/api/check-user');
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it('permite que usuário consulte seu próprio email', async () => {
    mockGetServerUser.mockResolvedValue({
      id: 'aluno-1',
      email: 'aluno@test.com',
      created_at: '2026-01-01',
      last_sign_in_at: '2026-01-02',
      email_confirmed_at: '2026-01-01',
    });

    const req = new NextRequest('https://avant.test/api/check-user?email=aluno@test.com');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.isLoggedIn).toBe(true);
    expect(body.exists).toBe(true);
    expect(mockCreateServerSupabase).not.toHaveBeenCalled();
  });

  it('não revela existência para usuário comum consultando outro email (sem account enumeration)', async () => {
    mockGetServerUser.mockResolvedValue({
      id: 'aluno-1',
      email: 'aluno@test.com',
    });

    const req = new NextRequest('https://avant.test/api/check-user?email=outro@test.com');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.exists).toBe(false);
    expect(body.isLoggedIn).toBe(false);
    expect(mockCreateServerSupabase).not.toHaveBeenCalled();
    expect(mockFindAuthUserByEmail).not.toHaveBeenCalled();
  });

  it('ADMIN AAL1: NÃO executa Admin API / createServerSupabase ao consultar outro email', async () => {
    mockGetServerUser.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@avant.test',
    });
    mockCreateSupabaseServerClient.mockResolvedValue({});
    mockGetAdminAssuranceLevel.mockResolvedValue({ state: 'MFA_CHALLENGE_REQUIRED' });

    const req = new NextRequest('https://avant.test/api/check-user?email=qualquer@test.com');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.exists).toBe(false);
    expect(mockCreateServerSupabase).not.toHaveBeenCalled();
    expect(mockFindAuthUserByEmail).not.toHaveBeenCalled();
  });

  it('ADMIN AAL2: executa Admin API / createServerSupabase para consultar email de terceiros', async () => {
    mockGetServerUser.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@avant.test',
    });
    mockCreateSupabaseServerClient.mockResolvedValue({});
    mockGetAdminAssuranceLevel.mockResolvedValue({ state: 'AAL2_VERIFIED' });
    const adminSupabase = {};
    mockCreateServerSupabase.mockResolvedValue(adminSupabase);
    mockFindAuthUserByEmail.mockResolvedValue({
      user: {
        id: 'target-user',
        email: 'alvo@test.com',
        created_at: '2026-02-01',
        last_sign_in_at: '2026-02-02',
        email_confirmed_at: '2026-02-01',
      },
      error: null,
    });

    const req = new NextRequest('https://avant.test/api/check-user?email=alvo@test.com');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.exists).toBe(true);
    expect(body.userInfo.id).toBe('target-user');
    expect(mockCreateServerSupabase).toHaveBeenCalledTimes(1);
    expect(mockFindAuthUserByEmail).toHaveBeenCalledWith(adminSupabase, 'alvo@test.com');
  });
});
