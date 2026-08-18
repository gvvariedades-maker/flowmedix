/**
 * GOLDEN — Função de leitura em `lib/cache.ts`
 *
 * Canônico: CLAUDE.md §5 (regras de cache) + §2 (RSC não consulta Supabase direto)
 * Rule: .cursor/rules/eng-feature.mdc §3 + §5 (zona VERMELHA — revisão humana)
 * Guardrails: .cursor/rules/avant-engineering.mdc (cache → lib/cache.ts)
 *
 * Ao adicionar leitura cacheada, cole o padrão DENTRO de `lib/cache.ts` (não importe este arquivo).
 * Mudança em `lib/cache.ts` é zona vermelha: implementar com gates, mas não declarar
 * “seguro para prod” sem revisão humana explícita.
 *
 * Invariantes:
 * - `unstable_cache` com key que inclui todos os parâmetros (ex.: slug, userId)
 * - Tags estáveis + tag por recurso (`questao-${slug}`, `user-${userId}`)
 * - Perfil de TTL via `CACHE_CONFIG` (STATIC / SEMI_STATIC / DYNAMIC / USER)
 * - Dentro do callback: `createServerSupabase()` (service role) — NUNCA cookies()/createServerClient
 * - Falha de rede/config: lançar `DataServiceUnavailableError` — NÃO retornar `[]` / `null` falso cacheável
 * - Ausência legítima de dado (slug inexistente): `return null` (isso pode ser cacheado)
 * - Sem userId em dados por usuário: early-return seguro (`[]` / empty), fora do unstable_cache se preferir
 * - Em `lib/cache.ts` real: usar helpers internos `trackCacheMiss` / `trackUnstableCacheFetch` quando existirem
 */

import { unstable_cache } from 'next/cache';
import { CACHE_CONFIG } from '@/lib/cache';
import { DataServiceUnavailableError } from '@/lib/dataServiceError';
import { logger } from '@/lib/logger';

/**
 * Exemplo: leitura de uma linha de `modulos_estudo` por slug (espelha `getQuestaoBySlugCached`).
 *
 * Em produção, implemente em `lib/cache.ts` e exporte de lá.
 * Invalidação: `invalidateQuestaoSlugCache(slug)` / tags `questao` + `questao-${slug}`.
 */
export async function getExampleQuestaoBySlugCached(slug: string) {
  const cacheKey = `example-questao-${slug}`;

  return unstable_cache(
    async () => {
      const { createServerSupabase } = await import('@/lib/supabase/server');
      let supabase: Awaited<ReturnType<typeof createServerSupabase>>;

      try {
        supabase = await createServerSupabase();
      } catch {
        // Config ausente: não cachear “vazio” — falha explícita.
        throw new DataServiceUnavailableError(
          'Configuração incompleta: SUPABASE_SERVICE_ROLE_KEY ausente no servidor.',
        );
      }

      const { data, error } = await supabase
        .from('modulos_estudo')
        .select(
          'id, modulo_slug, conteudo_json, banca, modulo_nome, titulo_aula, created_at, avant_codigo',
        )
        .eq('modulo_slug', slug)
        .maybeSingle();

      if (error) {
        // Rede/PostgREST: lança — se retornasse [], o miss ficaria cacheado por minutos.
        logger.error('Failed to fetch example question from cache', error, { slug });
        throw new DataServiceUnavailableError();
      }

      // Miss legítimo (slug não existe): null é cacheável e correto.
      if (!data) return null;

      return data;
    },
    [cacheKey],
    {
      revalidate: 600,
      tags: ['questao', 'semi-static', `questao-${slug}`],
    },
  )();
}

/**
 * Exemplo: dados por usuário — userId na key, filtro explícito, perfil USER.
 * Sem userId → `[]` imediato (não consulta DB; não mistura usuários).
 */
export async function getExampleHistoricoCached(userId?: string) {
  if (!userId) return [];

  const cacheKey = `example-historico-${userId}`;

  return unstable_cache(
    async () => {
      const { createServerSupabase } = await import('@/lib/supabase/server');
      const supabase = await createServerSupabase();

      const { data, error } = await supabase
        .from('historico_questoes')
        .select('modulo_slug, acertou, estudo_reverso_concluido, respondida')
        .eq('user_id', userId)
        .limit(1000);

      if (error) {
        logger.error('Failed to fetch example historico from cache', error, { userId });
        throw new DataServiceUnavailableError();
      }

      return data ?? [];
    },
    [cacheKey],
    {
      ...CACHE_CONFIG.USER,
      tags: ['historico', 'user', `user-${userId}`],
    },
  )();
}

/**
 * Anti-padrões (NÃO fazer):
 * - `return []` / `return null` no catch de erro de rede (cacheia falso negativo)
 * - Colocar `cookies()` / `createServerClient` dentro do callback de `unstable_cache`
 * - Omitir `userId` da cache key em dados por usuário
 * - Inventar `process.env.X` fora de `lib/env.ts`
 * - Implementar cache paralelo fora de `lib/cache.ts` para catálogo/questão/histórico em RSC
 *
 * Zona vermelha: após editar `lib/cache.ts`, rodar `npm run check:ship` e pedir revisão humana.
 */
