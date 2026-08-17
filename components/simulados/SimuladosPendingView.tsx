import { DashboardMobilePage } from '@/components/layout/DashboardMobilePage';
import { DASHBOARD_PAGE_ROOT } from '@/lib/layout/mobileBottomNav';
import type { HubNavPendingPhase } from '@/lib/layout/hubNavPending';

/**
 * Placeholder da lista `/simulados`.
 * Também usado no clique da nav — Next 16.2 segura a tela atual até o RSC.
 */
export function SimuladosPendingView({ phase = 'loading' }: { phase?: HubNavPendingPhase }) {
  const slow = phase === 'slow-loading';
  const statusLabel = slow ? 'Ainda carregando simulados' : 'Carregando simulados';

  return (
    <DashboardMobilePage variant="default" className={`${DASHBOARD_PAGE_ROOT} bg-background`}>
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-background/95 backdrop-blur-md">
        <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6 md:px-10">
          {slow ? (
            <p className="text-sm font-medium text-slate-600">{statusLabel}</p>
          ) : (
            <div className="animate-pulse">
              <div className="h-8 w-40 rounded-xl bg-muted/70" />
              <div className="mt-2 h-4 w-full max-w-md rounded-lg bg-muted/50" />
            </div>
          )}
        </div>
      </div>
      <div
        className="mx-auto max-w-4xl animate-pulse space-y-4 px-4 py-6 sm:px-6 md:px-10"
        role="status"
        aria-busy="true"
        aria-live="polite"
        aria-label={statusLabel}
        data-testid="simulados-loading"
        data-simulados-loading="lista"
        data-hub-nav-phase={phase}
      >
        <div className="h-28 rounded-2xl bg-muted/50" />
        <div className="h-20 rounded-2xl bg-muted/50" />
        <div className="h-20 rounded-2xl bg-muted/50" />
      </div>
    </DashboardMobilePage>
  );
}
