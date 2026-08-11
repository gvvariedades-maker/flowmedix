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
import { resolveAcertoDisplay } from '@/lib/vitrine/resolveAcertoDisplay';

export type VitrineDisciplineCardProps = {
  summary: VitrineDisciplinaSummary;
  selected: boolean;
  onSelect: (id: VitrineDisciplinaId) => void;
  /** Hub: mais altura/presença na dobra. */
  prominent?: boolean;
  /** Pointer/focus — prefetch da lista filtrada da disciplina. */
  onPrefetch?: (id: VitrineDisciplinaId) => void;
};

function resolveDisciplineSubtitle(summary: VitrineDisciplinaSummary): string {
  const assuntosLabel = `${summary.totalAssuntos} ${
    summary.totalAssuntos === 1 ? 'assunto' : 'assuntos'
  }`;

  if (summary.totalAssuntos === 0) return 'Em breve';

  const respondidas = summary.totalResolvidas ?? 0;
  if (respondidas > 0 && summary.acertos != null && summary.percentual != null) {
    const acerto = resolveAcertoDisplay({
      acertos: summary.acertos,
      totalResolvidas: respondidas,
      totalQuestoes: summary.totalQuestoes,
      percentual: summary.percentual,
    });
    return `${assuntosLabel} · ${acerto.label}`;
  }

  if (summary.trabalhadas > 0 || summary.progressoPct > 0) {
    return `${assuntosLabel} · ${summary.progressoPct}% cobertos`;
  }

  return `${assuntosLabel} · ${summary.totalQuestoes} questões`;
}

export function VitrineDisciplineCard({
  summary,
  selected,
  onSelect,
  prominent = false,
  onPrefetch,
}: VitrineDisciplineCardProps) {
  const meta = getVitrineDisciplinaMeta(summary.id);
  const ctaLabel = resolveDisciplinaCtaLabel(summary);
  const subtitle = resolveDisciplineSubtitle(summary);
  const coberturaPct = summary.progressoPct;
  const coberturaLabel =
    summary.totalResolvidas != null
      ? `${summary.totalResolvidas}/${summary.totalQuestoes} respondidas`
      : `${summary.trabalhadas}/${summary.totalQuestoes} cobertos`;

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
        vitrineBrand.cardSurface,
        'focus-visible:outline-none',
        vitrineBrand.focusRingOffset,
        'disabled:cursor-not-allowed disabled:opacity-50',
        prominent ? 'min-h-[148px] gap-4 px-5 py-5 sm:min-h-[160px] sm:px-6 sm:py-6' : 'gap-3 px-4 py-3.5',
        selected
          ? cn(vitrineBrand.tintBorder, vitrineBrand.tintBg, vitrineBrand.selectedBorder)
          : cn(prominent && 'hover:-translate-y-0.5'),
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
                  ? vitrineBrand.selectedIcon
                  : cn(
                      'border-slate-200 bg-slate-50 text-slate-500',
                      vitrineBrand.groupHoverIconBorder,
                      vitrineBrand.groupHoverText,
                    ),
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
            {subtitle}
          </p>
        </div>

        <span
          className={cn(
            vitrineBrand.buttonSecondary,
            'shrink-0 gap-1.5 self-center px-4 text-xs',
            selected || prominent
              ? 'border-[var(--color-card-border-hover)] bg-[var(--color-brand-wash)]'
              : null,
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
          aria-valuenow={coberturaPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Cobertura em ${summary.label}: ${coberturaLabel}`}
        >
          <div
            className={cn('h-full rounded-full transition-[width]', vitrineBrand.bar)}
            style={{ width: `${Math.min(100, Math.max(0, coberturaPct))}%` }}
          />
        </div>
      ) : null}
    </button>
  );
}

export default VitrineDisciplineCard;
