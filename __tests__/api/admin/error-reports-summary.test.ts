/**
 * @jest-environment node
 */
import { NextRequest, NextResponse } from 'next/server';
import { GET } from '@/app/api/admin/error-reports/summary/route';

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

function makeSummaryBuilder(rows: unknown[]) {
  const builder = {
    select: jest.fn().mockReturnThis(),
    not: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockResolvedValue({ data: rows, error: null }),
  };
  return builder;
}

describe('GET /api/admin/error-reports/summary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('retorna erro de auth quando requireAdminApi falha', async () => {
    mockRequireAdminApi.mockResolvedValue({
      error: NextResponse.json({ error: 'Não autenticado' }, { status: 401 }),
    });

    const request = new NextRequest('https://avant.test/api/admin/error-reports/summary', {
      method: 'GET',
    });
    const response = await GET(request);
    expect(response.status).toBe(401);
  });

  it('agrega reportes por slug', async () => {
    const builder = makeSummaryBuilder([
      {
        modulo_slug: 'questao-a',
        created_at: '2026-06-01T10:00:00.000Z',
        status: 'novo',
        category: 'slides',
      },
      {
        modulo_slug: 'questao-a',
        created_at: '2026-06-02T10:00:00.000Z',
        status: 'triagem',
        category: 'slides',
      },
      {
        modulo_slug: 'questao-b',
        created_at: '2026-06-03T10:00:00.000Z',
        status: 'novo',
        category: 'gabarito',
      },
    ]);

    const from = jest.fn().mockReturnValue(builder);
    mockRequireAdminApi.mockResolvedValue({
      email: 'admin@test.com',
      admin: { from },
    });

    const request = new NextRequest('https://avant.test/api/admin/error-reports/summary?limit=10', {
      method: 'GET',
    });
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.totals.open).toBe(3);
    expect(body.totals.slides_open).toBe(2);
    expect(body.by_slug[0].modulo_slug).toBe('questao-a');
    expect(body.by_slug[0].open_count).toBe(2);
    expect(body.by_slug[0].slide_reports).toBe(2);
    expect(from).toHaveBeenCalledWith('error_reports');
  });
});
