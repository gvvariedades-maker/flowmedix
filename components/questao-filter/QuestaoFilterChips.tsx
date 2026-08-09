'use client';

import { Building2, ChevronDown, Layers, X } from 'lucide-react';
import { multiFilterResumo } from '@/lib/questao-filter/multiFilterResumo';
import { vitrineBrand } from '@/lib/vitrine/vitrineBrand';
import { cn } from '@/lib/utils';

export type QuestaoFilterChipsProps = {
  bancasSelected: string[];
  assuntosSelected: string[];
  searchTerm: string;
  facetsLoading: boolean;
  hasBancaOptions: boolean;
  hasAssuntoOptions: boolean;
  onOpenBanca: () => void;
  onOpenAssunto: () => void;
  onClearBancas: () => void;
  onClearAssuntos: () => void;
  onClearAll: () => void;
  className?: string;
  /** Acento de marca; `default` e `vitrine` usam `EDITORIAL_BRAND` (`#F26522`). */
  accent?: 'default' | 'vitrine';
};

export function QuestaoFilterChips({
  bancasSelected,
  assuntosSelected,
  searchTerm,
  facetsLoading,
  hasBancaOptions,
  hasAssuntoOptions,
  onOpenBanca,
  onOpenAssunto,
  onClearBancas,
  onClearAssuntos,
  onClearAll,
  className,
  accent: _accent = 'default',
}: QuestaoFilterChipsProps) {
  const hasActiveFilters =
    bancasSelected.length > 0 || assuntosSelected.length > 0 || searchTerm.trim().length > 0;

  const activeChipClass = vitrineBrand.filterChipActive;
  const activeDotClass = vitrineBrand.filterChipDot;
  const clearHoverClass = vitrineBrand.filterChipClearHover;

  const inactiveChipClass =
    'inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 md:min-h-9 md:px-3 md:py-1';

  return (
    <div
      className={cn(
        'flex items-center gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className,
      )}
      aria-label="Filtros de questões"
    >
      {bancasSelected.length > 0 ? (
        <div
          className={cn(activeChipClass, facetsLoading && !hasBancaOptions && 'opacity-50')}
        >
          <button
            type="button"
            disabled={facetsLoading && !hasBancaOptions}
            onClick={onOpenBanca}
            className="inline-flex min-h-[44px] max-w-[10rem] items-center gap-1.5 rounded-l-full py-1.5 pl-3 pr-1 disabled:cursor-not-allowed md:min-h-9 md:py-1"
          >
            <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', activeDotClass)} aria-hidden />
            <span className="truncate">{multiFilterResumo(bancasSelected, 'bancas')}</span>
          </button>
          <button
            type="button"
            aria-label="Limpar filtro de banca"
            onClick={(e) => {
              e.stopPropagation();
              onClearBancas();
            }}
            className={cn('flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-r-full md:min-h-9 md:min-w-9', clearHoverClass)}
          >
            <X size={14} aria-hidden />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={facetsLoading && !hasBancaOptions}
          onClick={onOpenBanca}
          className={inactiveChipClass}
        >
          <Building2 size={14} aria-hidden />
          Banca
          <ChevronDown size={12} className="text-slate-400" aria-hidden />
        </button>
      )}

      {assuntosSelected.length > 0 ? (
        <div
          className={cn(activeChipClass, facetsLoading && !hasAssuntoOptions && 'opacity-50')}
        >
          <button
            type="button"
            disabled={facetsLoading && !hasAssuntoOptions}
            onClick={onOpenAssunto}
            className="inline-flex min-h-[44px] max-w-[10rem] items-center gap-1.5 rounded-l-full py-1.5 pl-3 pr-1 disabled:cursor-not-allowed md:min-h-9 md:py-1"
          >
            <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', activeDotClass)} aria-hidden />
            <span className="truncate">{multiFilterResumo(assuntosSelected, 'assuntos')}</span>
          </button>
          <button
            type="button"
            aria-label="Limpar filtro de assunto"
            onClick={(e) => {
              e.stopPropagation();
              onClearAssuntos();
            }}
            className={cn('flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-r-full md:min-h-9 md:min-w-9', clearHoverClass)}
          >
            <X size={14} aria-hidden />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={facetsLoading && !hasAssuntoOptions}
          onClick={onOpenAssunto}
          className={inactiveChipClass}
        >
          <Layers size={14} aria-hidden />
          Assunto
          <ChevronDown size={12} className="text-slate-400" aria-hidden />
        </button>
      )}

      {hasActiveFilters ? (
        <button
          type="button"
          onClick={onClearAll}
          className="inline-flex min-h-[44px] shrink-0 items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 md:min-h-9 md:py-1"
        >
          Limpar
        </button>
      ) : null}
    </div>
  );
}
