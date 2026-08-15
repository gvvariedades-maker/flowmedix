import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { RecentAttempt } from '@/lib/desempenho/types';
import { formatDesempenhoDateTime } from '@/components/dashboard/desempenho/formatDesempenho';

type Props = {
  attempts: RecentAttempt[];
};

/**
 * Últimas questões praticadas — uma linha por questão (estado atual do histórico).
 * A UI não expõe o mecanismo de upsert; fala em "resultado atual".
 * Mobile: título quebra; etiquetas ficam abaixo — sem ocupar o mesmo eixo do nome.
 */
export function RecentAttemptsList({ attempts }: Props) {
  return (
    <section aria-labelledby="recentes-title" className="space-y-3">
      <div>
        <h2 id="recentes-title" className="text-base font-semibold text-slate-900">
          Questões praticadas recentemente
        </h2>
        <p className="text-xs text-muted-foreground">
          Mostra o resultado atual de cada questão — se você refizer, o resultado é atualizado.
        </p>
      </div>
      {attempts.length === 0 ? (
        <p className="text-sm text-muted-foreground">Ainda sem tentativas neste filtro.</p>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border bg-background">
          {attempts.map((attempt) => (
            <li key={attempt.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
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
      )}
    </section>
  );
}
