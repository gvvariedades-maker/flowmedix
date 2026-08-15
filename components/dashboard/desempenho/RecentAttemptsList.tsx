'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { DESEMPENHO_HOME_RECENT_LIMIT, type RecentAttempt } from '@/lib/desempenho/types';
import { formatDesempenhoDateTime } from '@/components/dashboard/desempenho/formatDesempenho';
import { DESEMPENHO_COPY } from '@/components/dashboard/desempenho/desempenhoCopy';

type Props = {
  attempts: RecentAttempt[];
  variant?: 'home' | 'pagina';
  historicoHref?: string;
  showHeader?: boolean;
};

/**
 * Últimas questões praticadas — uma linha por questão (estado atual do histórico).
 * Home: 5 visíveis; “Ver histórico” leva a `/desempenho/historico`.
 */
export function RecentAttemptsList({
  attempts,
  variant = 'home',
  historicoHref,
  showHeader = true,
}: Props) {
  const visiveis =
    variant === 'pagina' ? attempts : attempts.slice(0, DESEMPENHO_HOME_RECENT_LIMIT);
  const mostraHistorico = variant === 'home' && attempts.length > 0 && Boolean(historicoHref);

  return (
    <section
      aria-labelledby={showHeader ? 'recentes-title' : undefined}
      aria-label={showHeader ? undefined : 'Lista do histórico'}
      className="space-y-3"
    >
      {showHeader ? (
      <div>
        <h2 id="recentes-title" className="text-base font-semibold text-slate-900">
          Questões praticadas recentemente
        </h2>
        <p className="text-xs text-muted-foreground">
          Mostra o resultado atual de cada questão — se você refizer, o resultado é atualizado.
        </p>
      </div>
      ) : null}
      {attempts.length === 0 ? (
        <p className="text-sm text-muted-foreground">Ainda sem tentativas neste filtro.</p>
      ) : (
        <>
          <ul className="divide-y divide-border rounded-xl border border-border bg-background">
            {visiveis.map((attempt) => (
              <li
                key={attempt.id}
                className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-3"
              >
                <div className="min-w-0">
                  <Link
                    href={`/estudar/${encodeURIComponent(attempt.moduloSlug)}`}
                    data-testid="recent-attempt-title"
                    className="line-clamp-2 block text-sm font-medium text-slate-900 underline-offset-2 hover:underline [overflow-wrap:anywhere]"
                  >
                    {attempt.tituloAula ?? attempt.moduloSlug}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {formatDesempenhoDateTime(attempt.createdAt)}
                  </p>
                </div>
                <div
                  data-testid="recent-attempt-badges"
                  className="flex flex-wrap items-center gap-2 sm:shrink-0"
                >
                  {attempt.estudoReversoConcluido ? (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.6875rem] font-medium text-slate-600">
                      Reverso
                    </span>
                  ) : null}
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold',
                      attempt.acertou
                        ? 'bg-[var(--color-success-dim)] text-[var(--color-success-text)]'
                        : 'bg-[var(--color-danger-dim)] text-[var(--color-danger-text)]',
                    )}
                  >
                    {attempt.acertou ? 'Acerto' : 'Erro'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          {mostraHistorico ? (
            <Link
              href={historicoHref!}
              className="inline-flex min-h-11 items-center text-sm font-medium text-[var(--color-brand-text)] underline-offset-2 hover:underline"
            >
              {DESEMPENHO_COPY.verHistorico}
            </Link>
          ) : null}
        </>
      )}
    </section>
  );
}
