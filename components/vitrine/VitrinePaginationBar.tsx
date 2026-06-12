'use client';

import { forwardRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type VitrinePaginationBarProps = {
  pagina: number;
  paginaEfetiva: number;
  totalPaginas: number;
  listBusy: boolean;
  onPrev: () => void;
  onNext: () => void;
};

export const VitrinePaginationBar = forwardRef<HTMLElement, VitrinePaginationBarProps>(
  function VitrinePaginationBar(
    {
      pagina,
      paginaEfetiva,
      totalPaginas,
      listBusy,
      onPrev,
      onNext,
    },
    ref,
  ) {
    const pageLabel = listBusy ? pagina : paginaEfetiva;
    const prevDisabled = pagina <= 1 || listBusy;
    const nextDisabled = pagina >= totalPaginas || listBusy;

    return (
      <nav
        ref={ref}
        className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-4 pb-4 md:flex-row md:items-center md:justify-between md:pb-0"
        aria-label="Paginação da vitrine"
        aria-busy={listBusy || undefined}
      >
        <p className="hidden text-xs font-medium text-slate-500 md:block">
          Página {pageLabel} de {totalPaginas}
        </p>

        <div className="flex items-center justify-center gap-2 md:ml-auto">
          <Button
            type="button"
            variant="outline"
            disabled={prevDisabled}
            onClick={onPrev}
            data-testid="vitrine-pagination-prev"
            aria-label="Anterior"
            className={cn(
              'min-h-[44px] rounded-xl border-slate-200 md:h-11',
              'h-11 w-11 shrink-0 p-0 md:w-auto md:px-4',
            )}
          >
            <ChevronLeft size={18} aria-hidden />
            <span className="hidden md:inline">
              <span className="ml-1">Anterior</span>
            </span>
          </Button>

          <span
            data-testid="vitrine-pagination-pill"
            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold tabular-nums text-slate-700 md:hidden"
          >
            {pageLabel} / {totalPaginas}
          </span>

          <Button
            type="button"
            variant="outline"
            disabled={nextDisabled}
            onClick={onNext}
            data-testid="vitrine-pagination-next"
            aria-label="Próxima"
            className={cn(
              'min-h-[44px] rounded-xl border-slate-200 md:h-11',
              'h-11 w-11 shrink-0 p-0 md:w-auto md:px-4',
            )}
          >
            <span className="hidden md:inline">
              <span className="mr-1">Próxima</span>
            </span>
            <ChevronRight size={18} aria-hidden />
          </Button>
        </div>
      </nav>
    );
  },
);
