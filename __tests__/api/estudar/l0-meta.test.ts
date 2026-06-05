/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

import { GET } from '@/app/api/estudar/l0-meta/route';

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

const mockGetEstudarL0GenerationCached = jest.fn();
jest.mock('@/lib/estudar/l0Generation', () => ({
  getEstudarL0GenerationCached: jest.fn((...args: unknown[]) =>
    mockGetEstudarL0GenerationCached(...args),
  ),
}));

describe('GET /api/estudar/l0-meta', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetEstudarL0GenerationCached.mockResolvedValue('idb2-42-2026-06-05T00:00:00Z');
  });

  function makeRequest() {
    return new NextRequest('https://avant.test/api/estudar/l0-meta', {
      method: 'GET',
      headers: { authorization: 'Bearer token' },
    });
  }

  it('retorna 401 sem sessão', async () => {
    mockGetUserAndClientFromBearer.mockResolvedValue(null);

    const response = await GET(makeRequest());

    expect(response.status).toBe(401);
    expect(mockGetEstudarL0GenerationCached).not.toHaveBeenCalled();
  });

  it('retorna generation para usuário autenticado', async () => {
    mockGetUserAndClientFromBearer.mockResolvedValue({
      user: { id: 'user-1', email: 'aluno@test.com' },
      supabase: {},
    });

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ generation: 'idb2-42-2026-06-05T00:00:00Z' });
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
  });
});
