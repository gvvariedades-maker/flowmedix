'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  Flame,
  Shield,
  Target,
  Trophy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScoreCard } from '@/components/ui/score-card';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { ContributionHeatmap } from './contribution-heatmap';
import { TopAssuntosRanking } from './top-assuntos-ranking';
import type { DesempenhoData, Periodo } from './types';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';
import { ZerarDesempenhoDialog } from './zerar-desempenho-dialog';
import { DASHBOARD_PAGE_ROOT } from '@/lib/layout/mobileBottomNav';
import { useDashboardBottomInset } from '@/lib/layout/useDashboardBottomInset';
import { cn } from '@/lib/utils';

export function ProgressoEstudoDashboard({ dados }: { dados: DesempenhoData }) {
  const { pageBottomPadding } = useDashboardBottomInset('default');
  const router = useRouter();
  const [periodo, setPeriodo] = useState<Periodo>(30);
  const [dialogZerar, setDialogZerar] = useState(false);
  const [zerando, setZerando] = useState(false);
  const [erroZerar, setErroZerar] = useState<string | null>(null);

  const {
    hoje,
    metaDiaria,
    streak,
    totalGeral,
    totalTodosTempos,
    serie30dias,
    topAssuntos,
  } = dados;

  const metaConcluida = hoje >= metaDiaria;

  const totalPeriodo = useMemo(
    () => serie30dias.slice(-periodo).reduce((s, d) => s + d.count, 0),
    [serie30dias, periodo],
  );

  const semDados = totalGeral === 0;
  const podeZerarHistorico = totalTodosTempos > 0;

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
      className={cn(
        'dashboard-surface relative bg-background text-foreground',
        DASHBOARD_PAGE_ROOT,
        pageBottomPadding,
      )}
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

      <div className="sticky top-0 z-20 border-b border-border/70 bg-background/95 shadow-[0_4px_24px_-12px_rgba(15,23,42,0.1)] backdrop-blur-md supports-[backdrop-filter]:bg-background/90">
        <div className="mx-auto max-w-3xl px-4 py-5 md:px-8">
          <PageHeader
            title="Progresso de estudo"
            breadcrumb={[
              { label: 'Área do aluno', href: '/estudar' },
              { label: 'Progresso de estudo' },
            ]}
            description="Metas, sequência e assuntos estudados nos últimos 30 dias."
            action={
              <Button asChild variant="outline" className="h-11 shrink-0 gap-2 rounded-xl px-4 font-semibold">
                <Link href="/desempenho/simulados" className="inline-flex items-center">
                  <Trophy className="h-4 w-4" aria-hidden />
                  Meu desempenho
                  <ChevronRight className="h-4 w-4 opacity-80" aria-hidden />
                </Link>
              </Button>
            }
          />
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 md:px-8 md:pt-8">
        {/* Score Cards — grid 2×2 no mobile, 4 colunas no desktop */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="grid grid-cols-2 gap-3 md:grid-cols-4"
        >
          <ScoreCard
            label="Meta do dia"
            value={`${hoje}/${metaDiaria}`}
            delta={metaConcluida ? 'Meta batida!' : `Faltam ${Math.max(0, metaDiaria - hoje)}`}
            deltaPositive={metaConcluida}
            icon={Target}
            variant={metaConcluida ? 'success' : 'brand'}
          />
          <ScoreCard
            label={streak === 1 ? 'Dia seguido' : 'Dias seguidos'}
            value={streak}
            icon={Flame}
            variant="warning"
          />
          <ScoreCard
            label="Questões (30 dias)"
            value={totalGeral}
            icon={Trophy}
            variant="brand"
          />
          <ScoreCard
            label="Total histórico"
            value={totalTodosTempos}
            delta="desde o início"
            deltaPositive
            icon={BookOpen}
            variant="success"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, delay: 0.12 }}
        >
          <Card>
            <CardContent className="p-5 pt-6">
              <ContributionHeatmap
                serie={serie30dias}
                periodo={periodo}
                onPeriodoChange={setPeriodo}
                totalPeriodo={totalPeriodo}
                semDados={semDados}
              />
            </CardContent>
          </Card>
        </motion.div>

        {topAssuntos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, delay: 0.14 }}
          >
            <Card>
              <CardContent className="p-5 pt-6">
                <TopAssuntosRanking assuntos={topAssuntos} />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {semDados ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, delay: 0.16 }}
          >
            <Card>
              <CardContent className="p-0">
                <EmptyState
                  icon={BookOpen}
                  title="Nenhuma atividade ainda"
                  description="Responda sua primeira questão para ver seu progresso aqui. Use “Voltar para a Vitrine” no topo da página."
                />
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="flex justify-center pb-2">
            <Button variant="outline" asChild className="rounded-xl border-border transition-colors duration-150">
              <Link href="/plano-diario" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <CalendarDays className="h-4 w-4" aria-hidden />
                Ver plano de estudo diário
              </Link>
            </Button>
          </div>
        )}

        {podeZerarHistorico && (
          <footer className="border-t border-border pt-8">
            <div className="flex flex-col gap-3 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
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
        )}
      </div>
    </div>
  );
}
