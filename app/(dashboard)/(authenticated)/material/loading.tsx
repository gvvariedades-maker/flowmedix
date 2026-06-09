import { DashboardMobilePage } from '@/components/layout/DashboardMobilePage';
import { DASHBOARD_PAGE_ROOT } from '@/lib/layout/mobileBottomNav';

export default function MaterialLoading() {
  return (
    <DashboardMobilePage variant="default" className={`${DASHBOARD_PAGE_ROOT} bg-[#010409]`}>
      <div className="mx-auto max-w-5xl animate-pulse px-4 py-10 sm:px-6 md:px-10 md:py-16">
        <div className="h-10 w-2/3 max-w-md rounded-xl bg-white/8" />
        <div className="mt-3 h-4 w-full max-w-lg rounded-lg bg-white/5" />
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="h-40 rounded-2xl bg-white/[0.04]" />
          <div className="h-40 rounded-2xl bg-white/[0.03]" />
          <div className="h-40 rounded-2xl bg-white/[0.03]" />
        </div>
      </div>
    </DashboardMobilePage>
  );
}
