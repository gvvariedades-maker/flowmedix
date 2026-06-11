import { DashboardMobilePage } from '@/components/layout/DashboardMobilePage';
import { DASHBOARD_PAGE_ROOT } from '@/lib/layout/mobileBottomNav';

export default function SimuladosNovoLoading() {
  return (
    <DashboardMobilePage
      variant="default"
      className={`${DASHBOARD_PAGE_ROOT} bg-background px-4 pt-6 sm:px-6 sm:pb-8 lg:px-8`}
    >
      <div className="mx-auto max-w-3xl animate-pulse space-y-8">
        <div className="space-y-3">
          <div className="h-3 w-24 rounded-lg bg-muted/50" />
          <div className="h-8 w-56 rounded-xl bg-muted/70" />
          <div className="h-4 w-full max-w-md rounded-lg bg-muted/50" />
        </div>

        <div className="card-elevated space-y-6 p-6 sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-11 rounded-xl bg-muted/50" />
            <div className="h-11 rounded-xl bg-muted/50" />
          </div>
          <div className="h-11 rounded-xl bg-muted/50" />
          <div className="h-11 rounded-xl bg-muted/50" />
          <div className="h-12 rounded-2xl bg-muted/50" />
        </div>
      </div>
    </DashboardMobilePage>
  );
}
