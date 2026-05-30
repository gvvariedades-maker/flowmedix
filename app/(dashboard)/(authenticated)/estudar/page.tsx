import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getCatalogStats } from '@/lib/cache';
import { getMatriculatedConcursos } from '@/lib/concursos/entitlements';
import { getServerUser } from '@/lib/supabase/server-auth';
import VitrineCatalogStats from '@/components/vitrine/VitrineCatalogStats';
import VitrineClient from '@/components/vitrine/VitrineClient';

/** Evita HTML/CDN com payload RSC desatualizado; catálogo vem da API `/api/vitrine`. */
export const dynamic = 'force-dynamic';

export default async function VitrinePage() {
  const user = await getServerUser();
  const userId = user?.id;
  if (!userId) redirect('/login?next=/estudar');

  const [matriculatedConcursos, catalogStats] = await Promise.all([
    getMatriculatedConcursos(userId).catch(() => []),
    getCatalogStats().catch(() => ({ totalQuestions: 0, totalSlides: 0 })),
  ]);
  const vitrineFallbackTitulo =
    matriculatedConcursos.find((concurso) => concurso.tipo === 'edital')?.nome ?? 'Estudo Reverso';

  return (
    <Suspense fallback={<VitrineLoadingFallback />}>
      <VitrineClient fallbackTitulo={vitrineFallbackTitulo}>
        <VitrineCatalogStats
          totalQuestions={catalogStats.totalQuestions}
          totalSlides={catalogStats.totalSlides}
        />
      </VitrineClient>
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
