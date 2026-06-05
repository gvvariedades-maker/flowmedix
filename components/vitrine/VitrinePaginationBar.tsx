'use client';

import { forwardRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MOBILE_STICKY_ABOVE_NAV_BOTTOM } from '@/lib/layout/mobileBottomNav';

export type VitrinePaginationBarVariant = 'inline' | 'sticky';

export type VitrinePaginationBarProps = {
  pagina: number;
  paginaEfetiva: number;
  totalPaginas: number;
  listBusy: boolean;
  onPrev: () => void;
  onNext: () => void;
  variant?: VitrinePaginationBarVariant;
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
      variant = 'inline',
    },
    ref,
  ) {
    const pageLabel = listBusy ? pagina : paginaEfetiva;
    const prevDisabled = pagina <= 1 || listBusy;
    const nextDisabled = pagina >= totalPaginas || listBusy;

    const pageText = (
      <p
        className={cn(
          'text-xs font-medium text-muted-foreground',
          variant === 'inline'
            ? 'order-2 text-center sm:order-1 sm:text-left'
            : 'text-center',
        )}
      >
        Página {pageLabel} de {totalPaginas}
      </p>
    );

    const buttons = (
      <div
        className={cn(
          'flex items-center gap-2',
          variant === 'inline' && 'order-1 sm:order-2 sm:ml-auto',
        )}
      >
        <Button
          type="button"
          variant="outline"
          disabled={prevDisabled}
          onClick={onPrev}
          data-testid={variant === 'sticky' ? 'vitrine-pagination-prev-sticky' : undefined}
          className={cn(
            'flex-1 rounded-xl border-white/15 sm:flex-none',
            variant === 'sticky' ? 'min-h-[44px]' : 'h-11',
          )}
        >
          <ChevronLeft size={18} className="mr-1" aria-hidden />
          Anterior
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={nextDisabled}
          onClick={onNext}
          data-testid={variant === 'sticky' ? 'vitrine-pagination-next-sticky' : undefined}
          className={cn(
            'flex-1 rounded-xl border-white/15 sm:flex-none',
            variant === 'sticky' ? 'min-h-[44px]' : 'h-11',
          )}
        >
          Próxima
          <ChevronRight size={18} className="ml-1" aria-hidden />
        </Button>
      </div>
    );

    if (variant === 'sticky') {
      return (
        <nav
          className={cn(
            'fixed inset-x-0 z-30 flex flex-col gap-2 md:hidden',
            MOBILE_STICKY_ABOVE_NAV_BOTTOM,
            'border-t border-white/10 bg-[#06090f]/95 px-4 py-3 pb-safe backdrop-blur-xl',
          )}
          aria-label="Paginação da vitrine"
          aria-busy={listBusy || undefined}
        >
          {buttons}
          {pageText}
        </nav>
      );
    }

    return (
      <nav
        ref={ref}
        className="mt-6 hidden flex-col gap-3 border-t border-white/10 pt-4 md:flex md:flex-row md:items-center md:justify-between"
        aria-label="Paginação da vitrine"
        aria-busy={listBusy || undefined}
      >
        {pageText}
        {buttons}
      </nav>
    );
  },
);
