import { DashboardMobilePage } from '@/components/layout/DashboardMobilePage';
import { DASHBOARD_PAGE_ROOT } from '@/lib/layout/mobileBottomNav';

export default function PlanoDiarioLoading() {
  return (
    <DashboardMobilePage variant="default" className={`${DASHBOARD_PAGE_ROOT} bg-[#010409]`}>
      <div className="mx-auto max-w-4xl animate-pulse px-4 py-6 sm:px-6 md:px-10">
        <div className="h-9 w-56 rounded-xl bg-white/8" />
        <div className="mt-2 h-4 w-full max-w-md rounded-lg bg-white/5" />
        <div className="mt-6 space-y-3">
          <div className="h-28 rounded-2xl bg-white/[0.04]" />
          <div className="h-28 rounded-2xl bg-white/[0.03]" />
          <div className="h-28 rounded-2xl bg-white/[0.03]" />
        </div>
      </div>
    </DashboardMobilePage>
  );
}
