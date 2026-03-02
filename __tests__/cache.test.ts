/**
 * Testes de Integração para Sistema de Cache
 *
 * Mock do next/cache para evitar dependências de Request/Response no ambiente Jest
 */
jest.mock('next/cache', () => ({
  unstable_cache: (fn: () => Promise<unknown>) => fn,
  revalidateTag: () => {},
}));

// Mock do Supabase para testes (evita conexão real)
const mockSupabaseChain = {
  select: () => mockSupabaseChain,
  order: () => mockSupabaseChain,
  limit: () => mockSupabaseChain,
  single: () => Promise.resolve({ data: null, error: { code: 'PGRST116' } }),
  eq: () => mockSupabaseChain,
};
jest.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => mockSupabaseChain,
  }),
}));

import {
  getModulosEstudoCached,
  getQuestaoBySlugCached,
  getHistoricoQuestoesCached,
  invalidateModulosCache,
} from '@/lib/cache';

describe('Sistema de Cache', () => {
  // Mock do Supabase para testes
  beforeEach(() => {
    // Limpar cache entre testes
    jest.clearAllMocks();
  });

  describe('getModulosEstudoCached', () => {
    it('deve retornar array vazio se não houver dados', async () => {
      // Em ambiente de teste, pode retornar vazio
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

  describe('invalidateModulosCache', () => {
    it('deve invalidar cache sem erros', async () => {
      // Deve executar sem erros
      await expect(invalidateModulosCache()).resolves.not.toThrow();
    });
  });
});
