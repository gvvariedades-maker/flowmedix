import { DashboardMobilePage } from '@/components/layout/DashboardMobilePage';
import { DASHBOARD_PAGE_ROOT } from '@/lib/layout/mobileBottomNav';

export default function SimuladosLoading() {
  return (
    <DashboardMobilePage
      variant="default"
      className={`${DASHBOARD_PAGE_ROOT} bg-[#010409]`}
    >
      <div className="sticky top-0 z-20 border-b border-[rgba(255,255,255,0.08)] bg-[#010409]/95 backdrop-blur-md">
        <div className="mx-auto max-w-4xl animate-pulse px-4 py-5 sm:px-6 md:px-10">
          <div className="h-8 w-40 rounded-xl bg-white/8" />
          <div className="mt-2 h-4 w-full max-w-md rounded-lg bg-white/5" />
        </div>
      </div>
      <div className="mx-auto max-w-4xl animate-pulse space-y-4 px-4 py-6 sm:px-6 md:px-10">
        <div className="h-28 rounded-2xl bg-white/[0.04]" />
        <div className="h-20 rounded-2xl bg-white/[0.03]" />
        <div className="h-20 rounded-2xl bg-white/[0.03]" />
      </div>
    </DashboardMobilePage>
  );
}
