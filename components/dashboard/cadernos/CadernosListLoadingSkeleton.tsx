import { DASHBOARD_PAGE_ROOT } from '@/lib/layout/mobileBottomNav';
import type { HubNavPendingPhase } from '@/lib/layout/hubNavPending';
import { cn } from '@/lib/utils';

/**
 * Placeholder só do corpo da lista. Header sticky fica no `CadernosHubShell`.
 */
export function CadernosListLoadingSkeleton({
  phase = 'loading',
}: {
  phase?: HubNavPendingPhase;
}) {
  const slow = phase === 'slow-loading';
  const statusLabel = slow ? 'Ainda carregando cadernos' : 'Carregando cadernos';

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
      data-testid="cadernos-loading"
      data-cadernos-loading="lista"
      data-hub-nav-phase={phase}
    >
      {slow ? <p className="text-sm font-medium text-slate-600">{statusLabel}</p> : null}
      <div className="h-24 rounded-2xl bg-muted/50" aria-hidden />
      <div className="h-24 rounded-2xl bg-muted/50" aria-hidden />
      <div className="h-24 rounded-2xl bg-muted/50" aria-hidden />
    </div>
  );
}

export function CadernosPacksLoadingSkeleton() {
  return (
    <section
      className="space-y-4"
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Carregando cadernos prontos"
      data-testid="cadernos-packs-loading"
    >
      <div className="h-6 w-44 max-w-[70%] rounded bg-muted/50 animate-pulse" aria-hidden />
      <div className="h-4 w-full max-w-md rounded bg-muted/40 animate-pulse" aria-hidden />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-hidden>
        <div className="h-36 rounded-2xl bg-muted/40 animate-pulse" />
        <div className="h-36 rounded-2xl bg-muted/40 animate-pulse" />
      </div>
    </section>
  );
}
