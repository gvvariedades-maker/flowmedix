/**
 * @jest-environment node
 */
import { NextRequest, NextResponse } from 'next/server';
import { PATCH } from '@/app/api/admin/error-reports/bulk/route';

const mockRequireAdminApi = jest.fn();

jest.mock('@/lib/admin/requireAdmin', () => ({
  requireAdminApi: (...args: unknown[]) => mockRequireAdminApi(...args),
}));

jest.mock('@/lib/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('PATCH /api/admin/error-reports/bulk', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('retorna erro de auth quando requireAdminApi falha', async () => {
    mockRequireAdminApi.mockResolvedValue({
      error: NextResponse.json({ error: 'Não autenticado' }, { status: 401 }),
    });

    const request = new NextRequest('https://avant.test/api/admin/error-reports/bulk', {
      method: 'PATCH',
      body: JSON.stringify({ report_ids: ['00000000-0000-4000-8000-000000000001'], status: 'resolvido' }),
    });
    const response = await PATCH(request);
    expect(response.status).toBe(401);
  });

  it('atualiza múltiplos reportes', async () => {
    const updated = [
      { id: '00000000-0000-4000-8000-000000000001', status: 'resolvido' },
      { id: '00000000-0000-4000-8000-000000000002', status: 'resolvido' },
    ];
    const builder = {
      update: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({ data: updated, error: null }),
    };
    const from = jest.fn().mockReturnValue(builder);

    mockRequireAdminApi.mockResolvedValue({
      admin: { from },
      user: { id: 'admin-id' },
      email: 'admin@avant.com',
    });

    const request = new NextRequest('https://avant.test/api/admin/error-reports/bulk', {
      method: 'PATCH',
      body: JSON.stringify({
        report_ids: [
          '00000000-0000-4000-8000-000000000001',
          '00000000-0000-4000-8000-000000000002',
        ],
        status: 'resolvido',
        admin_notes: 'Corrigido no lab',
      }),
    });

    const response = await PATCH(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.updated_count).toBe(2);
    expect(builder.in).toHaveBeenCalledWith('id', [
      '00000000-0000-4000-8000-000000000001',
      '00000000-0000-4000-8000-000000000002',
    ]);
  });
});
