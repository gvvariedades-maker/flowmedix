import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DesempenhoHubShell } from '@/components/dashboard/desempenho/DesempenhoHubShell';
import { DesempenhoHistoricoDashboard } from '@/components/dashboard/desempenho/DesempenhoHistoricoDashboard';
import { loadEstudoDashboard } from '@/lib/desempenho/estudoPageLoad';
import {
  filtersFromEstudoSearchParams,
  firstSearchParam,
  type DesempenhoEstudoSearchParams,
} from '@/lib/desempenho/estudoSearchParams';
import { paginateRecentAttempts, normalizeHistoricoResultado } from '@/lib/desempenho/historicoPagination';
import { SCALE_LIMITS } from '@/lib/scale/constants';
import { DESEMPENHO_HISTORICO_PAGE_SIZE } from '@/lib/desempenho/types';

export default async function DesempenhoHistoricoPage({
  searchParams,
}: {
  searchParams: Promise<DesempenhoEstudoSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const filters = filtersFromEstudoSearchParams(resolvedSearchParams);
  const resultado = normalizeHistoricoResultado(firstSearchParam(resolvedSearchParams.resultado));
  const cursor = firstSearchParam(resolvedSearchParams.cursor);

  const captura = firstSearchParam(resolvedSearchParams.captura);

  // Sem ledger EE: a lista de histórico não usa a curva de tentativas.
  const data = await loadEstudoDashboard(filters, {
    captura,
    recentLimit: SCALE_LIMITS.HISTORICO_ANALYTICS_READ,
  });

  const page = paginateRecentAttempts(data.recentAttempts, {
    cursor,
    resultado,
    limit: DESEMPENHO_HISTORICO_PAGE_SIZE,
  });

  const filterKey = [
    'historico',
    filters.periodo,
    filters.banca ?? '',
    filters.areaId ?? '',
    filters.disciplina ?? '',
    filters.assunto ?? '',
    resultado,
    cursor ?? '',
  ].join('-');

  return (
    <DesempenhoHubShell
      description="Lista paginada das questões praticadas. Acerto, erro e reverso filtram só esta lista."
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
      <DesempenhoHistoricoDashboard
        key={filterKey}
        data={{ ...data, recentAttempts: page.items }}
        resultado={resultado}
        nextCursor={page.nextCursor}
        totalFiltrado={page.total}
        captura={captura}
      />
    </DesempenhoHubShell>
  );
}
