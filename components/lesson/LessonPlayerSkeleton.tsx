'use client';

/**
 * Placeholder visual alinhado ao AvantLessonPlayer durante navegação otimista (cache miss).
 */
export function LessonPlayerSkeleton() {
  return (
    <div
      className="w-full h-full flex-1 min-h-0 flex flex-col relative bg-[#0d1117] md:rounded-[40px] shadow-2xl overflow-hidden border border-[rgba(255,255,255,0.10)] font-sans animate-pulse"
      aria-busy="true"
      aria-label="Carregando questão"
    >
      <div className="h-2 w-full bg-white/10 shrink-0">
        <div className="h-full w-1/3 bg-indigo-500/40" />
      </div>

      <div className="flex-1 min-h-0 p-4 md:p-8 space-y-4 overflow-hidden">
        <div className="h-4 w-32 rounded bg-white/10" />
        <div className="h-5 w-3/4 max-w-md rounded bg-white/10" />
        <div className="space-y-2 pt-4">
          <div className="h-4 w-full rounded bg-white/5" />
          <div className="h-4 w-full rounded bg-white/5" />
          <div className="h-4 w-5/6 rounded bg-white/5" />
        </div>
        <div className="space-y-3 pt-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 w-full rounded-2xl bg-white/[0.06] border border-white/10" />
          ))}
        </div>
      </div>

      <div className="bg-[#0d1117] border-t border-[rgba(255,255,255,0.10)] shrink-0 pb-safe md:rounded-b-[40px]">
        <div className="flex justify-center gap-2 py-3 px-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-5 w-5 rounded-full bg-white/10" />
          ))}
        </div>
        <div className="px-4 py-3 flex justify-between items-center gap-2">
          <div className="h-11 w-28 rounded-xl bg-white/10" />
          <div className="h-11 w-36 rounded-xl bg-white/10" />
        </div>
      </div>
    </div>
  );
}
