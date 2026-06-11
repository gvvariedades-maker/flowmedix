import { DashboardMobilePage } from '@/components/layout/DashboardMobilePage';
import { DASHBOARD_PAGE_ROOT } from '@/lib/layout/mobileBottomNav';

export default function SimuladosLoading() {
  return (
    <DashboardMobilePage variant="default" className={`${DASHBOARD_PAGE_ROOT} bg-background`}>
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-background/95 backdrop-blur-md">
        <div className="mx-auto max-w-4xl animate-pulse px-4 py-5 sm:px-6 md:px-10">
          <div className="h-8 w-40 rounded-xl bg-muted/70" />
          <div className="mt-2 h-4 w-full max-w-md rounded-lg bg-muted/50" />
        </div>
      </div>
      <div className="mx-auto max-w-4xl animate-pulse space-y-4 px-4 py-6 sm:px-6 md:px-10">
        <div className="h-28 rounded-2xl bg-muted/50" />
        <div className="h-20 rounded-2xl bg-muted/50" />
        <div className="h-20 rounded-2xl bg-muted/50" />
      </div>
    </DashboardMobilePage>
  );
}
