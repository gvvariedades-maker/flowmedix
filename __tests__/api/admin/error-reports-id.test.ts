/**
 * @jest-environment node
 */
import { NextRequest, NextResponse } from 'next/server';
import { PATCH } from '@/app/api/admin/error-reports/[id]/route';

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

type PatchResult = { data: unknown; error: { code?: string; message?: string } | null };

function makePatchAdmin(result: PatchResult) {
  const builder = {
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(result),
  };

  const from = jest.fn().mockReturnValue(builder);
  return { from, builder };
}

function makeThrowingPatchAdmin() {
  const builder = {
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    single: jest.fn().mockRejectedValue(new Error('unexpected failure')),
  };
  const from = jest.fn().mockReturnValue(builder);
  return { from, builder };
}

describe('PATCH /api/admin/error-reports/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('retorna erro de auth quando requireAdminApi falha', async () => {
    mockRequireAdminApi.mockResolvedValue({
      error: NextResponse.json({ error: 'Acesso negado' }, { status: 403 }),
    });

    const request = new NextRequest('https://avant.test/api/admin/error-reports/x', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'triagem' }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: 'x' }) });
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: 'Acesso negado' });
  });

  it('retorna 400 para id inválido', async () => {
    mockRequireAdminApi.mockResolvedValue({
      admin: { from: jest.fn() },
      user: { id: 'admin-id' },
      email: 'admin@avant.com',
    });

    const request = new NextRequest('https://avant.test/api/admin/error-reports/id-invalido', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'triagem' }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: 'id-invalido' }) });
    expect(response.status).toBe(400);
  });

  it('retorna 422 para body inválido', async () => {
    mockRequireAdminApi.mockResolvedValue({
      admin: { from: jest.fn() },
      user: { id: 'admin-id' },
      email: 'admin@avant.com',
    });

    const request = new NextRequest('https://avant.test/api/admin/error-reports/id', {
      method: 'PATCH',
      body: JSON.stringify({}),
      headers: { 'content-type': 'application/json' },
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: '550e8400-e29b-41d4-a716-446655440000' }),
    });

    expect(response.status).toBe(422);
    expect((await response.json()).error).toBe('Dados inválidos');
  });

  it('atualiza report e marca resolvido com resolved_at/resolved_by', async () => {
    const patchedReport = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      status: 'resolvido',
      priority: 'p0',
      resolved_by: 'admin-id',
    };
    const { from, builder } = makePatchAdmin({ data: patchedReport, error: null });

    mockRequireAdminApi.mockResolvedValue({
      admin: { from },
      user: { id: 'admin-id' },
      email: 'admin@avant.com',
    });

    const request = new NextRequest('https://avant.test/api/admin/error-reports/id', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'resolvido', priority: 'p0', admin_notes: 'corrigido' }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: '550e8400-e29b-41d4-a716-446655440000' }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(from).toHaveBeenCalledWith('error_reports');
    expect(builder.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'resolvido',
        priority: 'p0',
        admin_notes: 'corrigido',
        resolved_by: 'admin-id',
      }),
    );
    expect(builder.eq).toHaveBeenCalledWith('id', '550e8400-e29b-41d4-a716-446655440000');
    expect(body.report).toEqual(patchedReport);
  });

  it('retorna 404 quando report não existe', async () => {
    const { from } = makePatchAdmin({
      data: null,
      error: { code: 'PGRST116', message: 'not found' },
    });

    mockRequireAdminApi.mockResolvedValue({
      admin: { from },
      user: { id: 'admin-id' },
      email: 'admin@avant.com',
    });

    const request = new NextRequest('https://avant.test/api/admin/error-reports/id', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'triagem' }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: '550e8400-e29b-41d4-a716-446655440000' }),
    });

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: 'Report não encontrado' });
  });

  it('retorna 500 quando o banco falha ao atualizar report', async () => {
    const { from } = makePatchAdmin({
      data: null,
      error: { code: 'XX000', message: 'db down' },
    });

    mockRequireAdminApi.mockResolvedValue({
      admin: { from },
      user: { id: 'admin-id' },
      email: 'admin@avant.com',
    });

    const request = new NextRequest('https://avant.test/api/admin/error-reports/id', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'triagem' }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: '550e8400-e29b-41d4-a716-446655440000' }),
    });

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'Erro ao atualizar report' });
  });

  it('retorna 500 em erro inesperado (catch)', async () => {
    const { from } = makeThrowingPatchAdmin();

    mockRequireAdminApi.mockResolvedValue({
      admin: { from },
      user: { id: 'admin-id' },
      email: 'admin@avant.com',
    });

    const request = new NextRequest('https://avant.test/api/admin/error-reports/id', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'triagem' }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: '550e8400-e29b-41d4-a716-446655440000' }),
    });

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'Erro interno' });
  });
});
