import { DashboardMobilePage } from '@/components/layout/DashboardMobilePage';
import { DASHBOARD_PAGE_ROOT } from '@/lib/layout/mobileBottomNav';

export default function SimuladosNovoLoading() {
  return (
    <DashboardMobilePage
      variant="default"
      className={`${DASHBOARD_PAGE_ROOT} bg-[#010409] px-4 pt-6 sm:px-6 sm:pb-8 lg:px-8`}
    >
      <div className="mx-auto max-w-3xl animate-pulse space-y-8">
        <div className="space-y-3">
          <div className="h-3 w-24 rounded-lg bg-white/5" />
          <div className="h-8 w-56 rounded-xl bg-white/8" />
          <div className="h-4 w-full max-w-md rounded-lg bg-white/5" />
        </div>

        <div className="glass-panel space-y-6 border border-white/10 p-6 sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-11 rounded-xl bg-white/5" />
            <div className="h-11 rounded-xl bg-white/5" />
          </div>
          <div className="h-11 rounded-xl bg-white/5" />
          <div className="h-11 rounded-xl bg-white/5" />
          <div className="h-12 rounded-2xl bg-cyan-500/10" />
        </div>
      </div>
    </DashboardMobilePage>
  );
}
