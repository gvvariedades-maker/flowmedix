/**
 * Testes de Integração para Sistema de Cache
 *
 * Mock do next/cache para evitar dependências de Request/Response no ambiente Jest
 */
jest.mock('next/cache', () => ({
  unstable_cache: (fn: () => Promise<unknown>) => fn,
  revalidateTag: jest.fn(),
}));

const mockSupabaseChain = {
  select: () => mockSupabaseChain,
  order: () => mockSupabaseChain,
  limit: () => Promise.resolve({ data: [], error: null }),
  single: () => Promise.resolve({ data: null, error: { code: 'PGRST116' } }),
  eq: () => mockSupabaseChain,
};

const mockRpc = jest.fn(async () => ({
  data: { total_questions: 42, total_slides: 168 },
  error: null,
}));

jest.mock('@/lib/supabase/server', () => ({
  createServerSupabase: jest.fn(async () => ({
    from: () => mockSupabaseChain,
    rpc: mockRpc,
  })),
}));

jest.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => mockSupabaseChain,
  }),
}));

import {
  getCatalogStats,
  getModulosEstudoCached,
  getQuestaoBySlugCached,
  getHistoricoQuestoesCached,
  invalidateModulosCache,
  invalidateUserModulosCache,
  invalidateVitrinePageCache,
} from '@/lib/cache';
import { revalidateTag } from 'next/cache';

describe('Sistema de Cache', () => {
  beforeAll(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getModulosEstudoCached', () => {
    it('deve retornar array vazio se não houver dados', async () => {
      const result = await getModulosEstudoCached();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getQuestaoBySlugCached', () => {
    it('deve retornar null para slug inexistente', async () => {
      const result = await getQuestaoBySlugCached('slug-inexistente-12345');
      expect(result).toBeNull();
    });
  });

  describe('getHistoricoQuestoesCached', () => {
    it('deve retornar array vazio se não houver histórico', async () => {
      const result = await getHistoricoQuestoesCached();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getCatalogStats', () => {
    it('deve retornar totais parseados da RPC', async () => {
      const result = await getCatalogStats();
      expect(result).toEqual({ totalQuestions: 42, totalSlides: 168 });
      expect(mockRpc).toHaveBeenCalledWith('avant_catalog_stats');
    });
  });

  describe('invalidateModulosCache', () => {
    it('deve invalidar cache sem erros', async () => {
      await expect(invalidateModulosCache()).resolves.not.toThrow();
      expect(revalidateTag).toHaveBeenCalledWith('modulos-estudo', { expire: 0 });
      expect(revalidateTag).toHaveBeenCalledWith('catalog-stats', { expire: 0 });
    });
  });

  describe('invalidateUserModulosCache', () => {
    it('invalida tags globais e do usuário', async () => {
      await invalidateUserModulosCache('user-42');

      expect(revalidateTag).toHaveBeenCalledWith('modulos-estudo', { expire: 0 });
      expect(revalidateTag).toHaveBeenCalledWith('user', { expire: 0 });
      expect(revalidateTag).toHaveBeenCalledWith('user-user-42', { expire: 0 });
      expect(revalidateTag).toHaveBeenCalledWith('vitrine-page-user-user-42', { expire: 0 });
      expect(revalidateTag).toHaveBeenCalledWith('vitrine-facets-user-user-42', { expire: 0 });
    });
  });

  describe('invalidateVitrinePageCache', () => {
    it('invalida tags granulares por usuário e filtros', async () => {
      await invalidateVitrinePageCache('user-42', {
        banca: 'CESPE',
        assunto: 'Farmacologia',
        q: 'dose',
      });

      expect(revalidateTag).toHaveBeenCalledWith('vitrine-page', { expire: 0 });
      expect(revalidateTag).toHaveBeenCalledWith('vitrine-page-user-user-42', { expire: 0 });
      expect(revalidateTag).toHaveBeenCalledWith(
        expect.stringMatching(/^vitrine-page-filter-[a-f0-9]{16}$/),
        { expire: 0 },
      );
      expect(revalidateTag).toHaveBeenCalledWith(
        expect.stringMatching(/^vitrine-page-user-filter-user-42-[a-f0-9]{16}$/),
        { expire: 0 },
      );
    });
  });
});
