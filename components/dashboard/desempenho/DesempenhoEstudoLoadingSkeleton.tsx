import { cn } from '@/lib/utils';
import { DASHBOARD_PAGE_ROOT } from '@/lib/layout/mobileBottomNav';

/**
 * Placeholder do corpo da aba Estudo (`DesempenhoEstudoDashboard`).
 * Header sticky fica no `DesempenhoHubShell` — mesmo chrome da página real, para CLS baixo.
 */
export function DesempenhoEstudoLoadingSkeleton() {
  return (
    <div
      className={cn('mx-auto max-w-4xl space-y-8 px-4 py-6 md:px-8', DASHBOARD_PAGE_ROOT)}
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Carregando desempenho"
      data-testid="desempenho-estudo-loading"
      data-desempenho-loading="estudo"
    >
      <section className="space-y-3" aria-hidden>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="h-4 w-56 max-w-[70%] rounded bg-muted/50 animate-pulse" />
          <div className="h-11 w-[7.25rem] shrink-0 rounded-full border border-border bg-muted/40 animate-pulse" />
        </div>
      </section>

      <div className="h-4 w-44 max-w-full rounded bg-muted/40 animate-pulse" aria-hidden />

      <section className="space-y-2" aria-hidden>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="metric-card p-5" data-testid="desempenho-loading-score">
              <div className="mb-3 flex items-start justify-between">
                <div className="h-3 w-16 rounded bg-muted/50 animate-pulse" />
                <div className="size-8 rounded-lg bg-muted/40 animate-pulse" />
              </div>
              <div className="h-7 w-12 rounded bg-muted/50 animate-pulse" />
            </div>
          ))}
        </div>
        <div className="h-3 w-full max-w-md rounded bg-muted/30 animate-pulse" />
        <div className="h-3 w-2/3 max-w-sm rounded bg-muted/30 animate-pulse" />
      </section>

      <div className="metric-card h-28 bg-muted/30 animate-pulse" aria-hidden />

      <section className="space-y-3" aria-hidden>
        <div className="h-5 w-48 max-w-full rounded bg-muted/50 animate-pulse" />
        <div className="h-32 rounded-2xl bg-muted/40 animate-pulse" />
      </section>

      <section className="space-y-3" aria-hidden>
        <div className="h-5 w-56 max-w-full rounded bg-muted/50 animate-pulse" />
        <div className="h-24 rounded-2xl bg-muted/40 animate-pulse" />
      </section>
    </div>
  );
}

/**
 * Placeholder só da dobra P4 (curva + 3 KPIs) enquanto o ledger EE chega.
 * Não usa `data-testid="desempenho-estudo-loading"` — esse id é do skeleton
 * da página inteira (onda 1 / e2e de nav).
 */
export function AttemptEvolutionLoadingSkeleton() {
  return (
    <section
      className="space-y-3"
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Carregando evolução de tentativas"
      data-testid="desempenho-attempt-series-loading"
    >
      <div className="metric-card h-36 bg-muted/30 animate-pulse" aria-hidden />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" aria-hidden>
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="metric-card h-24 bg-muted/30 animate-pulse" />
        ))}
      </div>
    </section>
  );
}
