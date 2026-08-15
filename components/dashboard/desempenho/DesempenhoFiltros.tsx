'use client';

import { useId, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  buildDesempenhoHref,
  countDesempenhoFiltrosAtivos,
  DESEMPENHO_FILTROS_LIMPOS,
  DESEMPENHO_PATHS,
  desempenhoFiltersWithArea,
} from '@/lib/desempenho/filtersHref';
import {
  DESEMPENHO_ASSUNTO_BUSCA_MIN,
  DESEMPENHO_PERIODOS,
  type DesempenhoEstudoFilters,
  type DesempenhoPeriodo,
  type DesempenhoPeriodoResumo,
} from '@/lib/desempenho/types';
import { getGrandeAreaMeta, GRANDE_AREAS } from '@/lib/desempenho/taxonomiaEnfermagem';
import { VITRINE_DISCIPLINA_IDS, getVitrineDisciplinaMeta } from '@/lib/vitrine/disciplina';
import { formatDesempenhoPeriodoCivil } from '@/components/dashboard/desempenho/formatDesempenho';
import { DESEMPENHO_COPY } from '@/components/dashboard/desempenho/desempenhoCopy';

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
  assuntoOpcoes?: readonly string[];
  basePath?: string;
};

type FiltroChip = {
  key: string;
  label: string;
  href: string;
  srRemove: string;
};

function chipsFiltrosAtivos(filters: DesempenhoEstudoFilters, basePath: string): FiltroChip[] {
  const chips: FiltroChip[] = [];
  if (filters.periodo !== 'all') {
    chips.push({
      key: 'periodo',
      label: PERIODO_LABELS[filters.periodo],
      href: buildDesempenhoHref({ ...filters, periodo: 'all' }, basePath),
      srRemove: 'Remover filtro de período',
    });
  }
  if (filters.disciplina) {
    chips.push({
      key: 'disciplina',
      label: getVitrineDisciplinaMeta(filters.disciplina).shortLabel,
      href: buildDesempenhoHref({ ...filters, disciplina: null }, basePath),
      srRemove: 'Remover filtro de disciplina',
    });
  }
  if (filters.areaId) {
    chips.push({
      key: 'area',
      label: getGrandeAreaMeta(filters.areaId).label,
      href: buildDesempenhoHref(desempenhoFiltersWithArea(filters, null), basePath),
      srRemove: 'Remover filtro de área',
    });
  }
  if (filters.areaId && filters.assunto) {
    chips.push({
      key: 'assunto',
      label: filters.assunto,
      href: buildDesempenhoHref({ ...filters, assunto: null }, basePath),
      srRemove: 'Remover filtro de assunto',
    });
  }
  if (filters.banca) {
    chips.push({
      key: 'banca',
      label: filters.banca,
      href: buildDesempenhoHref({ ...filters, banca: null }, basePath),
      srRemove: 'Remover filtro de banca',
    });
  }
  return chips;
}

/**
 * Filtros do hub: fechados por padrão em qualquer viewport.
 * Botão "Filtrar N" + chips dos ativos; o painel abre por disclosure.
 *
 * Todos os controles são links (a URL aplica o filtro no RSC).
 * Assunto depende da área e não vaza para Hábitos/Simulados (rotas próprias).
 */
export function DesempenhoFiltros({
  filters,
  periodoResumo,
  assuntoOpcoes = [],
  basePath = DESEMPENHO_PATHS.resumo,
}: Props) {
  const [aberto, setAberto] = useState(false);
  const [buscaAssunto, setBuscaAssunto] = useState('');
  const painelId = useId();
  const ativos = countDesempenhoFiltrosAtivos(filters);
  const chips = chipsFiltrosAtivos(filters, basePath);
  const href = (next: DesempenhoEstudoFilters) => buildDesempenhoHref(next, basePath);

  const assuntosFiltrados = useMemo(() => {
    const q = buscaAssunto.trim().toLocaleLowerCase('pt-BR');
    if (!q) return assuntoOpcoes;
    return assuntoOpcoes.filter((titulo) => titulo.toLocaleLowerCase('pt-BR').includes(q));
  }, [assuntoOpcoes, buscaAssunto]);

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
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-medium text-foreground"
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

      {chips.length > 0 ? (
        <ul className="flex flex-wrap gap-2" aria-label="Filtros ativos">
          {chips.map((chip) => (
            <li key={chip.key}>
              <Link
                href={chip.href}
                className="inline-flex min-h-11 max-w-full items-center gap-1.5 rounded-full border border-[var(--color-brand-ring)] bg-[var(--color-brand-dim)] px-4 text-sm font-medium text-slate-900"
              >
                <span className="truncate">{chip.label}</span>
                <X className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="sr-only">{chip.srRemove}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      <div
        id={painelId}
        hidden={!aberto}
        className={cn(
          'space-y-4 rounded-xl border border-border bg-background p-3 sm:p-4',
          !aberto && 'hidden',
        )}
      >
        <FilterGroup label="Período">
          {DESEMPENHO_PERIODOS.map((periodo) => (
            <FilterChip
              key={periodo}
              href={href({ ...filters, periodo })}
              active={filters.periodo === periodo}
            >
              {PERIODO_LABELS[periodo]}
            </FilterChip>
          ))}
        </FilterGroup>

        <FilterGroup label="Disciplina">
          <FilterChip href={href({ ...filters, disciplina: null })} active={!filters.disciplina}>
            Todas
          </FilterChip>
          {VITRINE_DISCIPLINA_IDS.map((id) => (
            <FilterChip
              key={id}
              href={href({ ...filters, disciplina: id })}
              active={filters.disciplina === id}
            >
              {getVitrineDisciplinaMeta(id).shortLabel}
            </FilterChip>
          ))}
        </FilterGroup>

        <FilterGroup label="Área">
          <FilterChip
            href={href(desempenhoFiltersWithArea(filters, null))}
            active={!filters.areaId}
          >
            Todas as áreas
          </FilterChip>
          {GRANDE_AREAS.filter((area) => area.id !== 'outros').map((area) => (
            <FilterChip
              key={area.id}
              href={href(desempenhoFiltersWithArea(filters, area.id))}
              active={filters.areaId === area.id}
            >
              {area.label}
            </FilterChip>
          ))}
        </FilterGroup>

        <FilterGroup label="Assunto">
          {!filters.areaId ? (
            <p className="text-sm text-muted-foreground">{DESEMPENHO_COPY.assuntoSemArea}</p>
          ) : (
            <>
              {assuntoOpcoes.length >= DESEMPENHO_ASSUNTO_BUSCA_MIN ? (
                <input
                  type="search"
                  value={buscaAssunto}
                  onChange={(event) => setBuscaAssunto(event.target.value)}
                  placeholder={DESEMPENHO_COPY.assuntoBuscaPlaceholder}
                  aria-label={DESEMPENHO_COPY.assuntoBuscaPlaceholder}
                  className="mb-2 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground"
                />
              ) : null}
              <FilterChip href={href({ ...filters, assunto: null })} active={!filters.assunto}>
                Todos os assuntos
              </FilterChip>
              {assuntosFiltrados.map((titulo) => (
                <FilterChip
                  key={titulo}
                  href={href({ ...filters, assunto: titulo })}
                  active={filters.assunto === titulo}
                >
                  {titulo}
                </FilterChip>
              ))}
            </>
          )}
        </FilterGroup>

        {filters.banca ? (
          <FilterGroup label="Banca">
            <Link
              href={href({ ...filters, banca: null })}
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
            href={buildDesempenhoHref(DESEMPENHO_FILTROS_LIMPOS, basePath)}
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
