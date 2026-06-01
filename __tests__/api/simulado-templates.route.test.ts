/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/simulado/templates/route';
import { DELETE } from '@/app/api/simulado/templates/[id]/route';

const mockGetUserAndClientFromBearer = jest.fn();
const mockCreateServerSupabase = jest.fn();
const mockListSimuladoTemplates = jest.fn();
const mockCreateSimuladoTemplate = jest.fn();
const mockDeleteSimuladoTemplate = jest.fn();

jest.mock('@/lib/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/lib/supabase/api-request-user', () => ({
  getUserAndClientFromBearer: (...args: unknown[]) => mockGetUserAndClientFromBearer(...args),
}));

jest.mock('@/lib/supabase/server', () => ({
  createServerSupabase: (...args: unknown[]) => mockCreateServerSupabase(...args),
}));

jest.mock('@/lib/simulado/templates', () => ({
  listSimuladoTemplates: (...args: unknown[]) => mockListSimuladoTemplates(...args),
  createSimuladoTemplate: (...args: unknown[]) => mockCreateSimuladoTemplate(...args),
  deleteSimuladoTemplate: (...args: unknown[]) => mockDeleteSimuladoTemplate(...args),
}));

const USER_ID = '550e8400-e29b-41d4-a716-446655440000';
const TEMPLATE_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

function makeTemplatesRequest(method: 'GET' | 'POST', body?: object) {
  return new NextRequest('https://avant.test/api/simulado/templates', {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: { authorization: 'Bearer token', 'content-type': 'application/json' },
  });
}

function makeDeleteRequest(id: string) {
  return new NextRequest(`https://avant.test/api/simulado/templates/${id}`, {
    method: 'DELETE',
    headers: { authorization: 'Bearer token' },
  });
}

describe('/api/simulado/templates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserAndClientFromBearer.mockResolvedValue({ user: { id: USER_ID } });
    mockCreateServerSupabase.mockResolvedValue({});
  });

  it('GET retorna lista de templates do usuário', async () => {
    mockListSimuladoTemplates.mockResolvedValue([
      {
        id: TEMPLATE_ID,
        titulo: 'Prova IBFC',
        modo: 'prova',
        quantidade: 40,
        filtros: { bancas: ['IBFC'], assuntos: null, q: null },
        ritmo_meta: '3min',
        ritmo_meta_segundos_por_questao: 180,
        ultimo_uso_em: null,
        created_at: '2026-06-01T00:00:00.000Z',
      },
    ]);

    const response = await GET(makeTemplatesRequest('GET'));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.templates).toHaveLength(1);
    expect(json.templates[0]).toEqual(
      expect.objectContaining({
        id: TEMPLATE_ID,
        titulo: 'Prova IBFC',
        modo: 'prova',
      }),
    );
    expect(mockListSimuladoTemplates).toHaveBeenCalledWith({}, USER_ID);
  });

  it('POST cria template com payload válido', async () => {
    const created = {
      id: TEMPLATE_ID,
      titulo: 'Prova CESPE',
      modo: 'prova' as const,
      quantidade: 20,
      filtros: {},
      ritmo_meta: '2min' as const,
      ritmo_meta_segundos_por_questao: 120,
      ultimo_uso_em: null,
      created_at: '2026-06-01T00:00:00.000Z',
    };
    mockCreateSimuladoTemplate.mockResolvedValue({ template: created });

    const response = await POST(
      makeTemplatesRequest('POST', {
        titulo: 'Prova CESPE',
        modo: 'prova',
        quantidade: 20,
        ritmo_meta: '2min',
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ success: true, template: created });
    expect(mockCreateSimuladoTemplate).toHaveBeenCalledWith(
      {},
      USER_ID,
      expect.objectContaining({
        titulo: 'Prova CESPE',
        modo: 'prova',
        quantidade: 20,
        ritmo_meta: '2min',
      }),
    );
  });

  it('POST rejeita payload sem título', async () => {
    const response = await POST(
      makeTemplatesRequest('POST', {
        titulo: '   ',
        modo: 'prova',
        quantidade: 20,
      }),
    );

    expect(response.status).toBe(400);
    expect(mockCreateSimuladoTemplate).not.toHaveBeenCalled();
  });

  it('DELETE remove template existente', async () => {
    mockDeleteSimuladoTemplate.mockResolvedValue(true);

    const response = await DELETE(makeDeleteRequest(TEMPLATE_ID), {
      params: Promise.resolve({ id: TEMPLATE_ID }),
    });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ success: true });
    expect(mockDeleteSimuladoTemplate).toHaveBeenCalledWith({}, USER_ID, TEMPLATE_ID);
  });

  it('DELETE retorna 404 quando template não existe', async () => {
    mockDeleteSimuladoTemplate.mockResolvedValue(false);

    const response = await DELETE(makeDeleteRequest(TEMPLATE_ID), {
      params: Promise.resolve({ id: TEMPLATE_ID }),
    });

    expect(response.status).toBe(404);
  });
});
