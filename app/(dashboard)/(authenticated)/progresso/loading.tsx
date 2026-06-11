import { DashboardMobilePage } from '@/components/layout/DashboardMobilePage';
import { DASHBOARD_PAGE_ROOT } from '@/lib/layout/mobileBottomNav';

export default function ProgressoLoading() {
  return (
    <DashboardMobilePage variant="default" className={`${DASHBOARD_PAGE_ROOT} bg-background`}>
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-background/95 backdrop-blur-md">
        <div className="mx-auto max-w-3xl animate-pulse px-4 py-5 md:px-8">
          <div className="h-8 w-48 rounded-xl bg-muted/70" />
          <div className="mt-2 h-4 w-full max-w-md rounded-lg bg-muted/50" />
        </div>
      </div>
      <div className="mx-auto max-w-3xl animate-pulse space-y-4 px-4 py-6 md:px-8">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-muted/50" />
          ))}
        </div>
        <div className="h-48 rounded-2xl bg-muted/50" />
      </div>
    </DashboardMobilePage>
  );
}
