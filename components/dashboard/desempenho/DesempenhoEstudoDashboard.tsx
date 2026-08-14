import Link from 'next/link';
import {
  AlertTriangle,
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
import { NextPracticeCard } from '@/components/dashboard/desempenho/NextPracticeCard';
import { RecentAttemptsList } from '@/components/dashboard/desempenho/RecentAttemptsList';
import { RiskRadar } from '@/components/dashboard/desempenho/RiskRadar';
import {
  formatDesempenhoConfianca,
  formatDesempenhoPct,
} from '@/components/dashboard/desempenho/formatDesempenho';
import { cn } from '@/lib/utils';
import { DASHBOARD_PAGE_ROOT } from '@/lib/layout/mobileBottomNav';
import { DESEMPENHO_COACH_UNLOCK, type DesempenhoEstudoData } from '@/lib/desempenho/types';

type Props = {
  data: DesempenhoEstudoData;
};

/**
 * Aba Estudo do hub `/desempenho`.
 *
 * Ordem obrigatória: filtros → resumo do período → próxima ação → hierarquia
 * área/assunto → evolução → questões recentes. O aluno decide antes de
 * percorrer a taxonomia inteira.
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
  } = data;

  const rootClass = cn('mx-auto max-w-4xl space-y-8 px-4 py-6 md:px-8', DASHBOARD_PAGE_ROOT);

  // Erro de leitura nunca é exibido como desempenho zerado.
  if (loadState === 'error') {
    return (
      <div className={rootClass} data-desempenho-hub="estudo">
        <section
          aria-label="Erro ao carregar desempenho"
          role="alert"
          className="metric-card flex flex-col gap-3 p-5"
        >
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <AlertTriangle className="h-4 w-4 text-[var(--color-danger-text)]" aria-hidden />
            Não conseguimos carregar seu desempenho
          </p>
          <p className="text-sm text-muted-foreground">
            Os números não foram lidos agora — isto não significa que você tenha zero acertos.
            Tente novamente em instantes.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/desempenho"
              className="btn-editorial-primary inline-flex min-h-11 items-center justify-center rounded-lg px-4 text-sm font-semibold"
            >
              Tentar novamente
            </Link>
            <Link
              href="/estudar"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium text-foreground"
            >
              Ir para a vitrine
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const semAtividade = placar.respondidas === 0;

  return (
    <div className={rootClass} data-desempenho-hub="estudo">
      <DesempenhoFiltros filters={filtersApplied} periodoResumo={periodoResumo} />

      <section aria-label="Placar de estudo" className="space-y-2">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <ScoreCard
            label="Respondidas"
            value={placar.respondidas}
            icon={BookOpen}
            variant="brand"
          />
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
            variant={
              placar.metaDoDia.respondidasHoje >= placar.metaDoDia.meta ? 'success' : 'warning'
            }
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {placar.respondidas > 0 ? (
            <>
              Amostra: {placar.acertos}/{placar.respondidas} questões ·{' '}
              {formatDesempenhoConfianca(placar.confidenceId)}
            </>
          ) : (
            'Sem questões respondidas neste recorte.'
          )}
        </p>
      </section>

      {semAtividade ? (
        <div className="metric-card">
          <EmptyState
            icon={BookOpen}
            title="Nenhuma questão neste recorte"
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
                Cada área mostra acerto com a fração e a confiança da amostra. Abra para ver os
                assuntos.
              </p>
            </div>
            <AreaHierarchy areas={areas} />
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

      <AttemptEvolutionCard series={attemptSeries} />

      <RecentAttemptsList attempts={recentAttempts} />
    </div>
  );
}
