'use client';

import { useState } from 'react';
import { QuestaoFilterChips } from '@/components/questao-filter/QuestaoFilterChips';
import { QuestaoMobileFilterSheet } from '@/components/questao-filter/QuestaoMobileFilterSheet';
import { QuestaoFilterDesktopFacetPopover } from '@/components/questao-filter/QuestaoFilterDesktopFacetPopover';
import type { VitrineFacets } from '@/lib/vitrine/types';
import { cn } from '@/lib/utils';

export type QuestaoFilterChipsRowProps = {
  bancasSelected: string[];
  assuntosSelected: string[];
  searchTerm: string;
  facets: VitrineFacets;
  facetsLoading: boolean;
  bancaSheetOpen: boolean;
  assuntoSheetOpen: boolean;
  onBancaSheetOpenChange: (open: boolean) => void;
  onAssuntoSheetOpenChange: (open: boolean) => void;
  onBancasChange: (bancas: string[]) => void;
  onAssuntosChange: (assuntos: string[]) => void;
  onClearBancas: () => void;
  onClearAssuntos: () => void;
  onClearAll: () => void;
  className?: string;
};

function isDesktopViewport(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches;
}

/** Chips horizontais + sheets (mobile) + popovers (desktop) — vitrine. */
export function QuestaoFilterChipsRow({
  bancasSelected,
  assuntosSelected,
  searchTerm,
  facets,
  facetsLoading,
  bancaSheetOpen,
  assuntoSheetOpen,
  onBancaSheetOpenChange,
  onAssuntoSheetOpenChange,
  onBancasChange,
  onAssuntosChange,
  onClearBancas,
  onClearAssuntos,
  onClearAll,
  className,
}: QuestaoFilterChipsRowProps) {
  const [bancaPopoverOpen, setBancaPopoverOpen] = useState(false);
  const [assuntoPopoverOpen, setAssuntoPopoverOpen] = useState(false);

  const openBancaPicker = () => {
    if (isDesktopViewport()) {
      setBancaPopoverOpen(true);
    } else {
      onBancaSheetOpenChange(true);
    }
  };

  const openAssuntoPicker = () => {
    if (isDesktopViewport()) {
      setAssuntoPopoverOpen(true);
    } else {
      onAssuntoSheetOpenChange(true);
    }
  };

  return (
    <div className={cn('relative', className)}>
      <QuestaoFilterChips
        bancasSelected={bancasSelected}
        assuntosSelected={assuntosSelected}
        searchTerm={searchTerm}
        facetsLoading={facetsLoading}
        hasBancaOptions={facets.bancas.length > 0}
        hasAssuntoOptions={facets.assuntos.length > 0}
        onOpenBanca={openBancaPicker}
        onOpenAssunto={openAssuntoPicker}
        onClearBancas={onClearBancas}
        onClearAssuntos={onClearAssuntos}
        onClearAll={onClearAll}
        accent="vitrine"
      />

      <QuestaoFilterDesktopFacetPopover
        open={bancaPopoverOpen}
        onOpenChange={setBancaPopoverOpen}
        title="Filtrar por banca"
        options={facets.bancas}
        selected={bancasSelected}
        disabled={facetsLoading && facets.bancas.length === 0}
        searchPlaceholder="Buscar banca..."
        emptySearchLabel="Nenhuma banca encontrada"
        onChange={onBancasChange}
      />
      <QuestaoFilterDesktopFacetPopover
        open={assuntoPopoverOpen}
        onOpenChange={setAssuntoPopoverOpen}
        title="Filtrar por assunto"
        options={facets.assuntos}
        selected={assuntosSelected}
        disabled={facetsLoading && facets.assuntos.length === 0}
        searchPlaceholder="Buscar assunto..."
        emptySearchLabel="Nenhum assunto encontrado"
        onChange={onAssuntosChange}
      />

      <QuestaoMobileFilterSheet
        open={bancaSheetOpen}
        onClose={() => onBancaSheetOpenChange(false)}
        title="Filtrar por banca"
        options={facets.bancas}
        selected={bancasSelected}
        disabled={facetsLoading && facets.bancas.length === 0}
        searchPlaceholder="Buscar banca..."
        emptySearchLabel="Nenhuma banca encontrada"
        onChange={onBancasChange}
      />
      <QuestaoMobileFilterSheet
        open={assuntoSheetOpen}
        onClose={() => onAssuntoSheetOpenChange(false)}
        title="Filtrar por assunto"
        options={facets.assuntos}
        selected={assuntosSelected}
        disabled={facetsLoading && facets.assuntos.length === 0}
        searchPlaceholder="Buscar assunto..."
        emptySearchLabel="Nenhum assunto encontrado"
        onChange={onAssuntosChange}
      />
    </div>
  );
}
