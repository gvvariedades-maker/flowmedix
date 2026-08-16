import { Suspense } from 'react';
import { DesempenhoEstudoDashboard } from '@/components/dashboard/desempenho/DesempenhoEstudoDashboard';
import { DesempenhoHubShell } from '@/components/dashboard/desempenho/DesempenhoHubShell';
import {
  DESEMPENHO_ESTUDO_HUB_DESCRIPTION,
  DesempenhoEstudoHubAction,
} from '@/components/dashboard/desempenho/DesempenhoEstudoHubChrome';
import { DesempenhoEstudoLoadingSkeleton } from '@/components/dashboard/desempenho/DesempenhoEstudoLoadingSkeleton';
import { loadEstudoDashboard } from '@/lib/desempenho/estudoPageLoad';
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
  const data = await loadEstudoDashboard(filters, {
    captura: firstSearchParam(resolvedSearchParams.captura),
  });

  const filterKey = [
    filters.periodo,
    filters.banca ?? '',
    filters.areaId ?? '',
    filters.disciplina ?? '',
    filters.assunto ?? '',
  ].join('-');

  return <DesempenhoEstudoDashboard key={filterKey} data={data} />;
}
