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
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 pb-8 md:px-8 md:pt-8">
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
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-slate-600">
          <span className="inline-flex items-center gap-1.5 font-medium text-slate-800">
            <Flame className="h-3.5 w-3.5 text-[var(--color-warning-text)]" aria-hidden />
            <span>
              {streak} {streakLabel}
            </span>
          </span>
          <span className="text-slate-300" aria-hidden>
            ·
          </span>
          <span>
            Meta do dia {hoje}/{metaDiaria}
            <span className="sr-only"> (também no placar da aba Estudo)</span>
          </span>
          <span className="text-slate-300" aria-hidden>
            ·
          </span>
          <span>{totalTodosTempos} no histórico</span>
        </div>
      </section>

      <section aria-labelledby="atividade-heatmap-title" className="metric-card p-5 pt-6">
        <h2 id="atividade-heatmap-title" className="sr-only">
          Heatmap de atividade
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
            title="Nenhuma atividade ainda"
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
                  Remover todo o histórico de questões. Ação irreversível.
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
              Zerar histórico
            </Button>
          </div>
        </footer>
      ) : null}
    </div>
  );
}
