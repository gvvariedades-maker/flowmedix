import { DashboardMobilePage } from '@/components/layout/DashboardMobilePage';
import { DASHBOARD_PAGE_ROOT } from '@/lib/layout/mobileBottomNav';

export default function RevisoesHojeLoading() {
  return (
    <DashboardMobilePage variant="default" className={`${DASHBOARD_PAGE_ROOT} bg-background`}>
      <div className="border-b border-slate-200 bg-background px-4 py-8 md:px-10">
        <div className="mx-auto max-w-3xl animate-pulse space-y-3">
          <div className="h-3 w-36 rounded-lg bg-muted/50" />
          <div className="h-10 w-56 rounded-xl bg-muted/70" />
          <div className="h-4 w-64 rounded-lg bg-muted/50" />
        </div>
      </div>
      <div className="mx-auto max-w-3xl animate-pulse space-y-3 px-4 py-6 md:px-10">
        <div className="h-20 rounded-2xl bg-muted/50" />
        <div className="h-20 rounded-2xl bg-muted/50" />
        <div className="h-20 rounded-2xl bg-muted/50" />
      </div>
    </DashboardMobilePage>
  );
}
