'use client';

import { BookOpen, SlidersHorizontal, X } from 'lucide-react';
import { multiFilterResumo } from '@/lib/questao-filter/multiFilterResumo';
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
}: QuestaoFilterChipsProps) {
  const hasActiveFilters =
    bancasSelected.length > 0 || assuntosSelected.length > 0 || searchTerm.trim().length > 0;

  const activeChipClass =
    'inline-flex min-h-[44px] shrink-0 items-center rounded-full border border-[rgba(143,224,32,0.35)] bg-[rgba(143,224,32,0.12)] text-xs font-medium text-[#3d6b0f]';

  const inactiveChipClass =
    'inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50';

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
            className="inline-flex min-h-[44px] max-w-[10rem] items-center gap-1.5 rounded-l-full py-1.5 pl-3 pr-1 disabled:cursor-not-allowed"
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#8fe020]" aria-hidden />
            <span className="truncate">{multiFilterResumo(bancasSelected, 'bancas')}</span>
          </button>
          <button
            type="button"
            aria-label="Limpar filtro de banca"
            onClick={(e) => {
              e.stopPropagation();
              onClearBancas();
            }}
            className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-r-full hover:bg-[rgba(143,224,32,0.2)]"
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
          <SlidersHorizontal size={14} aria-hidden />
          Banca
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
            className="inline-flex min-h-[44px] max-w-[10rem] items-center gap-1.5 rounded-l-full py-1.5 pl-3 pr-1 disabled:cursor-not-allowed"
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#8fe020]" aria-hidden />
            <span className="truncate">{multiFilterResumo(assuntosSelected, 'assuntos')}</span>
          </button>
          <button
            type="button"
            aria-label="Limpar filtro de assunto"
            onClick={(e) => {
              e.stopPropagation();
              onClearAssuntos();
            }}
            className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-r-full hover:bg-[rgba(143,224,32,0.2)]"
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
          <BookOpen size={14} aria-hidden />
          Assunto
        </button>
      )}

      {hasActiveFilters ? (
        <button
          type="button"
          onClick={onClearAll}
          className="inline-flex min-h-[44px] shrink-0 items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50"
        >
          Limpar
        </button>
      ) : null}
    </div>
  );
}
