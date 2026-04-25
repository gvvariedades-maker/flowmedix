import { Suspense } from 'react';
import { getServerSession } from '@/lib/supabase/server-auth';
import VitrineClient from '@/components/vitrine/VitrineClient';
import { logger } from '@/lib/logger';
import {
  getModulosEstudoCached,
  getHistoricoQuestoesCached,
} from '@/lib/cache';

/** Evita HTML/CDN com payload RSC desatualizado; catálogo vem de `unstable_cache` com revalidação própria. */
export const dynamic = 'force-dynamic';

interface ModuloEstudoRow {
  id: string;
  modulo_slug: string;
  modulo_nome: string | null;
  titulo_aula: string | null;
  banca: string;
  [key: string]: any;
}

interface HistoricoQuestaoRow {
  modulo_slug: string;
  acertou: boolean;
  estudo_reverso_concluido: boolean;
  [key: string]: any;
}

export default async function VitrinePage() {
  // `getServerSession()` é deduplicado por React `cache` — o mesmo resultado é
  // compartilhado entre layout e page, evitando duas chamadas paralelas a
  // `getSession()` que dispararam `refresh_token_already_used` antes.
  const session = await getServerSession();
  const userId = session?.user?.id;

  // Usa cache estratégico - revalida a cada 5 minutos (módulos) e 2 minutos (histórico)
  const [modulosData, historicoData] = await Promise.all([
    getModulosEstudoCached(),
    getHistoricoQuestoesCached(userId),
  ]);

  if (!modulosData?.length) {
    logger.warn('Vitrine: catálogo de módulos vazio — verifique PostgREST, RLS e variáveis Supabase no deploy.', {
      hasEnvUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    });
  }

  // Type assertions para compatibilidade
  const modulosTyped = (modulosData || []) as ModuloEstudoRow[];
  const historicoTyped = (historicoData || []) as HistoricoQuestaoRow[];

  // Otimização: Criar Map para O(1) lookup em vez de O(n*m)
  const historicoMap = new Map<string, HistoricoQuestaoRow[]>();
  historicoTyped.forEach((h: HistoricoQuestaoRow) => {
    const existing = historicoMap.get(h.modulo_slug) || [];
    historicoMap.set(h.modulo_slug, [...existing, h]);
  });

  const modulosProcessados = modulosTyped.map((modulo: ModuloEstudoRow) => {
    const tentativas = historicoMap.get(modulo.modulo_slug) || [];
    const acertos = tentativas.filter((t: HistoricoQuestaoRow) => t.acertou).length;
    const total = tentativas.length;
    const percentual = total > 0 ? Math.round((acertos / total) * 100) : 0;
    // "Estudada" = aluno confirmou explicitamente que concluiu o ciclo de estudo reverso
    const estudoReversoConcluido = tentativas.some(
      (t: HistoricoQuestaoRow) => t.estudo_reverso_concluido === true
    );

    let priorityScore = 0;
    if (!estudoReversoConcluido) priorityScore = 50;
    else if (percentual < 70) priorityScore = 100 + (70 - percentual);
    else if (percentual >= 90) priorityScore = 10;
    else priorityScore = 30;

    return {
      id: modulo.id,
      modulo_slug: modulo.modulo_slug,
      modulo_nome: modulo.modulo_nome || 'Módulo',
      titulo_aula: modulo.titulo_aula || 'Aula sem título',
      banca: modulo.banca,
      /** Ordem canônica do assunto (vitrine / player), igual a `getQuestoesByAssuntoCached`. */
      created_at: (modulo as { created_at?: string | null }).created_at ?? null,
      avant_codigo:
        modulo.avant_codigo != null && !Number.isNaN(Number(modulo.avant_codigo))
          ? Number(modulo.avant_codigo)
          : null,
      estudoReversoConcluido,
      stats: { acertos, total, percentual, priorityScore }
    };
  }).sort((a: any, b: any) => b.stats.priorityScore - a.stats.priorityScore);

  return (
    <Suspense fallback={<VitrineLoadingFallback />}>
      <VitrineClient initialModulos={modulosProcessados} />
    </Suspense>
  );
}

/** Evita mismatch de hidratação com `useSearchParams` (Next exige Suspense no segmento). */
function VitrineLoadingFallback() {
  return (
    <div className="dashboard-surface min-h-screen bg-background px-6 py-8 text-foreground">
      <div className="mx-auto max-w-7xl space-y-8 animate-pulse">
        <div className="h-24 rounded-xl bg-muted/70" />
        <div className="h-11 max-w-xl rounded-2xl bg-muted/70" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="h-11 rounded-xl bg-muted/70" />
          <div className="h-11 rounded-xl bg-muted/70" />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-72 rounded-3xl bg-muted/50" />
          ))}
        </div>
      </div>
    </div>
  );
}
