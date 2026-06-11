'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Filter } from 'lucide-react';
import { MultiCheckboxFilter } from '@/components/ui/MultiCheckboxFilter';
import { QuestaoSearchInput } from '@/components/questao-filter/QuestaoSearchInput';
import { QuestaoFilterChips } from '@/components/questao-filter/QuestaoFilterChips';
import { deriveFacetsFromModulos, useQuestaoFacets } from '@/components/questao-filter/useQuestaoFacets';
import type { VitrineFacets } from '@/lib/vitrine/types';
import { cn } from '@/lib/utils';

const EMPTY_MODULOS: { banca?: string | null; titulo_aula?: string | null }[] = [];

export type QuestaoFilterBarProps = {
  variant: 'vitrine' | 'caderno-panel';
  bancasSelected: string[];
  assuntosSelected: string[];
  searchTerm: string;
  onBancasChange: (bancas: string[]) => void;
  onAssuntosChange: (assuntos: string[]) => void;
  onSearchChange: (term: string) => void;
  /** Módulos locais para fallback de facets no painel do caderno. */
  modulosForFallback?: { banca?: string | null; titulo_aula?: string | null }[];
  /** Facets controlados pelo pai (vitrine SSR) — desliga fetch interno. */
  facets?: VitrineFacets;
  facetsLoading?: boolean;
  /** Exibe busca integrada (vitrine desktop usa busca no header). */
  showSearch?: boolean;
  resultCount?: number;
  highlightActiveFilters?: boolean;
  footer?: ReactNode;
  className?: string;
};

export function QuestaoFilterBar({
  variant,
  bancasSelected,
  assuntosSelected,
  searchTerm,
  onBancasChange,
  onAssuntosChange,
  onSearchChange,
  modulosForFallback = EMPTY_MODULOS,
  facets: facetsProp,
  facetsLoading: facetsLoadingProp,
  showSearch,
  resultCount,
  highlightActiveFilters = false,
  footer,
  className,
}: QuestaoFilterBarProps) {
  const isCaderno = variant === 'caderno-panel';
  const useExternalFacets = facetsProp !== undefined;
  const fallbackFacets = useMemo(
    () => deriveFacetsFromModulos(modulosForFallback),
    [modulosForFallback],
  );
  const { facets: loadedFacets, facetsLoading: loadedFacetsLoading } = useQuestaoFacets(
    bancasSelected,
    { fallbackFacets, enabled: !useExternalFacets },
  );
  const facets = facetsProp ?? loadedFacets;
  const facetsLoading = facetsLoadingProp ?? loadedFacetsLoading;
  const showSearchField = showSearch ?? isCaderno;

  const [bancaSheetOpen, setBancaSheetOpen] = useState(false);
  const [assuntoSheetOpen, setAssuntoSheetOpen] = useState(false);

  useEffect(() => {
    if (useExternalFacets || !assuntosSelected.length) return;
    const valid = assuntosSelected.filter((a) => facets.assuntos.includes(a));
    if (valid.length !== assuntosSelected.length) {
      onAssuntosChange(valid);
    }
  }, [assuntosSelected, facets.assuntos, onAssuntosChange, useExternalFacets]);

  const clearFilterSelections = () => {
    onBancasChange([]);
    onAssuntosChange([]);
  };

  const clearAll = () => {
    clearFilterSelections();
    if (showSearchField) onSearchChange('');
  };

  const highlightRing = highlightActiveFilters
    ? 'ring-2 ring-[rgba(143,224,32,0.35)] ring-offset-0 ring-offset-white'
    : undefined;

  if (isCaderno) {
    return (
      <div className={cn('space-y-3', className)}>
        <QuestaoSearchInput
          variant="caderno-panel"
          value={searchTerm}
          onChange={onSearchChange}
        />

        <div className="lg:hidden">
          <QuestaoFilterChips
            bancasSelected={bancasSelected}
            assuntosSelected={assuntosSelected}
            searchTerm={searchTerm}
            facetsLoading={facetsLoading}
            hasBancaOptions={facets.bancas.length > 0}
            hasAssuntoOptions={facets.assuntos.length > 0}
            onOpenBanca={() => setBancaSheetOpen(true)}
            onOpenAssunto={() => setAssuntoSheetOpen(true)}
            onClearBancas={() => onBancasChange([])}
            onClearAssuntos={() => onAssuntosChange([])}
            onClearAll={clearAll}
          />
        </div>

        <div className="hidden flex-col gap-3 lg:flex">
          <MultiCheckboxFilter
            emptyLabel="Todas as bancas"
            searchPlaceholder="Buscar banca..."
            addButtonLabel="Adicionar banca"
            sheetTitle="Adicionar banca"
            emptySearchLabel="Nenhuma banca encontrada"
            options={facets.bancas}
            value={bancasSelected}
            disabled={facetsLoading && facets.bancas.length === 0}
            onChange={onBancasChange}
            className={cn(bancasSelected.length > 0 && highlightRing)}
          />
          <MultiCheckboxFilter
            emptyLabel="Todos os assuntos"
            searchPlaceholder="Buscar assunto..."
            addButtonLabel="Adicionar assunto"
            sheetTitle="Adicionar assunto"
            emptySearchLabel="Nenhum assunto encontrado"
            contentMinWidth="min-w-[240px]"
            options={facets.assuntos}
            value={assuntosSelected}
            disabled={facetsLoading && facets.assuntos.length === 0}
            onChange={onAssuntosChange}
            className={cn(assuntosSelected.length > 0 && highlightRing)}
          />
        </div>

        {/* Sheets mobile acionados pelos chips — reutiliza MultiCheckboxFilter via estado externo */}
        {bancaSheetOpen ? (
          <MobileFacetPicker
            title="Filtrar por banca"
            options={facets.bancas.filter((b) => !bancasSelected.includes(b))}
            searchPlaceholder="Buscar banca..."
            onSelect={(option) => {
              onBancasChange([...bancasSelected, option]);
              setBancaSheetOpen(false);
            }}
            onClose={() => setBancaSheetOpen(false)}
          />
        ) : null}
        {assuntoSheetOpen ? (
          <MobileFacetPicker
            title="Filtrar por assunto"
            options={facets.assuntos.filter((a) => !assuntosSelected.includes(a))}
            searchPlaceholder="Buscar assunto..."
            onSelect={(option) => {
              onAssuntosChange([...assuntosSelected, option]);
              setAssuntoSheetOpen(false);
            }}
            onClose={() => setAssuntoSheetOpen(false)}
          />
        ) : null}

        {typeof resultCount === 'number' ? (
          <p className="text-[10px] font-bold text-slate-500">
            {resultCount} {resultCount === 1 ? 'questão encontrada' : 'questões encontradas'}
          </p>
        ) : null}

        {footer}
      </div>
    );
  }

  return (
    <section className={cn('space-y-4', className)} aria-label="Filtros da vitrine">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Filter size={16} aria-hidden />
        <span className="text-xs font-medium uppercase tracking-wider">Filtros</span>
      </div>
      {showSearchField ? (
        <QuestaoSearchInput variant="vitrine" value={searchTerm} onChange={onSearchChange} />
      ) : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <MultiCheckboxFilter
          emptyLabel="Todas as bancas"
          searchPlaceholder="Buscar banca..."
          addButtonLabel="Adicionar banca"
          sheetTitle="Adicionar banca"
          emptySearchLabel="Nenhuma banca encontrada"
          options={facets.bancas}
          value={bancasSelected}
          disabled={facetsLoading && facets.bancas.length === 0}
          onChange={onBancasChange}
        />
        <MultiCheckboxFilter
          emptyLabel="Todos os assuntos"
          searchPlaceholder="Buscar assunto..."
          addButtonLabel="Adicionar assunto"
          sheetTitle="Adicionar assunto"
          emptySearchLabel="Nenhum assunto encontrado"
          contentMinWidth="min-w-[240px]"
          options={facets.assuntos}
          value={assuntosSelected}
          disabled={facetsLoading && facets.assuntos.length === 0}
          onChange={onAssuntosChange}
        />
      </div>
      {(bancasSelected.length > 0 || assuntosSelected.length > 0) && (
        <button
          type="button"
          onClick={showSearchField ? clearAll : clearFilterSelections}
          className="text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          Limpar filtros
        </button>
      )}
      {footer}
    </section>
  );
}

function MobileFacetPicker({
  title,
  options,
  searchPlaceholder,
  onSelect,
  onClose,
}: {
  title: string;
  options: string[];
  searchPlaceholder: string;
  onSelect: (option: string) => void;
  onClose: () => void;
}) {
  const [busca, setBusca] = useState('');
  const filtered = useMemo(
    () => options.filter((o) => o.toLowerCase().includes(busca.toLowerCase().trim())),
    [busca, options],
  );

  return (
    <div className="fixed inset-0 z-[210] lg:hidden">
      <button
        type="button"
        aria-label="Fechar"
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="absolute inset-x-0 bottom-0 z-[211] flex max-h-[min(85dvh,32rem)] flex-col rounded-t-3xl border border-slate-200 bg-white pb-safe shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <p className="text-sm font-bold text-slate-900">{title}</p>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-semibold text-slate-500 hover:text-slate-700"
          >
            Fechar
          </button>
        </div>
        <div className="p-3">
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder={searchPlaceholder}
            className="input-editorial w-full px-3 py-2 text-sm"
          />
        </div>
        <ul className="custom-scrollbar flex-1 overflow-y-auto px-2 pb-4">
          {filtered.length === 0 ? (
            <li className="py-6 text-center text-xs text-slate-500">Nenhum resultado</li>
          ) : (
            filtered.map((option) => (
              <li key={option}>
                <button
                  type="button"
                  onClick={() => onSelect(option)}
                  className="flex min-h-[44px] w-full items-center rounded-lg px-3 text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  {option}
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
