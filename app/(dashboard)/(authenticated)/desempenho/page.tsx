import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DesempenhoEstudoDashboard } from '@/components/dashboard/desempenho/DesempenhoEstudoDashboard';
import { DesempenhoHubShell } from '@/components/dashboard/desempenho/DesempenhoHubShell';
import { loadEstudoDashboard } from '@/lib/desempenho/estudoPageLoad';
import {
  filtersFromEstudoSearchParams,
  firstSearchParam,
  type DesempenhoEstudoSearchParams,
} from '@/lib/desempenho/estudoSearchParams';

export default async function DesempenhoEstudoPage({
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

  return (
    <DesempenhoHubShell
      description="Onde você está errando, o quanto isso é confiável e qual é a próxima questão para testar."
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
      <DesempenhoEstudoDashboard key={filterKey} data={data} />
    </DesempenhoHubShell>
  );
}
