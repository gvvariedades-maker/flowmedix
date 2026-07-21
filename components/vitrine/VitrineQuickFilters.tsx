'use client';

import { LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { vitrineBrand } from '@/lib/vitrine/vitrineBrand';
import type { VitrineStatusFilter } from '@/lib/vitrine/filterGroups';
import type { VitrineViewMode } from '@/lib/vitrine/parseListQuery';

const STATUS_OPTIONS: { value: VitrineStatusFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendentes' },
  { value: 'new', label: 'Novos' },
];

export type VitrineQuickFiltersProps = {
  status: VitrineStatusFilter;
  onStatusChange: (status: VitrineStatusFilter) => void;
  view: VitrineViewMode;
  onViewChange: (view: VitrineViewMode) => void;
  counts?: Partial<Record<VitrineStatusFilter, number>>;
};

export function VitrineQuickFilters({
  status,
  onStatusChange,
  view,
  onViewChange,
  counts,
}: VitrineQuickFiltersProps) {
  return (
    <div
      data-testid="vitrine-quick-filters"
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div
        role="tablist"
        aria-label="Filtrar assuntos por progresso"
        className="inline-flex max-w-full rounded-xl border border-slate-200 bg-slate-50/80 p-1"
      >
        {STATUS_OPTIONS.map((option) => {
          const count = counts?.[option.value];
          return (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={status === option.value}
              data-testid={`vitrine-status-${option.value}`}
              onClick={() => onStatusChange(option.value)}
              className={cn(
                'min-h-[36px] flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors sm:flex-none sm:text-sm',
                status === option.value
                  ? cn('bg-white shadow-sm', vitrineBrand.text)
                  : 'text-slate-600 hover:text-slate-900',
              )}
            >
              {option.label}
              {count !== undefined ? (
                <span className="ml-1.5 tabular-nums opacity-60">({count})</span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div
        className="flex items-center gap-1 self-end rounded-xl border border-slate-200 bg-slate-50/80 p-1 sm:self-auto"
        role="group"
        aria-label="Modo de visualização"
      >
        <button
          type="button"
          aria-pressed={view === 'grid'}
          data-testid="vitrine-view-grid"
          title="Grade"
          onClick={() => onViewChange('grid')}
          className={cn(
            'flex size-9 items-center justify-center rounded-lg transition-colors',
            view === 'grid'
              ? cn('bg-white shadow-sm', vitrineBrand.text)
              : 'text-slate-400 hover:text-slate-700',
          )}
        >
          <LayoutGrid size={18} aria-hidden />
          <span className="sr-only">Grade</span>
        </button>
        <button
          type="button"
          aria-pressed={view === 'compact'}
          data-testid="vitrine-view-compact"
          title="Lista compacta"
          onClick={() => onViewChange('compact')}
          className={cn(
            'flex size-9 items-center justify-center rounded-lg transition-colors',
            view === 'compact'
              ? cn('bg-white shadow-sm', vitrineBrand.text)
              : 'text-slate-400 hover:text-slate-700',
          )}
        >
          <List size={18} aria-hidden />
          <span className="sr-only">Lista compacta</span>
        </button>
      </div>
    </div>
  );
}

export default VitrineQuickFilters;
