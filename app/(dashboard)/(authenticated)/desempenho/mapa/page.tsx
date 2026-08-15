import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DesempenhoHubShell } from '@/components/dashboard/desempenho/DesempenhoHubShell';
import { DesempenhoMapaDashboard } from '@/components/dashboard/desempenho/DesempenhoMapaDashboard';
import { loadEstudoDashboard } from '@/lib/desempenho/estudoPageLoad';
import {
  filtersFromEstudoSearchParams,
  firstSearchParam,
  type DesempenhoEstudoSearchParams,
} from '@/lib/desempenho/estudoSearchParams';

export default async function DesempenhoMapaPage({
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
    'mapa',
    filters.periodo,
    filters.banca ?? '',
    filters.areaId ?? '',
    filters.disciplina ?? '',
    filters.assunto ?? '',
  ].join('-');

  return (
    <DesempenhoHubShell
      description="Todas as áreas praticadas e o panorama por tipo de conteúdo."
      action={
        <Button asChild className="btn-editorial-primary h-11 w-full sm:w-auto">
          <Link
            href="/estudar"
            className="inline-flex w-full items-center justify-center sm:w-auto"
          >
            <BookOpen className="h-4 w-4" aria-hidden />
            Praticar na vitrine
          </Link>
        </Button>
      }
    >
      <DesempenhoMapaDashboard key={filterKey} data={data} />
    </DesempenhoHubShell>
  );
}
