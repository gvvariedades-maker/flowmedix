'use client';

import { QuestaoFilterChips } from '@/components/questao-filter/QuestaoFilterChips';
import { QuestaoMobileFilterSheet } from '@/components/questao-filter/QuestaoMobileFilterSheet';
import type { VitrineFacets } from '@/lib/vitrine/types';

export type QuestaoFilterMobileRowProps = {
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

/** Chips horizontais + sheets multi-select (mobile vitrine). */
export function QuestaoFilterMobileRow({
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
}: QuestaoFilterMobileRowProps) {
  return (
    <>
      <QuestaoFilterChips
        className={className}
        bancasSelected={bancasSelected}
        assuntosSelected={assuntosSelected}
        searchTerm={searchTerm}
        facetsLoading={facetsLoading}
        hasBancaOptions={facets.bancas.length > 0}
        hasAssuntoOptions={facets.assuntos.length > 0}
        onOpenBanca={() => onBancaSheetOpenChange(true)}
        onOpenAssunto={() => onAssuntoSheetOpenChange(true)}
        onClearBancas={onClearBancas}
        onClearAssuntos={onClearAssuntos}
        onClearAll={onClearAll}
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
    </>
  );
}
