'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VitrineFacets } from '@/lib/vitrine/types';
import { Input } from '@/components/ui/input';
import { QuestaoFilterBar } from '@/components/questao-filter/QuestaoFilterBar';
import { QuestaoFilterChipsRow } from '@/components/questao-filter/QuestaoFilterChipsRow';

export type VitrineToolbarProps = {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onSearchClear: () => void;
  mobileSearchOpen: boolean;
  bancasSelected: string[];
  assuntosSelected: string[];
  onBancasChange: (bancas: string[]) => void;
  onAssuntosChange: (assuntos: string[]) => void;
  onClearBancas: () => void;
  onClearAssuntos: () => void;
  onClearAllFilters: () => void;
  facets: VitrineFacets;
  facetsLoading: boolean;
};

export function VitrineToolbar({
  searchTerm,
  onSearchChange,
  onSearchClear,
  mobileSearchOpen,
  bancasSelected,
  assuntosSelected,
  onBancasChange,
  onAssuntosChange,
  onClearBancas,
  onClearAssuntos,
  onClearAllFilters,
  facets,
  facetsLoading,
}: VitrineToolbarProps) {
  const [bancaSheetOpen, setBancaSheetOpen] = useState(false);
  const [assuntoSheetOpen, setAssuntoSheetOpen] = useState(false);

  return (
    <div className="sticky top-0 z-20 border-b border-slate-200 bg-background/95 pt-safe shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-background/90 md:pt-0">
      <div className="md:hidden">
        {mobileSearchOpen ? (
          <div className="border-t border-border/70 px-4 pb-3 pt-2">
            <div className="group relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                type="text"
                data-vitrine-shell-search
                autoFocus
                placeholder="Assunto, tópico, banca, slug ou Q-…"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="h-11 rounded-xl border-border/80 bg-white pl-10 pr-11 text-sm"
              />
              {searchTerm ? (
                <button
                  type="button"
                  onClick={onSearchClear}
                  className="absolute right-1 top-1/2 flex min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center text-muted-foreground transition-colors hover:text-destructive"
                  aria-label="Limpar busca"
                >
                  <X size={16} aria-hidden />
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="scroll-pl-4 px-4 py-2 pb-3">
            <QuestaoFilterChipsRow
              bancasSelected={bancasSelected}
              assuntosSelected={assuntosSelected}
              searchTerm={searchTerm}
              facets={facets}
              facetsLoading={facetsLoading}
              bancaSheetOpen={bancaSheetOpen}
              assuntoSheetOpen={assuntoSheetOpen}
              onBancaSheetOpenChange={setBancaSheetOpen}
              onAssuntoSheetOpenChange={setAssuntoSheetOpen}
              onBancasChange={onBancasChange}
              onAssuntosChange={onAssuntosChange}
              onClearBancas={onClearBancas}
              onClearAssuntos={onClearAssuntos}
              onClearAll={onClearAllFilters}
            />
          </div>
        )}
      </div>

      <div className="mx-auto hidden max-w-7xl px-6 py-2 md:block">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <QuestaoFilterBar
              variant="vitrine"
              showSearch={false}
              facets={facets}
              facetsLoading={facetsLoading}
              bancasSelected={bancasSelected}
              assuntosSelected={assuntosSelected}
              searchTerm={searchTerm}
              onBancasChange={onBancasChange}
              onAssuntosChange={onAssuntosChange}
              onSearchChange={onSearchChange}
            />
          </div>

          <div className="group relative w-60 shrink-0">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-foreground"
              aria-hidden
            />
            <Input
              type="text"
              placeholder="Buscar assunto, banca, Q-…"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-9 rounded-xl border-slate-200 bg-white pl-9 pr-9 text-sm"
            />
            {searchTerm ? (
              <button
                type="button"
                onClick={onSearchClear}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-destructive"
                aria-label="Limpar busca"
              >
                <X size={14} aria-hidden />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VitrineToolbar;
