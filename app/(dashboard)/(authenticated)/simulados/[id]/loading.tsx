import { DashboardMobilePage } from '@/components/layout/DashboardMobilePage';
import { DASHBOARD_PAGE_ROOT } from '@/lib/layout/mobileBottomNav';

export default function SimuladoSessionLoading() {
  return (
    <DashboardMobilePage
      variant="actionBar"
      className={`${DASHBOARD_PAGE_ROOT} bg-background px-4 pt-6 sm:px-6 md:pb-8 lg:px-8`}
    >
      <div className="mx-auto max-w-3xl animate-pulse space-y-6">
        <div className="space-y-3">
          <div className="h-3 w-28 rounded-lg bg-muted/50" />
          <div className="h-7 w-64 rounded-xl bg-muted/70 sm:h-8" />
          <div className="h-4 w-full max-w-sm rounded-lg bg-muted/50" />
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full w-1/3 rounded-full bg-[#22c55e]/50" />
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="mb-3 h-3 w-32 rounded bg-muted/50" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-8 w-8 rounded-lg bg-muted/50" />
            ))}
          </div>
        </div>

        <div className="card-elevated-lg space-y-6 p-6 sm:p-8">
          <div className="space-y-2 border-b border-slate-200 pb-4">
            <div className="h-3 w-48 rounded bg-muted/50" />
            <div className="h-4 w-56 rounded bg-muted/50" />
          </div>
          <div className="space-y-3">
            <div className="h-4 w-full rounded bg-muted/50" />
            <div className="h-4 w-full rounded bg-muted/50" />
            <div className="h-4 w-[85%] rounded bg-muted/50" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 rounded-xl bg-muted/50" />
            ))}
          </div>
        </div>
      </div>
    </DashboardMobilePage>
  );
}
