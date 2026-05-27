/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

import { POST } from '@/app/api/cache/revalidate/route';

const mockInvalidateModulosCache = jest.fn();
const mockInvalidateQuestoesCache = jest.fn();
const mockInvalidateHistoricoCache = jest.fn();
const mockInvalidateHistoricoUserCache = jest.fn();
const mockInvalidateVitrineFacetsCache = jest.fn();
const mockInvalidateVitrinePageCache = jest.fn();
const mockInvalidateAllCache = jest.fn();
const mockRevalidateCache = jest.fn();

jest.mock('@/lib/cache', () => ({
  invalidateModulosCache: jest.fn((...args: unknown[]) => mockInvalidateModulosCache(...args)),
  invalidateQuestoesCache: jest.fn((...args: unknown[]) => mockInvalidateQuestoesCache(...args)),
  invalidateHistoricoCache: jest.fn((...args: unknown[]) => mockInvalidateHistoricoCache(...args)),
  invalidateHistoricoUserCache: jest.fn((...args: unknown[]) =>
    mockInvalidateHistoricoUserCache(...args),
  ),
  invalidateVitrineFacetsCache: jest.fn((...args: unknown[]) =>
    mockInvalidateVitrineFacetsCache(...args),
  ),
  invalidateVitrinePageCache: jest.fn((...args: unknown[]) => mockInvalidateVitrinePageCache(...args)),
  invalidateAllCache: jest.fn((...args: unknown[]) => mockInvalidateAllCache(...args)),
  revalidateCache: jest.fn((...args: unknown[]) => mockRevalidateCache(...args)),
}));

jest.mock('@/lib/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('POST /api/cache/revalidate', () => {
  const originalWebhookSecret = process.env.WEBHOOK_SECRET;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.WEBHOOK_SECRET = 'secret-test';
  });

  afterAll(() => {
    process.env.WEBHOOK_SECRET = originalWebhookSecret;
  });

  function makeRequest(body: object, auth = 'Bearer secret-test') {
    return new NextRequest('https://avant.test/api/cache/revalidate', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'content-type': 'application/json',
        authorization: auth,
      },
    });
  }

  it('revalida histórico granular por userId + filtros', async () => {
    const response = await POST(
      makeRequest({
        table: 'historico_questoes',
        userId: 'user-123',
        filters: {
          page: { banca: 'FGV', assunto: 'Farmacologia', q: 'dose' },
          facets: { banca: 'FGV' },
        },
      }),
    );

    expect(response.status).toBe(200);
    expect(mockInvalidateHistoricoUserCache).toHaveBeenCalledWith('user-123');
    expect(mockInvalidateVitrinePageCache).toHaveBeenCalledWith('user-123', {
      banca: 'FGV',
      assunto: 'Farmacologia',
      q: 'dose',
    });
    expect(mockInvalidateVitrineFacetsCache).toHaveBeenCalledWith('user-123', { banca: 'FGV' });
    expect(mockInvalidateHistoricoCache).not.toHaveBeenCalled();
    expect(mockInvalidateAllCache).not.toHaveBeenCalled();
  });

  it('faz fallback para invalidação completa quando tabela é desconhecida', async () => {
    const response = await POST(makeRequest({ table: 'tabela_desconhecida' }));

    expect(response.status).toBe(200);
    expect(mockInvalidateAllCache).toHaveBeenCalledTimes(1);
  });

  it('revalida tags explícitas sanitizadas', async () => {
    const response = await POST(
      makeRequest({
        tags: ['vitrine-page', '', 'user-123'],
      }),
    );

    expect(response.status).toBe(200);
    expect(mockRevalidateCache).toHaveBeenCalledWith(['vitrine-page', 'user-123']);
  });
});
