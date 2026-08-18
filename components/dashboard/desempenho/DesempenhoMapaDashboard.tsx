import Link from 'next/link';
import { AreaHierarchy } from '@/components/dashboard/desempenho/AreaHierarchy';
import { DesempenhoFiltros } from '@/components/dashboard/desempenho/DesempenhoFiltros';
import { DesempenhoLoadError } from '@/components/dashboard/desempenho/DesempenhoLoadError';
import { DesempenhoUniversoLine } from '@/components/dashboard/desempenho/DesempenhoUniversoLine';
import { RiskRadar } from '@/components/dashboard/desempenho/RiskRadar';
import {
  DESEMPENHO_COPY,
  formatAreasResumo,
} from '@/components/dashboard/desempenho/desempenhoCopy';
import { cn } from '@/lib/utils';
import { DASHBOARD_PAGE_ROOT } from '@/lib/layout/mobileBottomNav';
import { summarizeAreaMap } from '@/lib/desempenho/homePicks';
import { buildDesempenhoHref, DESEMPENHO_PATHS } from '@/lib/desempenho/filtersHref';
import type { DesempenhoEstudoData } from '@/lib/desempenho/types';

type Props = {
  data: DesempenhoEstudoData;
};

export function DesempenhoMapaDashboard({ data }: Props) {
  const {
    areas,
    riskBands,
    filtersApplied,
    periodoResumo,
    loadState,
    placar,
    universoRespondidas,
    assuntoOpcoes,
    leituraTruncada,
  } = data;

  if (loadState === 'error') {
    return <DesempenhoLoadError hub="mapa" />;
  }

  const areasResumo = summarizeAreaMap(areas);
  const resumoHref = buildDesempenhoHref(filtersApplied, DESEMPENHO_PATHS.resumo);

  return (
    <div
      className={cn('mx-auto max-w-4xl space-y-8 px-4 py-6 md:px-8', DASHBOARD_PAGE_ROOT)}
      data-desempenho-hub="mapa"
    >
      <Link
        href={resumoHref}
        className="inline-flex min-h-11 items-center text-sm font-medium text-[var(--color-brand-text)] underline-offset-2 hover:underline"
      >
        {DESEMPENHO_COPY.voltarResumo}
      </Link>

      <DesempenhoFiltros
        filters={filtersApplied}
        periodoResumo={periodoResumo}
        assuntoOpcoes={assuntoOpcoes}
        basePath={DESEMPENHO_PATHS.mapa}
      />

      <DesempenhoUniversoLine
        exibidas={placar.respondidas}
        universo={universoRespondidas}
        leituraTruncada={leituraTruncada}
      />

      <section aria-labelledby="mapa-completo-title" className="space-y-3">
        <div>
          <h2 id="mapa-completo-title" className="text-base font-semibold text-slate-900">
            Mapa por áreas
          </h2>
          <p className="text-xs text-muted-foreground">
            {formatAreasResumo(areasResumo.total, areasResumo.comDiagnostico)}
          </p>
        </div>
        <AreaHierarchy areas={areas} variant="mapa" />
      </section>

      <section aria-labelledby="mapa-tipos-title" className="space-y-3">
        <div>
          <h2 id="mapa-tipos-title" className="text-base font-semibold text-slate-900">
            Panorama por tipo de conteúdo
          </h2>
          <p className="text-xs text-muted-foreground">
            Agrupamento por natureza do conteúdo — sem estimativa de frequência em prova.
          </p>
        </div>
        <RiskRadar riskBands={riskBands} defaultOpen />
      </section>
    </div>
  );
}
