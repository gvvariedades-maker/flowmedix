import { DashboardMobilePage } from '@/components/layout/DashboardMobilePage';
import { DASHBOARD_PAGE_ROOT } from '@/lib/layout/mobileBottomNav';

export default function PlanoDiarioLoading() {
  return (
    <DashboardMobilePage variant="default" className={`${DASHBOARD_PAGE_ROOT} bg-background`}>
      <div className="border-b border-slate-200 bg-background px-4 py-8 md:px-10">
        <div className="mx-auto max-w-3xl animate-pulse space-y-3">
          <div className="h-3 w-40 rounded-lg bg-muted/50" />
          <div className="h-10 w-64 rounded-xl bg-muted/70" />
          <div className="h-4 w-48 rounded-lg bg-muted/50" />
        </div>
      </div>
      <div className="mx-auto max-w-3xl animate-pulse space-y-6 px-4 py-10 md:px-10">
        <div className="h-28 rounded-2xl bg-muted/50" />
        <div className="h-28 rounded-2xl bg-muted/50" />
        <div className="h-28 rounded-2xl bg-muted/50" />
      </div>
    </DashboardMobilePage>
  );
}
