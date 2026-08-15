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
import { AreaHierarchy } from '@/components/dashboard/desempenho/AreaHierarchy';
import { DesempenhoFiltros } from '@/components/dashboard/desempenho/DesempenhoFiltros';
import { DesempenhoLoadError } from '@/components/dashboard/desempenho/DesempenhoLoadError';
import { DesempenhoUniversoLine } from '@/components/dashboard/desempenho/DesempenhoUniversoLine';
import { NextPracticeCard } from '@/components/dashboard/desempenho/NextPracticeCard';
import { RecentAttemptsList } from '@/components/dashboard/desempenho/RecentAttemptsList';
import { RiskRadar } from '@/components/dashboard/desempenho/RiskRadar';
import {
  desempenhoPctTone,
  formatDesempenhoConfianca,
  formatDesempenhoPct,
} from '@/components/dashboard/desempenho/formatDesempenho';
import {
  DESEMPENHO_COPY,
  formatAreasResumo,
  formatEstudoAmostra,
} from '@/components/dashboard/desempenho/desempenhoCopy';
import { cn } from '@/lib/utils';
import { DASHBOARD_PAGE_ROOT } from '@/lib/layout/mobileBottomNav';
import { summarizeAreaMap } from '@/lib/desempenho/homePicks';
import {
  buildDesempenhoHref,
  DESEMPENHO_PATHS,
} from '@/lib/desempenho/filtersHref';
import {
  DESEMPENHO_COACH_UNLOCK,
  DESEMPENHO_MIN_SAMPLE,
  type DesempenhoEstudoData,
} from '@/lib/desempenho/types';

type Props = {
  data: DesempenhoEstudoData;
};

/**
 * Aba Estudo do hub `/desempenho`.
 *
 * Ordem obrigatória: filtros → Exibindo → placar → próxima ação → 3 áreas → tipos
 * recolhidos → recentes. Mapa e histórico abrem rotas dedicadas.
 */
export function DesempenhoEstudoDashboard({ data }: Props) {
  const {
    placar,
    areas,
    riskBands,
    nextPractice,
    recentAttempts,
    filtersApplied,
    periodoResumo,
    attemptSeries,
    loadState,
    universoRespondidas,
    assuntoOpcoes,
    leituraTruncada,
  } = data;

  const rootClass = cn('mx-auto max-w-4xl space-y-8 px-4 py-6 md:px-8', DASHBOARD_PAGE_ROOT);

  if (loadState === 'error') {
    return <DesempenhoLoadError hub="estudo" />;
  }

  const semAtividade = placar.respondidas === 0;
  const areasResumo = summarizeAreaMap(areas);
  const mapaHref = buildDesempenhoHref(filtersApplied, DESEMPENHO_PATHS.mapa);
  const historicoHref = buildDesempenhoHref(filtersApplied, DESEMPENHO_PATHS.historico);

  return (
    <div className={rootClass} data-desempenho-hub="estudo">
      <DesempenhoFiltros
        filters={filtersApplied}
        periodoResumo={periodoResumo}
        assuntoOpcoes={assuntoOpcoes}
      />

      <DesempenhoUniversoLine
        exibidas={placar.respondidas}
        universo={universoRespondidas}
        leituraTruncada={leituraTruncada}
      />

      <section aria-label="Placar de estudo" className="space-y-2">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <ScoreCard
            label={DESEMPENHO_COPY.estudoRespondidasLabel}
            value={placar.respondidas}
            icon={BookOpen}
            variant="neutral"
          />
          <ScoreCard label="Acertos" value={placar.acertos} icon={CheckCircle2} variant="success" />
          <ScoreCard label="Erros" value={placar.erros} icon={XCircle} variant="danger" />
          <ScoreCard
            label="% acerto"
            value={formatDesempenhoPct(placar.percentual)}
            icon={Target}
            variant={desempenhoPctTone(
              placar.percentual,
              placar.respondidas >= DESEMPENHO_MIN_SAMPLE,
            )}
          />
          <ScoreCard
            label={DESEMPENHO_COPY.estudoMetaLabel}
            value={`${placar.metaDoDia.respondidasHoje}/${placar.metaDoDia.meta}`}
            icon={Map}
            variant={
              placar.metaDoDia.respondidasHoje >= placar.metaDoDia.meta ? 'success' : 'warning'
            }
          />
        </div>
        <p className="text-xs text-muted-foreground">{DESEMPENHO_COPY.estudoUniversoHint}</p>
        <p className="text-xs text-muted-foreground">
          {placar.respondidas > 0 ? (
            formatEstudoAmostra(
              placar.acertos,
              placar.respondidas,
              formatDesempenhoConfianca(placar.confidenceId),
            )
          ) : (
            DESEMPENHO_COPY.estudoPlacarEmpty
          )}
        </p>
      </section>

      {semAtividade ? (
        <div className="metric-card">
          <EmptyState
            icon={BookOpen}
            title="Nenhuma questão neste período"
            description="Ajuste os filtros ou pratique na vitrine — o mapa por assunto aparece conforme você responde."
            action={{ label: 'Ir para a vitrine', href: '/estudar' }}
          />
        </div>
      ) : !placar.coachUnlocked ? (
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
          <NextPracticeCard foci={nextPractice} />

          <section aria-labelledby="mapa-dominio-title" className="space-y-3">
            <div>
              <h2 id="mapa-dominio-title" className="text-base font-semibold text-slate-900">
                Panorama por áreas
              </h2>
              <p className="text-xs text-muted-foreground">
                {formatAreasResumo(areasResumo.total, areasResumo.comDiagnostico)}
              </p>
            </div>
            <AreaHierarchy areas={areas} variant="resumo" mapaHref={mapaHref} />
          </section>

          <section aria-labelledby="panorama-conteudo-title" className="space-y-3">
            <div>
              <h2 id="panorama-conteudo-title" className="text-base font-semibold text-slate-900">
                Panorama por tipo de conteúdo
              </h2>
              <p className="text-xs text-muted-foreground">
                Agrupamento por natureza do conteúdo — sem estimativa de frequência em prova.
              </p>
            </div>
            <RiskRadar riskBands={riskBands} />
          </section>
        </>
      )}

      <AttemptEvolutionCard series={attemptSeries} placarZerado={semAtividade} />

      <RecentAttemptsList
        attempts={recentAttempts}
        variant="home"
        historicoHref={historicoHref}
      />
    </div>
  );
}
