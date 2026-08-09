/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

const mockGetUserAndClientFromBearer = jest.fn();
const mockResolveAccessibleModulosWhenEmpty = jest.fn();
const mockInvalidateNotebookActivationCache = jest.fn();
const mockIsAdminSessionEmail = jest.fn();

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

jest.mock('@/lib/concursos/resolveCatalogWhenEmpty', () => ({
  resolveAccessibleModulosWhenEmpty: (...args: unknown[]) =>
    mockResolveAccessibleModulosWhenEmpty(...args),
}));

jest.mock('@/lib/cache', () => ({
  invalidateNotebookActivationCache: (...args: unknown[]) =>
    mockInvalidateNotebookActivationCache(...args),
}));

jest.mock('@/lib/constants', () => {
  const actual = jest.requireActual<typeof import('@/lib/constants')>('@/lib/constants');
  return {
    ...actual,
    isAdminSessionEmail: (...args: unknown[]) => mockIsAdminSessionEmail(...args),
  };
});

import { POST } from '@/app/api/notebooks/from-pack/route';

const USER_ID = '550e8400-e29b-41d4-a716-446655440000';
const NOTEBOOK_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

type FromHandler = {
  findExisting?: { data: { id: string } | null; error: null | { code?: string; message?: string } };
  insertNotebook?: {
    data: { id: string } | null;
    error: null | { code?: string; message?: string };
  };
  insertItems?: { error: null | { message?: string } };
  deleteNotebook?: { error: null };
};

function createSupabaseMock(handlers: FromHandler = {}) {
  const findMaybeSingle = jest.fn().mockResolvedValue(
    handlers.findExisting ?? { data: null, error: null },
  );
  const insertNotebookSingle = jest.fn().mockResolvedValue(
    handlers.insertNotebook ?? { data: { id: NOTEBOOK_ID }, error: null },
  );
  const insertItems = jest.fn().mockResolvedValue(handlers.insertItems ?? { error: null });
  const deleteEqUser = jest.fn().mockResolvedValue(handlers.deleteNotebook ?? { error: null });

  const from = jest.fn((table: string) => {
    if (table === 'study_notebooks') {
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle: findMaybeSingle,
            }),
          }),
        }),
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: insertNotebookSingle,
          }),
        }),
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: deleteEqUser,
          }),
        }),
      };
    }
    if (table === 'study_notebook_items') {
      return {
        insert: insertItems,
      };
    }
    throw new Error(`unexpected table ${table}`);
  });

  return {
    supabase: { from },
    findMaybeSingle,
    insertNotebookSingle,
    insertItems,
    deleteEqUser,
  };
}

function makeRequest(body: unknown) {
  return new NextRequest('https://avant.test/api/notebooks/from-pack', {
    method: 'POST',
    headers: {
      authorization: 'Bearer token',
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

const validBody = {
  pack_id: 'comece-10min',
  title: 'Comece em 10 minutos',
  items: [
    { modulo_slug: 'q-1', titulo_aula: 'Imunização', topico: 'Saúde Pública' },
    { modulo_slug: 'q-2', titulo_aula: 'Imunização', topico: 'Saúde Pública' },
  ],
};

describe('POST /api/notebooks/from-pack', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsAdminSessionEmail.mockReturnValue(false);
    mockInvalidateNotebookActivationCache.mockReturnValue(undefined);
    mockResolveAccessibleModulosWhenEmpty.mockResolvedValue([
      { modulo_slug: 'q-1' },
      { modulo_slug: 'q-2' },
      { modulo_slug: 'q-3' },
    ]);
  });

  it('retorna 401 sem Bearer', async () => {
    mockGetUserAndClientFromBearer.mockResolvedValue(null);

    const response = await POST(makeRequest(validBody));

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Não autorizado' });
    expect(mockResolveAccessibleModulosWhenEmpty).not.toHaveBeenCalled();
  });

  it('retorna 400 para pack desconhecido', async () => {
    const { supabase } = createSupabaseMock();
    mockGetUserAndClientFromBearer.mockResolvedValue({
      user: { id: USER_ID, email: 'aluno@test.com' },
      supabase,
    });

    const response = await POST(
      makeRequest({ ...validBody, pack_id: 'pack-inexistente' }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Pack desconhecido' });
  });

  it('retorna 400 quando nenhum slug é acessível', async () => {
    const { supabase } = createSupabaseMock();
    mockGetUserAndClientFromBearer.mockResolvedValue({
      user: { id: USER_ID, email: 'aluno@test.com' },
      supabase,
    });
    mockResolveAccessibleModulosWhenEmpty.mockResolvedValue([{ modulo_slug: 'outro' }]);

    const response = await POST(makeRequest(validBody));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: 'Nenhuma questão acessível neste pack',
    });
  });

  it('filtra slug fora do pacote e cria só com acessíveis', async () => {
    const { supabase, insertItems } = createSupabaseMock();
    mockGetUserAndClientFromBearer.mockResolvedValue({
      user: { id: USER_ID, email: 'aluno@test.com' },
      supabase,
    });
    mockResolveAccessibleModulosWhenEmpty.mockResolvedValue([{ modulo_slug: 'q-1' }]);

    const response = await POST(
      makeRequest({
        ...validBody,
        items: [
          { modulo_slug: 'q-1' },
          { modulo_slug: 'fora-do-pacote' },
          { modulo_slug: 'q-1' },
        ],
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json).toEqual({
      notebookId: NOTEBOOK_ID,
      entrySlug: 'q-1',
      created: true,
    });
    expect(insertItems).toHaveBeenCalledWith([
      {
        notebook_id: NOTEBOOK_ID,
        modulo_slug: 'q-1',
        titulo_aula: null,
        topico: null,
        position: 0,
      },
    ]);
  });

  it('retorna 201 na criação e invalida cache de ativação', async () => {
    const { supabase, insertItems } = createSupabaseMock();
    mockGetUserAndClientFromBearer.mockResolvedValue({
      user: { id: USER_ID, email: 'aluno@test.com' },
      supabase,
    });

    const response = await POST(makeRequest(validBody));
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json).toEqual({
      notebookId: NOTEBOOK_ID,
      entrySlug: 'q-1',
      created: true,
    });
    expect(insertItems).toHaveBeenCalledTimes(1);
    expect(mockInvalidateNotebookActivationCache).toHaveBeenCalledWith(USER_ID);
    expect(mockResolveAccessibleModulosWhenEmpty).toHaveBeenCalledWith(USER_ID, false);
  });

  it('é idempotente: segundo POST devolve o notebook existente sem duplicar', async () => {
    const existingId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
    const { supabase, insertItems, insertNotebookSingle } = createSupabaseMock({
      findExisting: { data: { id: existingId }, error: null },
    });
    mockGetUserAndClientFromBearer.mockResolvedValue({
      user: { id: USER_ID, email: 'aluno@test.com' },
      supabase,
    });

    const response = await POST(makeRequest(validBody));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ notebookId: existingId, created: false });
    expect(insertNotebookSingle).not.toHaveBeenCalled();
    expect(insertItems).not.toHaveBeenCalled();
    expect(mockResolveAccessibleModulosWhenEmpty).not.toHaveBeenCalled();
    expect(mockInvalidateNotebookActivationCache).not.toHaveBeenCalled();
  });
});
