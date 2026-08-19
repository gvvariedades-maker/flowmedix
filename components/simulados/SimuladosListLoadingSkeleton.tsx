import { DASHBOARD_PAGE_ROOT } from '@/lib/layout/mobileBottomNav';
import type { HubNavPendingPhase } from '@/lib/layout/hubNavPending';
import { cn } from '@/lib/utils';

/**
 * Placeholder só do corpo da lista. Header sticky fica no `SimuladosHubShell`.
 */
export function SimuladosListLoadingSkeleton({
  phase = 'loading',
}: {
  phase?: HubNavPendingPhase;
}) {
  const slow = phase === 'slow-loading';
  const statusLabel = slow ? 'Ainda carregando simulados' : 'Carregando simulados';

  return (
    <div
      className={cn(
        'mx-auto max-w-4xl animate-pulse space-y-4 px-4 py-6 sm:px-6 md:px-10',
        DASHBOARD_PAGE_ROOT,
      )}
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label={statusLabel}
      data-testid="simulados-loading"
      data-simulados-loading="lista"
      data-hub-nav-phase={phase}
    >
      {slow ? <p className="text-sm font-medium text-slate-600">{statusLabel}</p> : null}
      <div className="h-28 rounded-2xl bg-muted/50" aria-hidden />
      <div className="h-20 rounded-2xl bg-muted/50" aria-hidden />
      <div className="h-20 rounded-2xl bg-muted/50" aria-hidden />
    </div>
  );
}

export function SimuladosHistoryLoadingSkeleton() {
  return (
    <section
      className="space-y-3"
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Carregando simulados concluídos"
      data-testid="simulados-history-loading"
    >
      <div className="h-4 w-48 max-w-[70%] rounded bg-muted/50 animate-pulse" aria-hidden />
      <div className="h-20 rounded-2xl bg-muted/40 animate-pulse" aria-hidden />
      <div className="h-20 rounded-2xl bg-muted/40 animate-pulse" aria-hidden />
    </section>
  );
}
