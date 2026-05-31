/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

import { GET } from '@/app/api/vitrine/facets/route';

jest.mock('@/lib/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/lib/e2e/bypass', () => ({
  isE2eBypassEnabled: jest.fn(() => false),
}));

const mockGetUserAndClientFromBearer = jest.fn();
jest.mock('@/lib/supabase/api-request-user', () => ({
  getUserAndClientFromBearer: jest.fn((...args: unknown[]) =>
    mockGetUserAndClientFromBearer(...args),
  ),
}));

const mockGetVitrineFacetsCached = jest.fn();
jest.mock('@/lib/cache', () => ({
  getVitrineFacetsCached: jest.fn((...args: unknown[]) => mockGetVitrineFacetsCached(...args)),
}));

const USER_ID = '550e8400-e29b-41d4-a716-446655440000';

const facetsOk = {
  bancas: ['CESPE', 'FGV'],
  assuntos: ['Farmacologia', 'Urgências e Emergências'],
};

describe('GET /api/vitrine/facets', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserAndClientFromBearer.mockResolvedValue({
      user: { id: USER_ID, email: 'aluno@test.com' },
      supabase: { from: jest.fn() },
    });
    mockGetVitrineFacetsCached.mockResolvedValue(facetsOk);
  });

  function makeRequest(query: Record<string, string | string[]>) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (Array.isArray(value)) {
        value.forEach((v) => params.append(key, v));
      } else {
        params.set(key, value);
      }
    }
    return new NextRequest(`https://avant.test/api/vitrine/facets?${params}`, {
      headers: { authorization: 'Bearer token' },
    });
  }

  it('retorna 401 sem auth', async () => {
    mockGetUserAndClientFromBearer.mockResolvedValue(null);

    const response = await GET(makeRequest({}));

    expect(response.status).toBe(401);
    expect(mockGetVitrineFacetsCached).not.toHaveBeenCalled();
  });

  it('retorna 200 com múltiplas bancas (bancas)', async () => {
    const response = await GET(makeRequest({ bancas: ['FGV', 'CESPE'] }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(facetsOk);
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    expect(mockGetVitrineFacetsCached).toHaveBeenCalledWith(
      USER_ID,
      { bancas: ['FGV', 'CESPE'] },
      false,
    );
  });

  it('retorna 200 com múltiplas bancas legado (?banca=A&banca=B)', async () => {
    const response = await GET(makeRequest({ banca: ['FGV', 'CESPE'] }));

    expect(response.status).toBe(200);
    expect(mockGetVitrineFacetsCached).toHaveBeenCalledWith(
      USER_ID,
      { bancas: ['FGV', 'CESPE'] },
      false,
    );
  });
});
