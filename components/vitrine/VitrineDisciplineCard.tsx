'use client';

import { createElement } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { vitrineBrand } from '@/lib/vitrine/vitrineBrand';
import {
  getVitrineDisciplinaMeta,
  resolveDisciplinaCtaLabel,
  type VitrineDisciplinaId,
  type VitrineDisciplinaSummary,
} from '@/lib/vitrine/disciplina';

export type VitrineDisciplineCardProps = {
  summary: VitrineDisciplinaSummary;
  selected: boolean;
  onSelect: (id: VitrineDisciplinaId) => void;
  /** Hub: mais altura/presença na dobra. */
  prominent?: boolean;
  /** Pointer/focus — prefetch da lista filtrada da disciplina. */
  onPrefetch?: (id: VitrineDisciplinaId) => void;
};

export function VitrineDisciplineCard({
  summary,
  selected,
  onSelect,
  prominent = false,
  onPrefetch,
}: VitrineDisciplineCardProps) {
  const meta = getVitrineDisciplinaMeta(summary.id);
  const ctaLabel = resolveDisciplinaCtaLabel(summary);

  const warmCache = () => {
    if (summary.totalAssuntos === 0) return;
    onPrefetch?.(summary.id);
  };

  return (
    <button
      type="button"
      data-testid={`vitrine-discipline-card-${summary.id}`}
      aria-pressed={selected}
      disabled={summary.totalAssuntos === 0}
      onClick={() => onSelect(summary.id)}
      onPointerEnter={warmCache}
      onFocus={warmCache}
      className={cn(
        'group flex w-full flex-col text-left transition-all',
        'rounded-2xl border bg-white shadow-sm',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0cc93a]/40 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        prominent ? 'min-h-[148px] gap-4 px-5 py-5 sm:min-h-[160px] sm:px-6 sm:py-6' : 'gap-3 px-4 py-3.5',
        selected
          ? cn(vitrineBrand.tintBorder, vitrineBrand.tintBg, 'border-[rgba(12,201,58,0.35)]')
          : cn(
              'border-slate-200 hover:border-slate-300 hover:shadow-md',
              prominent && 'hover:-translate-y-0.5',
            ),
      )}
    >
      <div className="flex flex-1 items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                'flex shrink-0 items-center justify-center rounded-full border',
                prominent ? 'h-12 w-12' : 'h-9 w-9',
                selected
                  ? 'border-[rgba(12,201,58,0.35)] bg-[rgba(12,201,58,0.1)] text-[#0cc93a]'
                  : 'border-slate-200 bg-slate-50 text-slate-500 group-hover:border-[rgba(12,201,58,0.25)] group-hover:text-[#0cc93a]',
              )}
              aria-hidden
            >
              {createElement(meta.icon, {
                size: prominent ? 22 : 18,
                strokeWidth: 2,
              })}
            </span>
            <div className="min-w-0">
              <p
                className={cn(
                  'text-[11px] font-bold uppercase tracking-wider text-slate-500',
                  selected && vitrineBrand.text,
                )}
              >
                Disciplina
              </p>
              <p
                className={cn(
                  'truncate font-bold leading-snug text-slate-900',
                  prominent ? 'text-lg sm:text-xl' : 'text-base',
                )}
              >
                {summary.label}
              </p>
            </div>
          </div>
          <p className={cn('text-slate-500', prominent ? 'mt-3 text-sm' : 'mt-2 text-xs')}>
            {summary.totalAssuntos === 0
              ? 'Em breve'
              : summary.trabalhadas > 0 || summary.progressoPct > 0
                ? `${summary.totalAssuntos} ${summary.totalAssuntos === 1 ? 'assunto' : 'assuntos'} · ${summary.progressoPct}%`
                : `${summary.totalAssuntos} ${summary.totalAssuntos === 1 ? 'assunto' : 'assuntos'} · ${summary.totalQuestoes} questões`}
          </p>
        </div>

        <span
          className={cn(
            'inline-flex min-h-[44px] shrink-0 items-center justify-center gap-1.5 self-center rounded-xl px-4 text-xs font-black uppercase tracking-wide',
            selected || prominent
              ? vitrineBrand.buttonPrimary
              : 'border border-slate-200 bg-white text-slate-700 group-hover:border-[rgba(12,201,58,0.35)] group-hover:text-[#0cc93a]',
          )}
        >
          {ctaLabel}
          <ArrowRight size={14} aria-hidden />
        </span>
      </div>

      {summary.totalAssuntos > 0 ? (
        <div
          className={cn(
            'w-full overflow-hidden rounded-full bg-slate-100',
            prominent ? 'h-1.5' : 'h-1',
          )}
          role="progressbar"
          aria-valuenow={summary.progressoPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progresso em ${summary.label}`}
        >
          <div
            className={cn('h-full rounded-full transition-[width]', vitrineBrand.bar)}
            style={{ width: `${Math.min(100, Math.max(0, summary.progressoPct))}%` }}
          />
        </div>
      ) : null}
    </button>
  );
}

export default VitrineDisciplineCard;
