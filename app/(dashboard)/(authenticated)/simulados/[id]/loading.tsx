import { DashboardMobilePage } from '@/components/layout/DashboardMobilePage';

export default function SimuladoSessionLoading() {
  return (
    <DashboardMobilePage
      variant="actionBar"
      className="min-h-screen bg-[#010409] px-4 pt-6 sm:px-6 md:pb-8 lg:px-8"
    >
      <div className="mx-auto max-w-3xl animate-pulse space-y-6">
        <div className="space-y-3">
          <div className="h-3 w-28 rounded-lg bg-white/5" />
          <div className="h-7 w-64 rounded-xl bg-white/8 sm:h-8" />
          <div className="h-4 w-full max-w-sm rounded-lg bg-white/5" />
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/3 rounded-full bg-cyan-500/20" />
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
          <div className="mb-3 h-3 w-32 rounded bg-white/5" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-8 w-8 rounded-lg bg-white/5" />
            ))}
          </div>
        </div>

        <div className="glass-panel space-y-6 border border-white/10 p-6 sm:p-8">
          <div className="space-y-2 border-b border-white/10 pb-4">
            <div className="h-3 w-48 rounded bg-white/5" />
            <div className="h-4 w-56 rounded bg-white/5" />
          </div>
          <div className="space-y-3">
            <div className="h-4 w-full rounded bg-white/5" />
            <div className="h-4 w-full rounded bg-white/5" />
            <div className="h-4 w-[85%] rounded bg-white/5" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 rounded-xl bg-white/5" />
            ))}
          </div>
        </div>
      </div>
    </DashboardMobilePage>
  );
}
