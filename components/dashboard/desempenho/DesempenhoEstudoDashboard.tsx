import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  CheckCircle2,
  Map,
  Target,
  XCircle,
} from 'lucide-react';
import { ScoreCard } from '@/components/ui/score-card';
import { EmptyState } from '@/components/ui/empty-state';
import { AttemptEvolutionCard } from '@/components/dashboard/desempenho/AttemptEvolutionCard';
import { DomainMapTable } from '@/components/dashboard/desempenho/DomainMapTable';
import { RiskRadar } from '@/components/dashboard/desempenho/RiskRadar';
import { NextPracticeCard } from '@/components/dashboard/desempenho/NextPracticeCard';
import { RecentAttemptsList } from '@/components/dashboard/desempenho/RecentAttemptsList';
import { formatDesempenhoPct } from '@/components/dashboard/desempenho/formatDesempenho';
import { cn } from '@/lib/utils';
import { DASHBOARD_PAGE_ROOT } from '@/lib/layout/mobileBottomNav';
import { DESEMPENHO_PERIODOS } from '@/lib/desempenho/studyPerformance';
import { DESEMPENHO_COACH_UNLOCK, type DesempenhoEstudoData } from '@/lib/desempenho/types';
import { GRANDE_AREAS } from '@/lib/desempenho/taxonomiaEnfermagem';
import { VITRINE_DISCIPLINA_IDS, getVitrineDisciplinaMeta } from '@/lib/vitrine/disciplina';

const PERIODO_LABELS: Record<(typeof DESEMPENHO_PERIODOS)[number], string> = {
  '7d': '7 dias',
  '30d': '30 dias',
  '90d': '90 dias',
  '12m': '12 meses',
  all: 'Tudo',
};

function buildDesempenhoHref(filters: DesempenhoEstudoData['filtersApplied']): string {
  const params = new URLSearchParams();
  if (filters.periodo !== 'all') params.set('periodo', filters.periodo);
  if (filters.banca) params.set('banca', filters.banca);
  if (filters.areaId) params.set('area', filters.areaId);
  if (filters.disciplina) params.set('disciplina', filters.disciplina);
  const qs = params.toString();
  return qs ? `/desempenho?${qs}` : '/desempenho';
}

type Props = {
  data: DesempenhoEstudoData;
};

/**
 * Aba Estudo do hub `/desempenho` — placar, mapa, radar, próximos focos e recentes.
 * Filtros vêm do RSC via searchParams (já aplicados em `data.filtersApplied`).
 */
export function DesempenhoEstudoDashboard({ data }: Props) {
  const {
    placar,
    areas,
    riskBands,
    nextPractice,
    recentAttempts,
    filtersApplied,
    attemptSeries,
  } = data;
  const filters = filtersApplied;

  const periodoLinks = DESEMPENHO_PERIODOS.map((periodo) => ({
    periodo,
    href: buildDesempenhoHref({ ...filters, periodo }),
    active: filters.periodo === periodo,
  }));

  const disciplinaLinks = [
    {
      id: null as null,
      label: 'Todas',
      href: buildDesempenhoHref({ ...filters, disciplina: null }),
      active: !filters.disciplina,
    },
    ...VITRINE_DISCIPLINA_IDS.map((id) => ({
      id,
      label: getVitrineDisciplinaMeta(id).shortLabel,
      href: buildDesempenhoHref({ ...filters, disciplina: id }),
      active: filters.disciplina === id,
    })),
  ];

  const areaLinks = [
    {
      id: null as null,
      label: 'Todas as áreas',
      href: buildDesempenhoHref({ ...filters, areaId: null }),
      active: !filters.areaId,
    },
    ...GRANDE_AREAS.filter((a) => a.id !== 'outros').map((a) => ({
      id: a.id,
      label: a.label,
      href: buildDesempenhoHref({ ...filters, areaId: a.id }),
      active: filters.areaId === a.id,
    })),
  ];

  return (
    <div className={cn('mx-auto max-w-4xl space-y-8 px-4 py-6 md:px-8', DASHBOARD_PAGE_ROOT)}>
      <section aria-label="Filtros de atividade" className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Período = atividade na última prática (não média de tentativas).
        </p>
        <div className="flex flex-wrap gap-2">
          {periodoLinks.map((item) => (
            <FilterChip key={item.periodo} href={item.href} active={item.active}>
              {PERIODO_LABELS[item.periodo]}
            </FilterChip>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {disciplinaLinks.map((item) => (
            <FilterChip key={item.id ?? 'all'} href={item.href} active={item.active}>
              {item.label}
            </FilterChip>
          ))}
        </div>
        <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
          {areaLinks.map((item) => (
            <FilterChip
              key={item.id ?? 'all-areas'}
              href={item.href}
              active={item.active}
              className="shrink-0"
            >
              {item.label}
            </FilterChip>
          ))}
        </div>
        {filters.banca ? (
          <p className="text-xs text-muted-foreground">
            Banca: <span className="font-medium text-foreground">{filters.banca}</span>
            {' · '}
            <Link href={buildDesempenhoHref({ ...filters, banca: null })} className="underline">
              limpar
            </Link>
          </p>
        ) : null}
      </section>

      <section aria-label="Placar de estudo" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <ScoreCard label="Respondidas" value={placar.respondidas} icon={BookOpen} variant="brand" />
        <ScoreCard label="Acertos" value={placar.acertos} icon={CheckCircle2} variant="success" />
        <ScoreCard label="Erros" value={placar.erros} icon={XCircle} variant="danger" />
        <ScoreCard
          label="% acerto"
          value={formatDesempenhoPct(placar.percentual)}
          icon={Target}
          variant="brand"
        />
        <ScoreCard
          label="Meta do dia"
          value={`${placar.metaDoDia.respondidasHoje}/${placar.metaDoDia.meta}`}
          icon={Map}
          variant={placar.metaDoDia.respondidasHoje >= placar.metaDoDia.meta ? 'success' : 'warning'}
        />
      </section>

      <AttemptEvolutionCard series={attemptSeries} />

      {!placar.coachUnlocked ? (
        <div className="metric-card">
          <EmptyState
            icon={Map}
            title={`Responda ${DESEMPENHO_COACH_UNLOCK} questões para liberar seu mapa`}
            description="Com poucas respostas ainda não dá para ranquear assuntos com segurança. Continue praticando na vitrine."
            action={{ label: 'Ir para a vitrine', href: '/estudar' }}
          />
        </div>
      ) : (
        <>
          <section aria-labelledby="mapa-dominio-title" className="space-y-3">
            <div>
              <h2 id="mapa-dominio-title" className="text-base font-semibold text-slate-900">
                Mapa por assunto
              </h2>
              <p className="text-xs text-muted-foreground">
                Árvore área → assunto, ordenada pelo pior % (amostra ≥ 5). Abaixo disso mostramos só a
                contagem.
              </p>
            </div>
            <DomainMapTable areas={areas} />
          </section>

          <section aria-labelledby="radar-risco-title" className="space-y-3">
            <div>
              <h2 id="radar-risco-title" className="text-base font-semibold text-slate-900">
                Radar de prova
              </h2>
              <p className="text-xs text-muted-foreground">Faixas de incidência típicas para TE.</p>
            </div>
            <RiskRadar riskBands={riskBands} />
          </section>

          <NextPracticeCard foci={nextPractice} />
        </>
      )}

      <RecentAttemptsList attempts={recentAttempts} />
    </div>
  );
}

function FilterChip({
  href,
  active,
  children,
  className,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
        active
          ? 'border-[var(--color-brand)] bg-[var(--color-brand-dim)] text-slate-900'
          : 'border-border bg-background text-muted-foreground hover:text-foreground',
        className,
      )}
    >
      {children}
    </Link>
  );
}
