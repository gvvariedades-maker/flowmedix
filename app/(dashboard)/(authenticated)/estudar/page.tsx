import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getMatriculatedConcursosCached, getVitrineInitialPayloadCached } from '@/lib/cache';
import { isAdminSessionEmail } from '@/lib/constants';
import { logger } from '@/lib/logger';
import { getServerUser } from '@/lib/supabase/server-auth';
import {
  parseVitrineListQuery,
  vitrineFacetsQueryKey,
  vitrineListQueryKey,
} from '@/lib/vitrine/parseListQuery';
import VitrineCatalogStatsSection from '@/components/vitrine/VitrineCatalogStatsSection';
import VitrineCatalogStatsSkeleton from '@/components/vitrine/VitrineCatalogStatsSkeleton';
import VitrineClient from '@/components/vitrine/VitrineClient';
import { isE2eBypassEnabled } from '@/lib/e2e/bypass';
import { getE2eEstudarVitrinePage } from '@/lib/e2e/estudarSeed';

/** Catálogo inicial no SSR (cache 2 min); cliente refetch em filtros/paginação. */
export const dynamic = 'force-dynamic';

export default async function VitrinePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearch = await searchParams;
  const listQuery = parseVitrineListQuery(resolvedSearch);

  if (isE2eBypassEnabled('E2E_DASHBOARD_BYPASS')) {
    const initialPageData = getE2eEstudarVitrinePage(listQuery);
    return (
      <Suspense fallback={<VitrineLoadingFallback />}>
        <VitrineClient
          fallbackTitulo="Estudo Reverso E2E"
          initialListQuery={listQuery}
          initialPageData={initialPageData}
          initialFacetsData={initialPageData.facets}
          initialPayloadError={null}
          ssrListQueryKey={vitrineListQueryKey(listQuery)}
          ssrFacetsQueryKey={vitrineFacetsQueryKey(listQuery.bancas)}
        />
      </Suspense>
    );
  }

  const user = await getServerUser();
  const userId = user?.id;
  if (!userId) redirect('/login?next=/estudar');

  const isAdmin = isAdminSessionEmail(user.email ?? null);
  const vitrineFilters = {
    bancas: listQuery.bancas.length ? listQuery.bancas : undefined,
    assuntos: listQuery.assuntos.length ? listQuery.assuntos : undefined,
    q: listQuery.q,
  };

  const facetsFilters = {
    bancas: listQuery.bancas.length ? listQuery.bancas : undefined,
  };

  const [matriculatedConcursos, initialPayloadResult] = await Promise.all([
    getMatriculatedConcursosCached(userId).catch((err) => {
      logger.warn('SSR vitrine: falha ao carregar concursos matriculados', {
        userId,
        error: err instanceof Error ? err.message : String(err),
      });
      return [] as Awaited<ReturnType<typeof getMatriculatedConcursosCached>>;
    }),
    getVitrineInitialPayloadCached(
      userId,
      listQuery.page,
      vitrineFilters,
      facetsFilters,
      isAdmin,
    )
      .then((payload) => ({ payload, error: null as string | null }))
      .catch((err) => {
        logger.warn('SSR vitrine: falha ao carregar payload inicial', {
          userId,
          page: listQuery.page,
          error: err instanceof Error ? err.message : String(err),
        });
        return {
          payload: null,
          error: 'Não foi possível carregar a vitrine. Tente novamente.',
        };
      }),
  ]);

  const initialPageData = initialPayloadResult.payload?.page ?? null;
  const initialFacetsData = initialPageData?.facets ?? null;
  const initialPayloadError = initialPayloadResult.error;

  const vitrineFallbackTitulo =
    matriculatedConcursos.find((concurso) => concurso.tipo === 'edital')?.nome ?? 'Estudo Reverso';

  return (
    <Suspense fallback={<VitrineLoadingFallback />}>
      <VitrineClient
        fallbackTitulo={vitrineFallbackTitulo}
        initialListQuery={listQuery}
        initialPageData={initialPageData}
        initialFacetsData={initialFacetsData}
        initialPayloadError={initialPayloadError}
        ssrListQueryKey={vitrineListQueryKey(listQuery)}
        ssrFacetsQueryKey={vitrineFacetsQueryKey(listQuery.bancas)}
      >
        <Suspense fallback={<VitrineCatalogStatsSkeleton />}>
          <VitrineCatalogStatsSection />
        </Suspense>
      </VitrineClient>
    </Suspense>
  );
}

/** Evita mismatch de hidratação com `useSearchParams` (Next exige Suspense no segmento). */
function VitrineLoadingFallback() {
  return (
    <div className="dashboard-surface min-h-0 flex-1 bg-background px-6 py-8 text-foreground">
      <div className="mx-auto max-w-7xl space-y-8 animate-pulse">
        <div className="h-24 rounded-xl bg-muted/70" />
        <div className="h-11 max-w-xl rounded-2xl bg-muted/70" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="h-11 rounded-xl bg-muted/70" />
          <div className="h-11 rounded-xl bg-muted/70" />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-72 rounded-2xl bg-muted/50" />
          ))}
        </div>
      </div>
    </div>
  );
}
