'use client';

import { useId, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  buildDesempenhoHref,
  countDesempenhoFiltrosAtivos,
  DESEMPENHO_FILTROS_LIMPOS,
} from '@/lib/desempenho/filtersHref';
import {
  DESEMPENHO_PERIODOS,
  type DesempenhoEstudoFilters,
  type DesempenhoPeriodo,
  type DesempenhoPeriodoResumo,
} from '@/lib/desempenho/types';
import { GRANDE_AREAS } from '@/lib/desempenho/taxonomiaEnfermagem';
import { VITRINE_DISCIPLINA_IDS, getVitrineDisciplinaMeta } from '@/lib/vitrine/disciplina';
import { formatDesempenhoPeriodoCivil } from '@/components/dashboard/desempenho/formatDesempenho';

const PERIODO_LABELS: Record<DesempenhoPeriodo, string> = {
  '7d': '7 dias',
  '30d': '30 dias',
  '90d': '90 dias',
  '12m': '12 meses',
  all: 'Tudo',
};

type Props = {
  filters: DesempenhoEstudoFilters;
  periodoResumo: DesempenhoPeriodoResumo;
};

/**
 * Filtros do hub: painel compacto no desktop, disclosure "Filtrar" no mobile.
 *
 * Todos os controles são links (a URL aplica o filtro no RSC). Nenhum filtro
 * exibido aqui é ignorado pela agregação — banca aparece só quando tem valor real.
 */
export function DesempenhoFiltros({ filters, periodoResumo }: Props) {
  const [aberto, setAberto] = useState(false);
  const painelId = useId();
  const ativos = countDesempenhoFiltrosAtivos(filters);

  const resumoPeriodo =
    filters.periodo === 'all'
      ? 'Todo o histórico'
      : `${PERIODO_LABELS[filters.periodo]} · ${formatDesempenhoPeriodoCivil(
          periodoResumo.startYmd,
          periodoResumo.endYmdInclusive,
        )}`;

  return (
    <section aria-label="Filtros de desempenho" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="min-w-0 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{resumoPeriodo}</span>
          {' — '}
          amostra pela atividade no período (horário de Brasília).
        </p>
        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          aria-expanded={aberto}
          aria-controls={painelId}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-medium text-foreground sm:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden />
          Filtrar
          {ativos > 0 ? (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-brand)] px-1.5 text-[0.6875rem] font-semibold tabular-nums text-white">
              {ativos}
            </span>
          ) : null}
        </button>
      </div>

      <div
        id={painelId}
        className={cn(
          'space-y-4 rounded-xl border border-border bg-background p-3 sm:p-4',
          !aberto && 'hidden sm:block',
        )}
      >
        <FilterGroup label="Período">
          {DESEMPENHO_PERIODOS.map((periodo) => (
            <FilterChip
              key={periodo}
              href={buildDesempenhoHref({ ...filters, periodo })}
              active={filters.periodo === periodo}
            >
              {PERIODO_LABELS[periodo]}
            </FilterChip>
          ))}
        </FilterGroup>

        <FilterGroup label="Disciplina">
          <FilterChip
            href={buildDesempenhoHref({ ...filters, disciplina: null })}
            active={!filters.disciplina}
          >
            Todas
          </FilterChip>
          {VITRINE_DISCIPLINA_IDS.map((id) => (
            <FilterChip
              key={id}
              href={buildDesempenhoHref({ ...filters, disciplina: id })}
              active={filters.disciplina === id}
            >
              {getVitrineDisciplinaMeta(id).shortLabel}
            </FilterChip>
          ))}
        </FilterGroup>

        <FilterGroup label="Área">
          <FilterChip
            href={buildDesempenhoHref({ ...filters, areaId: null })}
            active={!filters.areaId}
          >
            Todas as áreas
          </FilterChip>
          {GRANDE_AREAS.filter((area) => area.id !== 'outros').map((area) => (
            <FilterChip
              key={area.id}
              href={buildDesempenhoHref({ ...filters, areaId: area.id })}
              active={filters.areaId === area.id}
            >
              {area.label}
            </FilterChip>
          ))}
        </FilterGroup>

        {filters.banca ? (
          <FilterGroup label="Banca">
            <Link
              href={buildDesempenhoHref({ ...filters, banca: null })}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-[var(--color-brand-ring)] bg-[var(--color-brand-dim)] px-4 text-sm font-medium text-slate-900"
            >
              {filters.banca}
              <X className="h-3.5 w-3.5" aria-hidden />
              <span className="sr-only">Remover filtro de banca</span>
            </Link>
          </FilterGroup>
        ) : null}

        {ativos > 0 ? (
          <Link
            href={buildDesempenhoHref(DESEMPENHO_FILTROS_LIMPOS)}
            className="inline-flex min-h-11 items-center text-sm font-medium text-[var(--color-brand-text)] underline-offset-2 hover:underline"
          >
            Limpar filtros
          </Link>
        ) : null}
      </div>
    </section>
  );
}

function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label}>
      <p className="mb-1.5 text-[0.6875rem] font-medium uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'true' : undefined}
      className={cn(
        'inline-flex min-h-11 max-w-full items-center rounded-full border px-4 text-sm font-medium transition-colors',
        active
          ? 'border-[var(--color-brand-ring)] bg-[var(--color-brand-dim)] text-slate-900'
          : 'border-border bg-background text-muted-foreground hover:text-foreground',
      )}
    >
      <span className="truncate">{children}</span>
    </Link>
  );
}
