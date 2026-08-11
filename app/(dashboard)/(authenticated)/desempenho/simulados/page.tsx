import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { getServerSession } from '@/lib/supabase/server-auth';
import { SimuladosAnalyticsDashboard } from '@/components/simulados/SimuladosAnalyticsDashboard';
import {
  normalizeSimuladoAnalyticsFilters,
} from '@/lib/simulado/analyticsSummary';
import { isE2eBypassEnabled } from '@/lib/e2e/bypass';
import { DashboardMobilePage } from '@/components/layout/DashboardMobilePage';
import { DesempenhoTabs } from '@/components/dashboard/desempenho/DesempenhoTabs';

type SearchParamsShape = {
  periodo?: string | string[];
  modo?: string | string[];
  status?: string | string[];
  banca?: string | string[];
  topico?: string | string[];
  subtopico?: string | string[];
};

function normalizeSingleValue(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export default async function DesempenhoSimuladosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsShape>;
}) {
  const e2eBypass = isE2eBypassEnabled('E2E_DASHBOARD_BYPASS');
  if (!e2eBypass) {
    const session = await getServerSession();
    if (!session?.user) redirect('/login');
  }
  const resolvedSearchParams = await searchParams;

  const periodoAtualRaw = normalizeSingleValue(resolvedSearchParams.periodo);
  const modoAtualRaw = normalizeSingleValue(resolvedSearchParams.modo);
  const statusAtualRaw = normalizeSingleValue(resolvedSearchParams.status);
  const bancaAtualRaw = normalizeSingleValue(resolvedSearchParams.banca);
  const topicoAtualRaw = normalizeSingleValue(resolvedSearchParams.topico);
  const subtopicoAtualRaw = normalizeSingleValue(resolvedSearchParams.subtopico);

  const statusAtual =
    statusAtualRaw === 'aberto' ||
    statusAtualRaw === 'concluido' ||
    statusAtualRaw === 'cancelado' ||
    statusAtualRaw === 'todos'
      ? statusAtualRaw
      : 'todos';

  const {
    periodo: periodoAtual,
    modo: modoAtual,
    banca: bancaAtual,
    topico: topicoAtual,
    subtopico: subtopicoAtual,
  } = normalizeSimuladoAnalyticsFilters({
    periodoRaw: periodoAtualRaw,
    modoRaw: modoAtualRaw,
    bancaRaw: bancaAtualRaw,
    topicoRaw: topicoAtualRaw,
    subtopicoRaw: subtopicoAtualRaw,
  });

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
            description="Área dedicada ao desempenho em simulados."
            action={
              <Button asChild className="btn-editorial-primary h-11 w-full sm:w-auto">
                <Link href="/simulados/novo" className="inline-flex w-full items-center justify-center sm:w-auto">
                  <ClipboardList className="h-4 w-4" aria-hidden />
                  Iniciar simulado
                </Link>
              </Button>
            }
          />
          <DesempenhoTabs />
        </div>
      </div>
      <SimuladosAnalyticsDashboard
        key={`${periodoAtual}-${modoAtual}-${statusAtual}-${bancaAtual ?? ''}-${topicoAtual ?? ''}-${subtopicoAtual ?? ''}`}
        periodoAtual={periodoAtual}
        modoAtual={modoAtual}
        statusInicial={statusAtual}
        bancaAtual={bancaAtual}
        topicoAtual={topicoAtual}
        subtopicoAtual={subtopicoAtual}
      />
    </DashboardMobilePage>
  );
}
