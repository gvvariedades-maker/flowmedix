import { DashboardMobilePage } from '@/components/layout/DashboardMobilePage';
import { DASHBOARD_PAGE_ROOT } from '@/lib/layout/mobileBottomNav';

export default function MaterialLoading() {
  return (
    <DashboardMobilePage variant="default" className={`${DASHBOARD_PAGE_ROOT} bg-background`}>
      <div className="mx-auto max-w-2xl animate-pulse space-y-8 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-md space-y-4 text-center">
          <div className="mx-auto h-8 w-40 rounded-full bg-muted/50" />
          <div className="h-10 w-full rounded-xl bg-muted/70" />
          <div className="h-4 w-full rounded-lg bg-muted/50" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-40 rounded-2xl bg-muted/50" />
          <div className="h-40 rounded-2xl bg-muted/50" />
        </div>
      </div>
    </DashboardMobilePage>
  );
}
