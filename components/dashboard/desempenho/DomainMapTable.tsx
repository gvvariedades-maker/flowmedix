import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { AreaPerformance } from '@/lib/desempenho/types';
import {
  desempenhoPctTone,
  formatDesempenhoDate,
  formatDesempenhoPct,
} from '@/components/dashboard/desempenho/formatDesempenho';

type Props = {
  areas: AreaPerformance[];
};

const PCT_TONE_CLASS = {
  neutral: 'text-slate-700',
  danger: 'text-[var(--color-danger-text)]',
  warning: 'text-[var(--color-warning-text)]',
  success: 'text-[var(--color-success-text)]',
} as const;

/**
 * Árvore área → assunto: Respondidas | Acertos | % | Última prática | Praticar.
 * Assunto ordenado pelo pior % (amostra ≥ 5) via agregação.
 */
export function DomainMapTable({ areas }: Props) {
  const areasWithPractice = areas
    .map((area) => ({
      ...area,
      assuntos: area.assuntos.filter((a) => a.respondidas > 0),
    }))
    .filter((area) => area.assuntos.length > 0);

  if (areasWithPractice.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-background px-4 py-8 text-center text-sm text-muted-foreground">
        Nenhuma atividade no filtro atual.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-background">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-border bg-slate-50 text-[0.6875rem] uppercase tracking-wider text-slate-500">
          <tr>
            <th className="px-3 py-2.5 font-medium">Assunto</th>
            <th className="px-3 py-2.5 font-medium">Respondidas</th>
            <th className="px-3 py-2.5 font-medium">Acertos</th>
            <th className="px-3 py-2.5 font-medium">%</th>
            <th className="px-3 py-2.5 font-medium">Última prática</th>
            <th className="px-3 py-2.5 font-medium">
              <span className="sr-only">Ação</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {areasWithPractice.map((area) => (
            <AreaBlock key={area.areaId} area={area} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AreaBlock({ area }: { area: AreaPerformance }) {
  const areaTone = desempenhoPctTone(area.percentual, area.amostraSuficiente);

  return (
    <>
      <tr className="border-b border-border bg-slate-50/90">
        <td className="px-3 py-2.5" colSpan={1}>
          <div className="font-semibold text-slate-900">{area.areaLabel}</div>
          <div className="text-[0.6875rem] text-muted-foreground">
            cobertura {area.coberturaPct}% · {area.assuntos.length}{' '}
            {area.assuntos.length === 1 ? 'assunto' : 'assuntos'}
          </div>
        </td>
        <td className="px-3 py-2.5 tabular-nums font-medium text-slate-800">{area.respondidas}</td>
        <td className="px-3 py-2.5 tabular-nums font-medium text-slate-800">{area.acertos}</td>
        <td
          className={cn(
            'px-3 py-2.5 tabular-nums font-semibold',
            PCT_TONE_CLASS[areaTone],
          )}
        >
          {area.amostraSuficiente
            ? formatDesempenhoPct(area.percentual)
            : `${area.acertos}/${area.respondidas}`}
        </td>
        <td className="px-3 py-2.5 text-muted-foreground">—</td>
        <td className="px-3 py-2.5" />
      </tr>
      {area.assuntos.map((assunto) => {
        const tone = desempenhoPctTone(assunto.percentual, assunto.amostraSuficiente);
        return (
          <tr
            key={assunto.tituloAula}
            className="border-b border-border/70 last:border-0 hover:bg-slate-50/60"
          >
            <td className="px-3 py-2.5 pl-6">
              <div className="font-medium text-slate-900">{assunto.tituloAula}</div>
              <div className="text-[0.6875rem] text-muted-foreground">
                {assunto.respondidas}/{assunto.totalDisponivel} cobertos
              </div>
            </td>
            <td className="px-3 py-2.5 tabular-nums">{assunto.respondidas}</td>
            <td className="px-3 py-2.5 tabular-nums">{assunto.acertos}</td>
            <td className={cn('px-3 py-2.5 tabular-nums font-medium', PCT_TONE_CLASS[tone])}>
              {assunto.amostraSuficiente
                ? formatDesempenhoPct(assunto.percentual)
                : `${assunto.acertos}/${assunto.respondidas}`}
            </td>
            <td className="px-3 py-2.5 text-muted-foreground">
              {formatDesempenhoDate(assunto.ultimaPratica)}
            </td>
            <td className="px-3 py-2.5 text-right">
              <Link
                href={`/estudar?assunto=${encodeURIComponent(assunto.tituloAula)}&status=pending`}
                className="text-xs font-medium text-[var(--color-brand-text)] underline-offset-2 hover:underline"
              >
                Praticar
              </Link>
            </td>
          </tr>
        );
      })}
    </>
  );
}
