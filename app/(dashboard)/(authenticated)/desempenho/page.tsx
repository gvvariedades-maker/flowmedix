import Link from 'next/link';
import { redirect } from 'next/navigation';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { DashboardMobilePage } from '@/components/layout/DashboardMobilePage';
import { DesempenhoEstudoDashboard } from '@/components/dashboard/desempenho/DesempenhoEstudoDashboard';
import { DesempenhoTabs } from '@/components/dashboard/desempenho/DesempenhoTabs';
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
      data = aggregateStudyPerformance([], [], filters);
    }
  }

  const filterKey = [
    filters.periodo,
    filters.banca ?? '',
    filters.areaId ?? '',
    filters.disciplina ?? '',
  ].join('-');

  return (
    <DashboardMobilePage
      variant="default"
      className="dashboard-surface min-h-0 flex-1 bg-background text-foreground"
    >
      <div className="sticky top-0 z-20 border-b border-border/70 bg-background/95 shadow-[0_4px_24px_-12px_rgba(15,23,42,0.1)] backdrop-blur-md supports-[backdrop-filter]:bg-background/90">
        <div className="mx-auto max-w-4xl space-y-4 px-4 py-5 md:px-8">
          <PageHeader
            title="Meu desempenho"
            breadcrumb={[
              { label: 'Área do aluno', href: '/estudar' },
              { label: 'Meu desempenho' },
            ]}
            description="Mapa de prática por assunto — acerto, cobertura e próximos focos."
            action={
              <Button asChild className="btn-editorial-primary h-11 w-full sm:w-auto">
                <Link href="/estudar" className="inline-flex w-full items-center justify-center sm:w-auto">
                  <BookOpen className="h-4 w-4" aria-hidden />
                  Praticar na vitrine
                </Link>
              </Button>
            }
          />
          <DesempenhoTabs />
        </div>
      </div>
      <DesempenhoEstudoDashboard key={filterKey} data={data} />
    </DashboardMobilePage>
  );
}
