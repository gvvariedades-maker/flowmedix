import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getServerSession } from '@/lib/supabase/server-auth';
import { SimuladosAnalyticsDashboard } from '@/components/simulados/SimuladosAnalyticsDashboard';
import {
  normalizeSimuladoAnalyticsFilters,
} from '@/lib/simulado/analyticsSummary';
import { isE2eBypassEnabled } from '@/lib/e2e/bypass';
import { DesempenhoHubShell } from '@/components/dashboard/desempenho/DesempenhoHubShell';

/** `status` não entra: a agregação só considera sessões concluídas. */
type SearchParamsShape = {
  periodo?: string | string[];
  modo?: string | string[];
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
  const bancaAtualRaw = normalizeSingleValue(resolvedSearchParams.banca);
  const topicoAtualRaw = normalizeSingleValue(resolvedSearchParams.topico);
  const subtopicoAtualRaw = normalizeSingleValue(resolvedSearchParams.subtopico);

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
    <DesempenhoHubShell
      description="Resultado dos simulados: acerto ponderado por questões, tempo e tendência."
      action={
        <Button asChild className="btn-editorial-primary h-11 w-full sm:w-auto">
          <Link
            href="/simulados/novo"
            className="inline-flex w-full items-center justify-center sm:w-auto"
          >
            <ClipboardList className="h-4 w-4" aria-hidden />
            Iniciar simulado
          </Link>
        </Button>
      }
    >
      <SimuladosAnalyticsDashboard
        key={`${periodoAtual}-${modoAtual}-${bancaAtual ?? ''}-${topicoAtual ?? ''}-${subtopicoAtual ?? ''}`}
        periodoAtual={periodoAtual}
        modoAtual={modoAtual}
        bancaAtual={bancaAtual}
        topicoAtual={topicoAtual}
        subtopicoAtual={subtopicoAtual}
      />
    </DesempenhoHubShell>
  );
}
