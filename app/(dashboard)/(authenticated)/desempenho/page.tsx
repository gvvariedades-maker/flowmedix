import { Suspense } from 'react';
import { AttemptEvolutionCard } from '@/components/dashboard/desempenho/AttemptEvolutionCard';
import { DesempenhoEstudoDashboard } from '@/components/dashboard/desempenho/DesempenhoEstudoDashboard';
import { DesempenhoHubShell } from '@/components/dashboard/desempenho/DesempenhoHubShell';
import {
  DESEMPENHO_ESTUDO_HUB_DESCRIPTION,
  DesempenhoEstudoHubAction,
} from '@/components/dashboard/desempenho/DesempenhoEstudoHubChrome';
import {
  AttemptEvolutionLoadingSkeleton,
  DesempenhoEstudoLoadingSkeleton,
} from '@/components/dashboard/desempenho/DesempenhoEstudoLoadingSkeleton';
import { finishAttemptSeries } from '@/lib/desempenho/attemptSeries';
import {
  loadEstudoDashboardStream,
  type EstudoDashboardStream,
} from '@/lib/desempenho/estudoPageLoad';
import {
  filtersFromEstudoSearchParams,
  firstSearchParam,
  type DesempenhoEstudoSearchParams,
} from '@/lib/desempenho/estudoSearchParams';

export default function DesempenhoEstudoPage({
  searchParams,
}: {
  searchParams: Promise<DesempenhoEstudoSearchParams>;
}) {
  return (
    <DesempenhoHubShell
      description={DESEMPENHO_ESTUDO_HUB_DESCRIPTION}
      action={<DesempenhoEstudoHubAction />}
    >
      <Suspense fallback={<DesempenhoEstudoLoadingSkeleton />}>
        <DesempenhoEstudoBody searchParams={searchParams} />
      </Suspense>
    </DesempenhoHubShell>
  );
}

async function DesempenhoEstudoBody({
  searchParams,
}: {
  searchParams: Promise<DesempenhoEstudoSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const filters = filtersFromEstudoSearchParams(resolvedSearchParams);
  const stream = await loadEstudoDashboardStream(filters, {
    captura: firstSearchParam(resolvedSearchParams.captura),
  });

  const filterKey = [
    filters.periodo,
    filters.banca ?? '',
    filters.areaId ?? '',
    filters.disciplina ?? '',
    filters.assunto ?? '',
  ].join('-');

  return (
    <DesempenhoEstudoDashboard
      key={filterKey}
      data={stream.data}
      attemptSeriesSlot={attemptSeriesSlotFromStream(stream)}
    />
  );
}

function attemptSeriesSlotFromStream(stream: EstudoDashboardStream) {
  if (!stream.seriesReadPromise || !stream.seriesOptions) return undefined;
  return (
    <Suspense fallback={<AttemptEvolutionLoadingSkeleton />}>
      <AttemptSeriesResolved
        readPromise={stream.seriesReadPromise}
        options={stream.seriesOptions}
        placarZerado={stream.data.placar.respondidas === 0}
      />
    </Suspense>
  );
}

async function AttemptSeriesResolved({
  readPromise,
  options,
  placarZerado,
}: {
  readPromise: NonNullable<EstudoDashboardStream['seriesReadPromise']>;
  options: NonNullable<EstudoDashboardStream['seriesOptions']>;
  placarZerado: boolean;
}) {
  const series = finishAttemptSeries(await readPromise, options);
  return <AttemptEvolutionCard series={series} placarZerado={placarZerado} />;
}
