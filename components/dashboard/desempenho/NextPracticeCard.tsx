import Link from 'next/link';
import { TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PracticeFocus, PracticeFocusReason } from '@/lib/desempenho/types';

const PRACTICE_REASON_LABEL: Record<PracticeFocusReason, string> = {
  weak_accuracy: 'Pior acerto',
  wrong_unreviewed: 'Errou e não revisou',
  low_coverage: 'Baixa cobertura',
};

type Props = {
  foci: PracticeFocus[];
};

/**
 * 3–5 focos de prática + CTA único para o primeiro foco (deep link vitrine).
 */
export function NextPracticeCard({ foci }: Props) {
  if (foci.length === 0) {
    return (
      <section aria-labelledby="proximos-focos-title" className="space-y-3">
        <Header />
        <p className="text-sm text-muted-foreground">Nenhum foco urgente com o filtro atual.</p>
      </section>
    );
  }

  const primary = foci[0];
  const primaryHref = `/estudar?assunto=${encodeURIComponent(primary.deepLinkAssunto)}&status=pending`;

  return (
    <section aria-labelledby="proximos-focos-title" className="space-y-3">
      <Header />
      <div className="metric-card space-y-4 p-4 sm:p-5">
        <ul className="space-y-2">
          {foci.map((focus, index) => (
            <li
              key={`${focus.tituloAula}-${focus.reason}`}
              className="flex items-start gap-3 rounded-lg border border-border/80 bg-background px-3 py-2.5"
            >
              <span
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[0.6875rem] font-semibold tabular-nums text-slate-600"
                aria-hidden
              >
                {index + 1}
              </span>
              <div className="min-w-0">
                <p className="font-medium text-slate-900">{focus.tituloAula}</p>
                <p className="text-xs text-muted-foreground">
                  {PRACTICE_REASON_LABEL[focus.reason]}
                  {focus.percentual !== null ? ` · ${focus.percentual}%` : ''}
                  {focus.respondidas > 0 ? ` · ${focus.respondidas} resp.` : ''}
                  {focus.erros > 0 ? ` · ${focus.erros} erro(s)` : ''}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <Button asChild className="btn-editorial-primary w-full sm:w-auto">
          <Link href={primaryHref}>
            Praticar agora: {primary.tituloAula}
          </Link>
        </Button>
      </div>
    </section>
  );
}

function Header() {
  return (
    <div>
      <h2
        id="proximos-focos-title"
        className="flex items-center gap-2 text-base font-semibold text-slate-900"
      >
        <TrendingDown className="h-4 w-4 text-[var(--color-danger-text)]" aria-hidden />
        Próximos focos
      </h2>
      <p className="text-xs text-muted-foreground">Até 5 assuntos para praticar agora.</p>
    </div>
  );
}
