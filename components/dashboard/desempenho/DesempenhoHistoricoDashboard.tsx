import Link from 'next/link';
import { DesempenhoFiltros } from '@/components/dashboard/desempenho/DesempenhoFiltros';
import { DesempenhoLoadError } from '@/components/dashboard/desempenho/DesempenhoLoadError';
import { DesempenhoUniversoLine } from '@/components/dashboard/desempenho/DesempenhoUniversoLine';
import { RecentAttemptsList } from '@/components/dashboard/desempenho/RecentAttemptsList';
import { DESEMPENHO_COPY } from '@/components/dashboard/desempenho/desempenhoCopy';
import { cn } from '@/lib/utils';
import { DASHBOARD_PAGE_ROOT } from '@/lib/layout/mobileBottomNav';
import {
  buildDesempenhoHref,
  buildDesempenhoHistoricoHref,
  DESEMPENHO_PATHS,
} from '@/lib/desempenho/filtersHref';
import type {
  DesempenhoEstudoData,
  DesempenhoEstudoFilters,
  HistoricoResultadoFilter,
} from '@/lib/desempenho/types';

type Props = {
  data: DesempenhoEstudoData;
  resultado: HistoricoResultadoFilter;
  nextCursor: string | null;
  totalFiltrado: number;
  captura?: string | null;
};

const RESULTADO_CHIPS: ReadonlyArray<{ id: HistoricoResultadoFilter; label: string }> = [
  { id: 'todos', label: DESEMPENHO_COPY.historicoResultadoTodos },
  { id: 'acerto', label: DESEMPENHO_COPY.historicoResultadoAcerto },
  { id: 'erro', label: DESEMPENHO_COPY.historicoResultadoErro },
  { id: 'reverso', label: DESEMPENHO_COPY.historicoResultadoReverso },
];

export function DesempenhoHistoricoDashboard({
  data,
  resultado,
  nextCursor,
  totalFiltrado,
  captura,
}: Props) {
  const {
    filtersApplied,
    periodoResumo,
    loadState,
    placar,
    universoRespondidas,
    assuntoOpcoes,
    leituraTruncada,
    recentAttempts,
  } = data;

  if (loadState === 'error') {
    return <DesempenhoLoadError hub="historico" />;
  }

  const resumoHref = buildDesempenhoHref(filtersApplied, DESEMPENHO_PATHS.resumo);

  return (
    <div
      className={cn('mx-auto max-w-4xl space-y-8 px-4 py-6 md:px-8', DASHBOARD_PAGE_ROOT)}
      data-desempenho-hub="historico"
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
        basePath={DESEMPENHO_PATHS.historico}
      />

      <DesempenhoUniversoLine
        exibidas={placar.respondidas}
        universo={universoRespondidas}
        leituraTruncada={leituraTruncada}
      />

      <section aria-labelledby="historico-title" className="space-y-3">
        <div>
          <h2 id="historico-title" className="text-base font-semibold text-slate-900">
            Histórico de questões
          </h2>
          <p className="text-xs text-muted-foreground">
            Filtros de acerto, erro e reverso valem só nesta lista — o placar da home não muda.
            {totalFiltrado === 1
              ? ' 1 questão neste resultado.'
              : totalFiltrado > 0
                ? ` ${totalFiltrado} questões neste resultado.`
                : ''}
          </p>
        </div>

        <ResultadoFiltros filters={filtersApplied} resultado={resultado} captura={captura} />

        <RecentAttemptsList attempts={recentAttempts} variant="pagina" showHeader={false} />

        {nextCursor ? (
          <Link
            href={buildDesempenhoHistoricoHref(filtersApplied, {
              resultado,
              cursor: nextCursor,
              captura,
            })}
            className="inline-flex min-h-11 items-center text-sm font-medium text-[var(--color-brand-text)] underline-offset-2 hover:underline"
          >
            Próxima página
          </Link>
        ) : null}
      </section>
    </div>
  );
}

function ResultadoFiltros({
  filters,
  resultado,
  captura,
}: {
  filters: DesempenhoEstudoFilters;
  resultado: HistoricoResultadoFilter;
  captura?: string | null;
}) {
  return (
    <div role="group" aria-label="Filtrar por resultado" className="flex flex-wrap gap-2">
      {RESULTADO_CHIPS.map((chip) => (
        <Link
          key={chip.id}
          href={buildDesempenhoHistoricoHref(filters, { resultado: chip.id, captura })}
          aria-current={resultado === chip.id ? 'true' : undefined}
          className={cn(
            'inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium',
            resultado === chip.id
              ? 'border-[var(--color-brand-ring)] bg-[var(--color-brand-dim)] text-slate-900'
              : 'border-border bg-background text-muted-foreground hover:text-foreground',
          )}
        >
          {chip.label}
        </Link>
      ))}
    </div>
  );
}
