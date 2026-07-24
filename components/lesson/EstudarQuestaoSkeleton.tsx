import { questaoPlayerShellRootClass } from '@/lib/lesson/questaoPlayerShellClass';

type EstudarQuestaoSkeletonProps = {
  /** Imersivo inline ou sheet @modal — sem radius no mobile (evita vazar fundo cinza). */
  mobileFullBleed?: boolean;
};

/**
 * Placeholder visual alinhado ao `AvantLessonPlayer` (card editorial claro).
 * Dimensões estáveis para reduzir CLS ao hidratar a questão.
 */
export default function EstudarQuestaoSkeleton({
  mobileFullBleed = false,
}: EstudarQuestaoSkeletonProps) {
  return (
    <div
      className={questaoPlayerShellRootClass('skeleton', {
        immersive: mobileFullBleed,
        modalActive: mobileFullBleed,
      })}
      role="status"
      aria-busy="true"
      aria-label="Carregando questão"
      data-testid="estudar-questao-skeleton"
    >
      <div className="h-2 w-full shrink-0 bg-slate-200">
        <div className="h-full w-[8%] animate-pulse bg-[var(--color-brand)]/70" />
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3 sm:px-6">
        <div className="flex min-h-[44px] items-center gap-2">
          <div className="h-9 w-9 shrink-0 rounded-full bg-muted/60 animate-pulse" />
          <div className="h-4 w-20 rounded-md bg-muted/50 animate-pulse sm:w-24" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-16 rounded-full bg-muted/50 animate-pulse sm:w-20" />
          <div className="h-9 w-9 rounded-lg bg-muted/50 animate-pulse" />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 md:px-8 md:py-5">
          <div className="h-5 w-4/5 max-w-lg rounded border-l-4 border-[var(--color-brand)]/35 bg-muted/50 pl-3 animate-pulse" />
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <div className="h-5 w-24 rounded-md border border-sky-100 bg-sky-50/80 animate-pulse" />
            <div className="h-5 w-10 rounded-md border border-slate-200 bg-white animate-pulse" />
            <div className="h-3.5 w-40 max-w-full rounded bg-muted/40 animate-pulse" />
          </div>
          <div className="mt-1.5 h-2.5 w-20 rounded bg-muted/30 animate-pulse" />
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-hidden px-6 py-4 md:px-8">
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-muted/50 animate-pulse" />
            <div className="h-4 w-[92%] rounded bg-muted/50 animate-pulse" />
            <div className="h-4 w-[78%] rounded bg-muted/50 animate-pulse" />
          </div>

          <div className="grid gap-2 pt-2 md:gap-2.5">
            {['a', 'b', 'c', 'd'].map((id) => (
              <div key={id} className="flex items-stretch gap-1">
                <div className="h-11 w-11 shrink-0 rounded-lg bg-muted/30 animate-pulse sm:h-12 sm:w-12" />
                <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 md:px-4">
                <div className="h-6 w-6 shrink-0 rounded-full bg-muted/50 animate-pulse" />
                <div className="min-w-0 flex-1 space-y-2 py-0.5">
                  <div className="h-4 w-full rounded bg-muted/50 animate-pulse" />
                  <div className="h-4 w-2/3 rounded bg-muted/40 animate-pulse" />
                </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="shrink-0 border-t border-slate-200 pb-safe">
        <div className="flex h-12 items-center justify-center gap-2 px-4">
          {Array.from({ length: 5 }, (_, i) => (
            <div
              key={i}
              className={`rounded-full bg-muted/50 animate-pulse ${i === 2 ? 'h-7 w-7' : 'h-5 w-5'}`}
            />
          ))}
        </div>
        <div className="flex items-center justify-between gap-2 px-2 py-3 sm:px-4">
          <div className="h-10 w-24 rounded-full bg-muted/50 animate-pulse" />
          <div className="h-10 w-28 rounded-full bg-muted/50 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
