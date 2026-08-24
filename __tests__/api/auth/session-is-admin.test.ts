/**
 * @jest-environment node
 */
import { GET } from '@/app/api/auth/session-is-admin/route';

const mockGetServerUser = jest.fn();
const mockCreateSupabaseServerClient = jest.fn();
const mockGetAdminAssuranceLevel = jest.fn();

jest.mock('@/lib/supabase/server-auth', () => ({
  getServerUser: () => mockGetServerUser(),
  createSupabaseServerClient: () => mockCreateSupabaseServerClient(),
}));

jest.mock('@/lib/admin/adminAssurance', () => ({
  getAdminAssuranceLevel: () => mockGetAdminAssuranceLevel(),
}));

jest.mock('@/lib/constants', () => ({
  isAdminSessionEmail: (email: string | null | undefined) =>
    Boolean(email && email.toLowerCase() === 'admin@avant.test'),
}));

describe('GET /api/auth/session-is-admin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('retorna admin: false e mfaVerified: false para usuário comum', async () => {
    mockGetServerUser.mockResolvedValue({ email: 'aluno@test.com' });
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.admin).toBe(false);
    expect(body.mfaVerified).toBe(false);
    expect(body.assuranceState).toBe('FAIL_CLOSED');
  });

  it('retorna admin: true e mfaVerified: false para admin AAL1', async () => {
    mockGetServerUser.mockResolvedValue({ email: 'admin@avant.test' });
    mockCreateSupabaseServerClient.mockResolvedValue({});
    mockGetAdminAssuranceLevel.mockResolvedValue({ state: 'MFA_CHALLENGE_REQUIRED' });

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.admin).toBe(true);
    expect(body.mfaVerified).toBe(false);
    expect(body.assuranceState).toBe('MFA_CHALLENGE_REQUIRED');
  });

  it('retorna admin: true e mfaVerified: true para admin AAL2', async () => {
    mockGetServerUser.mockResolvedValue({ email: 'admin@avant.test' });
    mockCreateSupabaseServerClient.mockResolvedValue({});
    mockGetAdminAssuranceLevel.mockResolvedValue({ state: 'AAL2_VERIFIED' });

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.admin).toBe(true);
    expect(body.mfaVerified).toBe(true);
    expect(body.assuranceState).toBe('AAL2_VERIFIED');
  });
});
