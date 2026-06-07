/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

import { GET, POST } from '@/app/api/cache/revalidate/route';

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
  const originalSupabaseWebhookSecret = process.env.SUPABASE_WEBHOOK_SECRET;
  const originalWebhookSecret = process.env.WEBHOOK_SECRET;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SUPABASE_WEBHOOK_SECRET = 'secret-test-cache-revalidate-32';
    delete process.env.WEBHOOK_SECRET;
    process.env.NODE_ENV = 'test';
  });

  afterAll(() => {
    process.env.SUPABASE_WEBHOOK_SECRET = originalSupabaseWebhookSecret;
    process.env.WEBHOOK_SECRET = originalWebhookSecret;
    process.env.NODE_ENV = originalNodeEnv;
  });

  function makeRequest(body: object, auth = 'Bearer secret-test-cache-revalidate-32') {
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

  it('aceita WEBHOOK_SECRET legado quando SUPABASE_WEBHOOK_SECRET não está definido', async () => {
    delete process.env.SUPABASE_WEBHOOK_SECRET;
    process.env.WEBHOOK_SECRET = 'legacy-secret-only';

    const response = await POST(
      makeRequest({ table: 'modulos_estudo' }, 'Bearer legacy-secret-only'),
    );

    expect(response.status).toBe(200);
    expect(mockInvalidateModulosCache).toHaveBeenCalled();
  });

  it('retorna 401 em produção sem secret configurado', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.SUPABASE_WEBHOOK_SECRET;
    delete process.env.WEBHOOK_SECRET;

    const response = await POST(makeRequest({ table: 'modulos_estudo' }, 'Bearer anything'));

    expect(response.status).toBe(401);
    expect(mockInvalidateModulosCache).not.toHaveBeenCalled();
  });

  it('GET retorna 401 sem Authorization', async () => {
    const response = await GET(new NextRequest('https://avant.test/api/cache/revalidate'));
    expect(response.status).toBe(401);
  });

  it('GET retorna 200 com Bearer válido', async () => {
    const response = await GET(
      new NextRequest('https://avant.test/api/cache/revalidate', {
        headers: { authorization: 'Bearer secret-test-cache-revalidate-32' },
      }),
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('ok');
  });
});
