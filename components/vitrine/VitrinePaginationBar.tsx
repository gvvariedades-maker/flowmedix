'use client';

import { forwardRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
        className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-4 pb-12 sm:flex-row sm:items-center sm:justify-between sm:pb-0"
        aria-label="Paginação da vitrine"
        aria-busy={listBusy || undefined}
      >
        <p className="order-2 text-center text-xs font-medium text-muted-foreground sm:order-1 sm:text-left">
          Página {pageLabel} de {totalPaginas}
        </p>
        <div className="order-1 flex items-center gap-2 sm:order-2 sm:ml-auto">
          <Button
            type="button"
            variant="outline"
            disabled={prevDisabled}
            onClick={onPrev}
            data-testid="vitrine-pagination-prev"
            className="min-h-[44px] flex-1 rounded-xl border-white/15 sm:h-11 sm:flex-none"
          >
            <ChevronLeft size={18} className="mr-1" aria-hidden />
            Anterior
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={nextDisabled}
            onClick={onNext}
            data-testid="vitrine-pagination-next"
            className="min-h-[44px] flex-1 rounded-xl border-white/15 sm:h-11 sm:flex-none"
          >
            Próxima
            <ChevronRight size={18} className="ml-1" aria-hidden />
          </Button>
        </div>
      </nav>
    );
  },
);
