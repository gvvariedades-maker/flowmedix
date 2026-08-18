'use client';

import { ChevronRight, CheckCircle2, Circle } from 'lucide-react';
import { formatAvantCodigo } from '@/lib/avantCodigo';
import { vitrineBrand } from '@/lib/vitrine/vitrineBrand';
import { cn } from '@/lib/utils';
import type { VitrineQuestaoItem } from '@/lib/vitrine/types';
import { labelQuestoes } from '@/lib/labelQuestoes';
import { VitrineQuestaoLink } from '@/components/vitrine/VitrineQuestaoLink';

function StatusBadge({ status }: { status: VitrineQuestaoItem['status'] }) {
  if (status === 'estudada') {
    return <CheckCircle2 size={15} className={cn('shrink-0', vitrineBrand.icon)} aria-hidden />;
  }
  return <Circle size={15} className="shrink-0 text-slate-300" aria-hidden />;
}

export type VitrineQuestaoItemsProps = {
  firstSlug: string;
  totalQuestoes: number;
  questoes: VitrineQuestaoItem[];
  estudarQuery: string;
};

export function VitrineQuestaoItems({
  firstSlug,
  totalQuestoes,
  questoes,
  estudarQuery,
}: VitrineQuestaoItemsProps) {
  const questoesExibidas = questoes.length;
  const questoesTruncadas = Math.max(0, totalQuestoes - questoesExibidas);
  const listaFoiTruncada = questoesTruncadas > 0;

  return (
    <div data-testid="vitrine-questao-items">
      <div className="max-h-[min(50vh,20rem)] space-y-1.5 overflow-y-auto overscroll-contain pt-1 pr-1">
        {questoes.map((q) => {
          const estudada = q.status === 'estudada';
          return (
            <VitrineQuestaoLink
              key={q.slug}
              slug={q.slug}
              estudarQuery={estudarQuery}
              prefetch={false}
              className={cn(
                'group flex min-h-[44px] items-center gap-3 rounded-xl border px-3 py-2.5 transition-all',
                estudada
                  ? 'border-green-200 bg-green-50 hover:border-green-300'
                  : cn('border-slate-200 bg-white', vitrineBrand.hoverBorderLight, vitrineBrand.hoverBgDim),
              )}
            >
              <StatusBadge status={q.status} />
              <span
                className={cn(
                  'flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-medium',
                  estudada ? 'text-green-700' : 'text-slate-700',
                )}
              >
                <span>Questão {String(q.numero).padStart(2, '0')}</span>
                {formatAvantCodigo(q.avant_codigo) ? (
                  <span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">
                    {formatAvantCodigo(q.avant_codigo)}
                  </span>
                ) : null}
              </span>
              {!estudada ? (
                <span className="text-[10px] font-medium text-slate-500">Iniciar</span>
              ) : (
                <span className={cn('text-[10px] font-medium', vitrineBrand.text)}>Revisitar</span>
              )}
              <ChevronRight
                size={12}
                className="shrink-0 text-slate-400 opacity-60 transition-opacity group-hover:opacity-100"
                aria-hidden
              />
            </VitrineQuestaoLink>
          );
        })}
      </div>
      {listaFoiTruncada ? (
        <p className="mt-2 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-center text-[11px] font-medium text-amber-700">
          <span>
            +{questoesTruncadas} {labelQuestoes(questoesTruncadas)} neste assunto.
          </span>
          <VitrineQuestaoLink
            slug={firstSlug}
            estudarQuery={estudarQuery}
            prefetch={false}
            className="inline-flex min-h-[44px] items-center font-semibold text-amber-800 underline-offset-2 hover:text-amber-900 hover:underline"
          >
            Próxima pendente
          </VitrineQuestaoLink>
        </p>
      ) : null}
    </div>
  );
}
