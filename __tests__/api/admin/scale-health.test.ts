/**
 * @jest-environment node
 */
import { GET } from '@/app/api/admin/scale-health/route';
import { NextResponse } from 'next/server';

const mockRequireAdminApi = jest.fn();
const mockRunScaleHealthCheck = jest.fn();

jest.mock('@/lib/admin/requireAdmin', () => ({
  requireAdminApi: (...args: unknown[]) => mockRequireAdminApi(...args),
}));

jest.mock('@/lib/scale/healthCheck', () => ({
  runScaleHealthCheck: (...args: unknown[]) => mockRunScaleHealthCheck(...args),
}));

jest.mock('@/lib/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('GET /api/admin/scale-health', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('retorna erro de auth quando requireAdminApi falha', async () => {
    mockRequireAdminApi.mockResolvedValue({
      error: NextResponse.json({ error: 'Não autenticado' }, { status: 401 }),
    });

    const response = await GET();
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Não autenticado' });
    expect(mockRunScaleHealthCheck).not.toHaveBeenCalled();
  });

  it('retorna status critical quando há alerta crítico', async () => {
    mockRequireAdminApi.mockResolvedValue({
      admin: { rpc: jest.fn() },
      user: { id: 'admin-id' },
      email: 'admin@avant.com',
    });
    mockRunScaleHealthCheck.mockResolvedValue({
      metrics: null,
      rpcAvailable: true,
      alerts: [{ level: 'critical', code: 'CATALOG_AT_VITRINE_CAP', message: 'critical' }],
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe('critical');
    expect(body.alerts[0].code).toBe('CATALOG_AT_VITRINE_CAP');
  });
});
