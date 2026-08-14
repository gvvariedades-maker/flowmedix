import Link from 'next/link';
import { redirect } from 'next/navigation';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DesempenhoEstudoDashboard } from '@/components/dashboard/desempenho/DesempenhoEstudoDashboard';
import { DesempenhoHubShell } from '@/components/dashboard/desempenho/DesempenhoHubShell';
import { isE2eBypassEnabled } from '@/lib/e2e/bypass';
import {
  aggregateStudyPerformance,
  getDesempenhoEstudoData,
  normalizeDesempenhoEstudoFilters,
} from '@/lib/desempenho/studyPerformance';
import { getE2eDesempenhoEstudoData } from '@/lib/e2e/desempenhoSeed';
import { logger } from '@/lib/logger';
import { getServerSession } from '@/lib/supabase/server-auth';

type SearchParamsShape = {
  periodo?: string | string[];
  banca?: string | string[];
  area?: string | string[];
  disciplina?: string | string[];
};

function normalizeSingleValue(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export default async function DesempenhoEstudoPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsShape>;
}) {
  const e2eBypass = isE2eBypassEnabled('E2E_DASHBOARD_BYPASS');
  const resolvedSearchParams = await searchParams;

  const filters = normalizeDesempenhoEstudoFilters({
    periodoRaw: normalizeSingleValue(resolvedSearchParams.periodo),
    bancaRaw: normalizeSingleValue(resolvedSearchParams.banca),
    areaRaw: normalizeSingleValue(resolvedSearchParams.area),
    disciplinaRaw: normalizeSingleValue(resolvedSearchParams.disciplina),
  });

  let data;
  if (e2eBypass) {
    data = getE2eDesempenhoEstudoData(filters);
  } else {
    const session = await getServerSession();
    if (!session?.user) redirect('/login');

    try {
      data = await getDesempenhoEstudoData(session.user.id, filters);
    } catch (error) {
      logger.error('Failed to load desempenho estudo', error, { userId: session.user.id });
      // `loadState: 'error'` — o painel mostra estado de erro com retry, nunca KPI zerado.
      data = aggregateStudyPerformance([], [], filters, new Date(), 'error');
    }
  }

  const filterKey = [
    filters.periodo,
    filters.banca ?? '',
    filters.areaId ?? '',
    filters.disciplina ?? '',
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
