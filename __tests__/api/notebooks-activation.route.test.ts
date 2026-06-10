/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

import { GET } from '@/app/api/notebooks/activation/route';
import { EMPTY_NOTEBOOK_ACTIVATION } from '@/lib/cadernos/activation';

jest.mock('@/lib/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

const mockGetUserAndClientFromBearer = jest.fn();
jest.mock('@/lib/supabase/api-request-user', () => ({
  getUserAndClientFromBearer: jest.fn((...args: unknown[]) =>
    mockGetUserAndClientFromBearer(...args),
  ),
}));

const mockGetNotebookActivationCached = jest.fn();
jest.mock('@/lib/cache', () => ({
  getNotebookActivationCached: jest.fn((...args: unknown[]) =>
    mockGetNotebookActivationCached(...args),
  ),
}));

const USER_ID = '550e8400-e29b-41d4-a716-446655440000';

describe('GET /api/notebooks/activation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserAndClientFromBearer.mockResolvedValue({
      user: { id: USER_ID, email: 'aluno@test.com' },
    });
    mockGetNotebookActivationCached.mockResolvedValue(EMPTY_NOTEBOOK_ACTIVATION);
  });

  function makeRequest() {
    return new NextRequest('https://avant.test/api/notebooks/activation', {
      headers: { authorization: 'Bearer token' },
    });
  }

  it('retorna 401 sem auth', async () => {
    mockGetUserAndClientFromBearer.mockResolvedValue(null);

    const response = await GET(makeRequest());

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Não autorizado' });
    expect(mockGetNotebookActivationCached).not.toHaveBeenCalled();
  });

  it('retorna 200 com status de ativação do cache', async () => {
    const status = {
      notebookCount: 2,
      hasNotebookWithItems: true,
      emptyNotebookCount: 1,
    };
    mockGetNotebookActivationCached.mockResolvedValue(status);

    const response = await GET(makeRequest());

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(status);
    expect(mockGetNotebookActivationCached).toHaveBeenCalledWith(USER_ID);
  });

  it('retorna 500 quando o cache falha', async () => {
    mockGetNotebookActivationCached.mockRejectedValue(new Error('supabase down'));

    const response = await GET(makeRequest());

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'Erro interno' });
  });
});
