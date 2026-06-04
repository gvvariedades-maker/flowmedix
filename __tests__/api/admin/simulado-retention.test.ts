/**
 * @jest-environment node
 */
import { GET, POST } from '@/app/api/admin/manutencao/simulado-retention/route';
import { NextRequest, NextResponse } from 'next/server';
import { SimuladoRetentionRunSchema } from '@/lib/validations';

const mockRequireAdminApi = jest.fn();
const mockCreateServerSupabase = jest.fn();
const mockRpc = jest.fn();

jest.mock('@/lib/admin/requireAdmin', () => ({
  requireAdminApi: (...args: unknown[]) => mockRequireAdminApi(...args),
}));

jest.mock('@/lib/supabase/server', () => ({
  createServerSupabase: (...args: unknown[]) => mockCreateServerSupabase(...args),
}));

jest.mock('@/lib/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

function makeRequest(
  init: RequestInit & { url?: string } = {},
): NextRequest {
  return new NextRequest(
    init.url ?? 'http://localhost/api/admin/manutencao/simulado-retention',
    init,
  );
}

describe('SimuladoRetentionRunSchema', () => {
  it('aplica defaults de retenção híbrida', () => {
    const parsed = SimuladoRetentionRunSchema.parse({});
    expect(parsed.retention_months).toBe(12);
    expect(parsed.reference_at).toBeUndefined();
  });

  it('aceita reference_at ISO e retention_months customizado', () => {
    const parsed = SimuladoRetentionRunSchema.parse({
      retention_months: 6,
      reference_at: '2026-06-01T00:00:00.000Z',
    });
    expect(parsed.retention_months).toBe(6);
    expect(parsed.reference_at).toBe('2026-06-01T00:00:00.000Z');
  });

  it('rejeita retention_months fora do intervalo', () => {
    expect(SimuladoRetentionRunSchema.safeParse({ retention_months: 0 }).success).toBe(false);
    expect(SimuladoRetentionRunSchema.safeParse({ retention_months: 37 }).success).toBe(false);
  });
});

describe('/api/admin/manutencao/simulado-retention', () => {
  const originalCronSecret = process.env.CRON_SECRET;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.CRON_SECRET = 'test-cron-secret';
    mockCreateServerSupabase.mockResolvedValue({ rpc: mockRpc });
  });

  afterAll(() => {
    process.env.CRON_SECRET = originalCronSecret;
  });

  it('retorna erro de auth quando não é cron nem admin', async () => {
    mockRequireAdminApi.mockResolvedValue({
      error: NextResponse.json({ error: 'Não autenticado' }, { status: 401 }),
    });

    const response = await POST(makeRequest({ method: 'POST', body: '{}' }));
    expect(response.status).toBe(401);
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it('executa RPC via cron autorizado', async () => {
    mockRpc.mockResolvedValue({
      data: [{ consolidated_sessions: 2, deleted_respostas: 40 }],
      error: null,
    });

    const response = await GET(
      makeRequest({
        method: 'GET',
        headers: { authorization: 'Bearer test-cron-secret' },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      success: true,
      retention_months: 12,
      reference_at: null,
      consolidated_sessions: 2,
      deleted_respostas: 40,
    });
    expect(mockRpc).toHaveBeenCalledWith('simulado_run_retention', {
      p_reference: undefined,
      p_retention_months: 12,
    });
    expect(mockRequireAdminApi).not.toHaveBeenCalled();
  });

  it('executa RPC via admin com payload customizado', async () => {
    mockRequireAdminApi.mockResolvedValue({
      admin: { rpc: jest.fn() },
      user: { id: 'admin-id' },
      email: 'admin@avant.com',
    });
    mockRpc.mockResolvedValue({
      data: [{ consolidated_sessions: 1, deleted_respostas: 10 }],
      error: null,
    });

    const response = await POST(
      makeRequest({
        method: 'POST',
        body: JSON.stringify({
          retention_months: 18,
          reference_at: '2026-01-15T12:00:00.000Z',
        }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.consolidated_sessions).toBe(1);
    expect(body.deleted_respostas).toBe(10);
    expect(body.retention_months).toBe(18);
    expect(body.reference_at).toBe('2026-01-15T12:00:00.000Z');
    expect(mockRpc).toHaveBeenCalledWith('simulado_run_retention', {
      p_reference: '2026-01-15T12:00:00.000Z',
      p_retention_months: 18,
    });
  });

  it('retorna 400 para payload inválido', async () => {
    mockRequireAdminApi.mockResolvedValue({
      admin: { rpc: jest.fn() },
      user: { id: 'admin-id' },
      email: 'admin@avant.com',
    });

    const response = await POST(
      makeRequest({
        method: 'POST',
        body: JSON.stringify({ reference_at: 'not-a-date' }),
      }),
    );

    expect(response.status).toBe(400);
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it('retorna 500 quando RPC falha', async () => {
    mockRequireAdminApi.mockResolvedValue({
      admin: { rpc: jest.fn() },
      user: { id: 'admin-id' },
      email: 'admin@avant.com',
    });
    mockRpc.mockResolvedValue({
      data: null,
      error: { message: 'function simulado_run_retention does not exist' },
    });

    const response = await POST(makeRequest({ method: 'POST', body: '{}' }));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'Erro ao executar retenção de simulados' });
  });
});
