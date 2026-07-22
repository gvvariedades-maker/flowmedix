/**
 * GOLDEN — Server Component (RSC) com cache + sessão
 *
 * Canônico: CLAUDE.md §2 (RSC + cache + sessão) e §5 (regras de cache)
 * Rule: .cursor/rules/eng-feature.mdc §3–§4
 * Guardrails: .cursor/rules/avant-engineering.mdc (cache → lib/cache.ts; sessão → getServerSession)
 *
 * Copie este padrão em `app/(dashboard)/.../page.tsx` (ou layout RSC) ao ler catálogo/questão/histórico.
 * NÃO importe este arquivo em runtime — é referência para o agente.
 *
 * Invariantes:
 * - `async` RSC por padrão; sem `'use client'` nesta página
 * - Catálogo / questão / histórico só via `lib/cache.ts` — nunca Supabase direto no RSC
 * - Identidade: `getServerSession()` (read-only). Refresh/`getUser()` na borda = `proxy.ts`
 * - `userId` obtido FORA do cache e passado como argumento da key
 * - Falha de dados: tratar `DataServiceUnavailableError` (não engolir em `[]` falso)
 */

import { notFound } from 'next/navigation';
import {
  getHistoricoQuestoesCached,
  getQuestaoBySlugCached,
} from '@/lib/cache';
import { isDataServiceUnavailableError } from '@/lib/dataServiceError';
import { logger } from '@/lib/logger';
import { getServerSession } from '@/lib/supabase/server-auth';

type PageProps = {
  params: Promise<{ slug: string }>;
};

/**
 * Exemplo mínimo espelhando o padrão de `/estudar/[slug]`.
 * Em produção real, usar o payload/hydrator existente (`getEstudarQuestaoPayloadCached`, etc.).
 */
export default async function ExampleQuestaoPage({ params }: PageProps) {
  const { slug } = await params;

  // Sessão read-only — NÃO chamar supabase.auth.getUser() aqui (refresh fica no proxy.ts).
  const session = await getServerSession();
  const userId = session?.user?.id;

  let questao: Awaited<ReturnType<typeof getQuestaoBySlugCached>>;
  let historico: Awaited<ReturnType<typeof getHistoricoQuestoesCached>>;

  try {
    // Leituras em paralelo; cada função em lib/cache.ts já usa unstable_cache + tags.
    [questao, historico] = await Promise.all([
      getQuestaoBySlugCached(slug),
      getHistoricoQuestoesCached(userId),
    ]);
  } catch (err) {
    // Rede/config: propaga serviço indisponível; demais erros → 404 seguro.
    if (isDataServiceUnavailableError(err)) throw err;
    logger.error('Falha ao carregar página de exemplo', err, { slug, userId });
    return notFound();
  }

  if (!questao) return notFound();

  const estudados = historico.filter((h) => h.estudo_reverso_concluido).length;

  return (
    <main className="p-6">
      <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">
        {questao.modulo_slug}
      </h1>
      <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
        Banca: {questao.banca ?? '—'} · Assunto: {questao.titulo_aula ?? '—'}
      </p>
      <p className="mt-1 text-sm text-[var(--color-text-tertiary)]">
        Histórico do usuário: {estudados} estudo(s) reverso(s) concluído(s)
      </p>
    </main>
  );
}

/**
 * Anti-padrões (NÃO fazer):
 * - `createBrowserClient` / segundo client Supabase no servidor
 * - `createServerSupabase()` ou `.from('modulos_estudo')` direto no RSC para catálogo
 * - `getUser()` / refresh de token no Node além de `proxy.ts`
 * - Cachear `[]` quando a query falhou (isso é regra de lib/cache.ts — ver cache-fn.example.ts)
 * - Passar cookies/sessão para dentro de `unstable_cache` (userId como argumento, não cookie)
 */
