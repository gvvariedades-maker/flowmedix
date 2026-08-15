'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Flame, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ContributionHeatmap } from '@/components/dashboard/performance/contribution-heatmap';
import { TopAssuntosRanking } from '@/components/dashboard/performance/top-assuntos-ranking';
import { ZerarDesempenhoDialog } from '@/components/dashboard/performance/zerar-desempenho-dialog';
import type { DesempenhoData, Periodo } from '@/components/dashboard/performance/types';
import {
  DESEMPENHO_COPY,
  formatAtividadeHistorico,
  formatAtividadeMeta,
} from '@/components/dashboard/desempenho/desempenhoCopy';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';
import { cn } from '@/lib/utils';

type Props = {
  dados: DesempenhoData;
};

/**
 * Aba Atividade do hub `/desempenho`.
 * Heatmap, streak e zerar histórico — rebaixados (hábitos/privacidade), não placar hero.
 * O analítico de acerto/cobertura fica na aba Estudo.
 */
export function DesempenhoAtividadeDashboard({ dados }: Props) {
  const router = useRouter();
  const [periodo, setPeriodo] = useState<Periodo>(30);
  const [dialogZerar, setDialogZerar] = useState(false);
  const [zerando, setZerando] = useState(false);
  const [erroZerar, setErroZerar] = useState<string | null>(null);

  const { hoje, metaDiaria, streak, totalGeral, totalTodosTempos, serie30dias, topAssuntos } = dados;

  const totalPeriodo = useMemo(
    () => serie30dias.slice(-periodo).reduce((s, d) => s + d.count, 0),
    [serie30dias, periodo],
  );

  const semDados = totalGeral === 0;
  const podeZerarHistorico = totalTodosTempos > 0;
  const streakLabel = streak === 1 ? 'dia seguido' : 'dias seguidos';

  async function confirmarZerarDesempenho() {
    setErroZerar(null);
    setZerando(true);
    try {
      const res = await fetchWithAuth('/api/zerar-desempenho', { method: 'POST' });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErroZerar(typeof body.error === 'string' ? body.error : 'Erro ao zerar. Tente de novo.');
        return;
      }
      setDialogZerar(false);
      router.refresh();
    } finally {
      setZerando(false);
    }
  }

  return (
    <div
      className="mx-auto max-w-3xl space-y-6 px-4 py-6 pb-8 md:px-8 md:pt-8"
      data-desempenho-hub="atividade"
    >
      <ZerarDesempenhoDialog
        open={dialogZerar}
        zerando={zerando}
        erro={erroZerar}
        onClose={() => {
          setDialogZerar(false);
          setErroZerar(null);
        }}
        onConfirm={confirmarZerarDesempenho}
      />

      <section aria-label="Resumo de hábito" className="space-y-2">
        <p className="text-xs text-muted-foreground">
          Hábitos e sequência — métricas secundárias. Acerto, cobertura e focos ficam na{' '}
          <Link href="/desempenho" className="font-medium text-foreground underline-offset-2 hover:underline">
            aba Estudo
          </Link>
          .
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div className="flex min-h-11 items-center gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2">
            <Flame className="h-3.5 w-3.5 shrink-0 text-[var(--color-warning-text)]" aria-hidden />
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                Sequência
              </p>
              <p className="text-sm font-medium text-slate-800">
                {streak} {streakLabel}
              </p>
            </div>
          </div>
          <div
            className="flex min-h-11 items-center rounded-lg border border-border bg-muted/20 px-3 py-2"
            aria-label={formatAtividadeMeta(hoje, metaDiaria)}
          >
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                {DESEMPENHO_COPY.atividadeMetaLabel}
              </p>
              <p className="text-sm font-medium text-slate-800">
                {hoje}/{metaDiaria}
                <span className="sr-only"> (estudo reverso concluído hoje)</span>
              </p>
            </div>
          </div>
          <div className="flex min-h-11 items-center rounded-lg border border-border bg-muted/20 px-3 py-2">
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                Histórico
              </p>
              <p className="text-sm font-medium text-slate-800">
                {formatAtividadeHistorico(totalTodosTempos)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="atividade-heatmap-title" className="metric-card p-5 pt-6">
        <h2 id="atividade-heatmap-title" className="sr-only">
          Heatmap de hábitos
        </h2>
        <ContributionHeatmap
          serie={serie30dias}
          periodo={periodo}
          onPeriodoChange={setPeriodo}
          totalPeriodo={totalPeriodo}
          semDados={semDados}
        />
      </section>

      {topAssuntos.length > 0 ? (
        <section aria-label="Assuntos mais estudados" className="metric-card p-5 pt-6">
          <TopAssuntosRanking assuntos={topAssuntos} />
        </section>
      ) : null}

      {semDados ? (
        <div className="metric-card">
          <EmptyState
            icon={BookOpen}
            title="Nenhum hábito ainda"
            description="Responda questões na vitrine para ver sequência e heatmap aqui."
            action={{ label: 'Ir para a vitrine', href: '/estudar' }}
          />
        </div>
      ) : null}

      {podeZerarHistorico ? (
        <footer className="border-t border-border pt-6">
          <div
            className={cn(
              'flex flex-col gap-3 rounded-lg border border-dashed border-border bg-muted/20 px-4 py-4',
              'sm:flex-row sm:items-center sm:justify-between',
            )}
          >
            <div className="flex gap-3">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              <div>
                <p className="text-xs font-medium text-foreground">Privacidade e dados</p>
                <p className="text-xs text-muted-foreground">
                  Remove o histórico de questões da área Estudo. Simulados permanecem. Ação
                  irreversível.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setDialogZerar(true)}
            >
              Zerar desempenho de estudo
            </Button>
          </div>
        </footer>
      ) : null}
    </div>
  );
}
