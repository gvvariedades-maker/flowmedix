/**
 * @jest-environment node
 */
import { NextRequest, NextResponse } from 'next/server';
import { GET } from '@/app/api/admin/error-reports/route';

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

function makeGetBuilder(result: { data: unknown[]; count: number | null; error: unknown | null }) {
  const builder = {
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    or: jest.fn().mockResolvedValue(result),
  };
  return builder;
}

function makeThrowingGetBuilder() {
  const builder = {
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    or: jest.fn().mockRejectedValue(new Error('unexpected failure')),
  };
  return builder;
}

describe('GET /api/admin/error-reports', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('retorna erro de auth quando requireAdminApi falha', async () => {
    mockRequireAdminApi.mockResolvedValue({
      error: NextResponse.json({ error: 'Não autenticado' }, { status: 401 }),
    });

    const request = new NextRequest('https://avant.test/api/admin/error-reports', { method: 'GET' });
    const response = await GET(request);

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Não autenticado' });
  });

  it('retorna 400 para query inválida', async () => {
    mockRequireAdminApi.mockResolvedValue({
      admin: { from: jest.fn() },
      user: { id: 'admin-id' },
      email: 'admin@avant.com',
    });

    const request = new NextRequest(
      'https://avant.test/api/admin/error-reports?page=0&page_size=20',
      { method: 'GET' },
    );
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Parâmetros inválidos');
  });

  it('lista reports agrupados por slug quando group_by_slug=1', async () => {
    const dbResult = {
      data: [
        { id: 'r1', modulo_slug: 'questao-a', created_at: '2026-06-01T10:00:00.000Z', status: 'novo', category: 'slides', priority: 'p2' },
        { id: 'r2', modulo_slug: 'questao-a', created_at: '2026-06-02T10:00:00.000Z', status: 'novo', category: 'gabarito', priority: 'p1' },
        { id: 'r3', modulo_slug: 'questao-b', created_at: '2026-06-03T10:00:00.000Z', status: 'novo', category: 'outro', priority: 'p2' },
      ],
      error: null,
    };
    const getBuilder = {
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue(dbResult),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
    };
    const from = jest.fn().mockReturnValue(getBuilder);

    mockRequireAdminApi.mockResolvedValue({
      admin: { from },
      user: { id: 'admin-id' },
      email: 'admin@avant.com',
    });

    const request = new NextRequest(
      'https://avant.test/api/admin/error-reports?page=1&page_size=10&group_by_slug=1&status=novo',
      { method: 'GET' },
    );

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.grouped).toBe(true);
    expect(body.groups).toHaveLength(2);
    expect(body.groups[0].modulo_slug).toBe('questao-a');
    expect(body.groups[0].count).toBe(2);
    expect(getBuilder.limit).toHaveBeenCalledWith(5000);
    expect(getBuilder.range).toBeUndefined();
  });

  it('lista reports com filtros e paginação', async () => {
    const dbResult = {
      data: [{ id: 'r1', status: 'novo', priority: 'p2' }],
      count: 1,
      error: null,
    };
    const getBuilder = makeGetBuilder(dbResult);
    const from = jest.fn().mockReturnValue(getBuilder);

    mockRequireAdminApi.mockResolvedValue({
      admin: { from },
      user: { id: 'admin-id' },
      email: 'admin@avant.com',
    });

    const request = new NextRequest(
      'https://avant.test/api/admin/error-reports?page=2&page_size=10&status=novo&priority=p1&context_type=lesson&category=enunciado&q=erro&from=2026-01-01T00:00:00.000Z&to=2026-12-31T23:59:59.000Z',
      { method: 'GET' },
    );

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(from).toHaveBeenCalledWith('error_reports');
    expect(getBuilder.select).toHaveBeenCalled();
    expect(getBuilder.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(getBuilder.range).toHaveBeenCalledWith(10, 19);
    expect(getBuilder.eq).toHaveBeenCalledWith('status', 'novo');
    expect(getBuilder.eq).toHaveBeenCalledWith('priority', 'p1');
    expect(getBuilder.eq).toHaveBeenCalledWith('context_type', 'lesson');
    expect(getBuilder.eq).toHaveBeenCalledWith('category', 'enunciado');
    expect(getBuilder.gte).toHaveBeenCalledWith('created_at', '2026-01-01T00:00:00.000Z');
    expect(getBuilder.lte).toHaveBeenCalledWith('created_at', '2026-12-31T23:59:59.000Z');
    expect(getBuilder.or).toHaveBeenCalledWith('description.ilike.%erro%,modulo_slug.ilike.%erro%');
    expect(body.reports).toHaveLength(1);
    expect(body.pagination).toEqual({
      page: 2,
      page_size: 10,
      total: 1,
      total_pages: 1,
    });
  });

  it('retorna 500 quando o banco falha ao listar reports', async () => {
    const dbResult = {
      data: [],
      count: 0,
      error: { message: 'db down' },
    };
    const getBuilder = makeGetBuilder(dbResult);
    const from = jest.fn().mockReturnValue(getBuilder);

    mockRequireAdminApi.mockResolvedValue({
      admin: { from },
      user: { id: 'admin-id' },
      email: 'admin@avant.com',
    });

    const request = new NextRequest(
      'https://avant.test/api/admin/error-reports?page=1&page_size=20&q=falha',
      {
        method: 'GET',
      },
    );
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: 'Erro ao listar reports' });
  });

  it('retorna 500 em erro inesperado (catch)', async () => {
    const getBuilder = makeThrowingGetBuilder();
    const from = jest.fn().mockReturnValue(getBuilder);

    mockRequireAdminApi.mockResolvedValue({
      admin: { from },
      user: { id: 'admin-id' },
      email: 'admin@avant.com',
    });

    const request = new NextRequest(
      'https://avant.test/api/admin/error-reports?page=1&page_size=20&q=falha',
      {
        method: 'GET',
      },
    );
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: 'Erro interno' });
  });
});
