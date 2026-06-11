/**
 * Placeholder visual alinhado ao `AvantLessonPlayer` (card editorial claro).
 * Dimensões estáveis para reduzir CLS ao hidratar a questão.
 */
export default function EstudarQuestaoSkeleton() {
  return (
    <div
      className="card-elevated-lg flex min-h-0 w-full flex-1 flex-col overflow-hidden font-sans shadow-none max-md:min-h-[min(72vh,640px)] md:rounded-[2.5rem]"
      role="status"
      aria-busy="true"
      aria-label="Carregando questão"
      data-testid="estudar-questao-skeleton"
    >
      <div className="h-2 w-full shrink-0 bg-slate-200">
        <div className="h-full w-1/3 animate-pulse bg-[#8fe020]/70" />
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
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-3 md:px-8 md:py-4">
          <div className="mb-2 h-3 w-28 rounded bg-[rgba(143,224,32,0.2)] animate-pulse" />
          <div className="h-4 w-full max-w-md rounded bg-muted/50 animate-pulse" />
          <div className="mt-3 h-5 w-4/5 max-w-lg rounded border-l-4 border-[rgba(143,224,32,0.35)] bg-muted/50 pl-3 animate-pulse" />
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-hidden px-6 py-4 md:px-8">
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-muted/50 animate-pulse" />
            <div className="h-4 w-[92%] rounded bg-muted/50 animate-pulse" />
            <div className="h-4 w-[78%] rounded bg-muted/50 animate-pulse" />
          </div>

          <div className="grid gap-2 pt-2 md:gap-2.5">
            {['a', 'b', 'c', 'd'].map((id) => (
              <div
                key={id}
                className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 md:px-4"
              >
                <div className="mt-0.5 h-7 w-7 shrink-0 rounded-full bg-muted/50 animate-pulse" />
                <div className="min-w-0 flex-1 space-y-2 py-0.5">
                  <div className="h-4 w-full rounded bg-muted/50 animate-pulse" />
                  <div className="h-4 w-2/3 rounded bg-muted/40 animate-pulse" />
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
