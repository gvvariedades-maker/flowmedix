import { DashboardMobilePage } from '@/components/layout/DashboardMobilePage';
import { DASHBOARD_PAGE_ROOT } from '@/lib/layout/mobileBottomNav';

export default function AssinaturaLoading() {
  return (
    <DashboardMobilePage variant="default" className={`${DASHBOARD_PAGE_ROOT} bg-background`}>
      <div className="mx-auto max-w-2xl animate-pulse space-y-8 px-4 py-8 sm:px-6">
        <div className="space-y-3">
          <div className="h-3 w-24 rounded-lg bg-muted/50" />
          <div className="h-8 w-56 rounded-xl bg-muted/70" />
          <div className="h-4 w-full max-w-md rounded-lg bg-muted/50" />
        </div>
        <div className="card-elevated-lg h-64 rounded-2xl bg-muted/40" />
      </div>
    </DashboardMobilePage>
  );
}
