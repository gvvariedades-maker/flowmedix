import Link from 'next/link';
import { Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PracticeFocus, PracticeFocusReason } from '@/lib/desempenho/types';
import {
  formatDesempenhoConfianca,
  formatDesempenhoPctComAmostra,
} from '@/components/dashboard/desempenho/formatDesempenho';

const PRACTICE_REASON_LABEL: Record<PracticeFocusReason, string> = {
  weak_accuracy: 'Acerto baixo',
  wrong_unreviewed: 'Errou e ainda não revisou',
  low_coverage: 'Pouco praticado',
};

/** Motivo em linguagem de evento/estatística + amostra, sempre auditável. */
function describeFocus(focus: PracticeFocus): string {
  const confianca = formatDesempenhoConfianca(focus.confidenceId);

  if (focus.reason === 'wrong_unreviewed') {
    const erros = focus.errosSemReverso;
    return `${erros} erro${erros === 1 ? '' : 's'} sem estudo reverso em ${focus.respondidas} questões praticadas`;
  }

  if (focus.reason === 'low_coverage') {
    return `cobertura ${focus.coberturaPct}% — ${focus.respondidas} de ${focus.totalDisponivel} questões liberadas`;
  }

  return `${formatDesempenhoPctComAmostra(focus.percentual, focus.acertos, focus.respondidas)} · ${confianca}`;
}

type Props = {
  foci: PracticeFocus[];
};

/**
 * Próxima melhor ação: um foco em destaque com CTA curto + fila explicável.
 * O nome longo do assunto fica no conteúdo, nunca dentro do botão.
 */
export function NextPracticeCard({ foci }: Props) {
  if (foci.length === 0) {
    return (
      <section aria-labelledby="proximos-focos-title" className="space-y-3">
        <Header />
        <p className="metric-card px-4 py-5 text-sm text-muted-foreground">
          Nada urgente com os filtros atuais. Continue praticando na vitrine para o mapa ganhar
          precisão.
        </p>
      </section>
    );
  }

  const [primary, ...restantes] = foci;
  const primaryHref = `/estudar?assunto=${encodeURIComponent(primary!.deepLinkAssunto)}&status=pending`;

  return (
    <section aria-labelledby="proximos-focos-title" className="space-y-3">
      <Header />
      <div className="metric-card space-y-4 p-4 sm:p-5">
        <div className="space-y-1">
          <p className="text-[0.6875rem] font-medium uppercase tracking-wider text-[var(--color-brand-text)]">
            {PRACTICE_REASON_LABEL[primary!.reason]}
          </p>
          <p className="break-words text-base font-semibold text-slate-900">
            {primary!.tituloAula}
          </p>
          <p className="text-xs text-muted-foreground">{describeFocus(primary!)}</p>
        </div>

        <Button asChild className="btn-editorial-primary min-h-11 w-full sm:w-auto">
          <Link href={primaryHref} aria-label={`Testar em outra questão de ${primary!.tituloAula}`}>
            Testar em outra questão
          </Link>
        </Button>

        {restantes.length > 0 ? (
          <div className="border-t border-border/70 pt-3">
            <p className="mb-2 text-[0.6875rem] font-medium uppercase tracking-wider text-slate-500">
              Depois deste
            </p>
            <ul className="space-y-2">
              {restantes.map((focus) => (
                <li key={`${focus.tituloAula}-${focus.reason}`} className="min-w-0">
                  <Link
                    href={`/estudar?assunto=${encodeURIComponent(focus.deepLinkAssunto)}&status=pending`}
                    className="block min-h-11 rounded-lg border border-border/80 bg-background px-3 py-2 hover:border-[var(--color-brand-ring)]"
                  >
                    <span className="block break-words text-sm font-medium text-slate-900">
                      {focus.tituloAula}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {PRACTICE_REASON_LABEL[focus.reason]} · {describeFocus(focus)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
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
        <Target className="h-4 w-4 text-[var(--color-brand)]" aria-hidden />
        Próximos focos
      </h2>
      <p className="text-xs text-muted-foreground">
        Ordem fixa: erro sem revisão, depois acerto baixo com amostra suficiente, depois assunto
        pouco praticado.
      </p>
    </div>
  );
}
