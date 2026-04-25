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
  LayoutGrid,
  Shield,
  Target,
  Trophy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ContributionHeatmap } from './contribution-heatmap';
import { TopAssuntosRanking } from './top-assuntos-ranking';
import type { DesempenhoData, Periodo } from './types';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';
import { ZerarDesempenhoDialog } from './zerar-desempenho-dialog';

export default function MeuDesempenhoDashboard({ dados }: { dados: DesempenhoData }) {
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
    <div className="dashboard-surface relative min-h-screen bg-background pb-24 pb-safe text-foreground">
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
        <header className="bg-transparent">
          <div className="mx-auto max-w-3xl px-4 py-6 md:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
              <div className="min-w-0">
                <p className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-sm ring-1 ring-slate-900/10 dark:bg-white dark:text-slate-900 dark:ring-white/20">
                  Meu desempenho
                </p>
                <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                  Acompanhe seu progresso
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Metas, sequência e assuntos nos últimos 30 dias.
                </p>
              </div>
              <Button
                asChild
                className="h-11 shrink-0 gap-2 rounded-xl px-4 font-semibold sm:self-center"
              >
                <Link href="/estudar" className="inline-flex items-center">
                  <LayoutGrid className="h-4 w-4" aria-hidden />
                  Ir à vitrine
                  <ChevronRight className="h-4 w-4 opacity-80" aria-hidden />
                </Link>
              </Button>
            </div>
          </div>
        </header>
      </div>

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 md:px-8 md:pt-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
          >
            <Card
              className={
                metaConcluida
                  ? 'border-emerald-200 bg-emerald-50/80 dark:border-emerald-900 dark:bg-emerald-950/30'
                  : 'border-border'
              }
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={
                        metaConcluida
                          ? 'flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/50'
                          : 'flex h-8 w-8 items-center justify-center rounded-lg bg-muted'
                      }
                    >
                      <Target
                        className={`h-4 w-4 ${metaConcluida ? 'text-emerald-700 dark:text-emerald-400' : 'text-primary'}`}
                        aria-hidden
                      />
                    </div>
                    <CardTitle className="text-base font-semibold">Meta do dia</CardTitle>
                  </div>
                  {metaConcluida && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
                      Concluída
                    </span>
                  )}
                </div>
                <CardDescription>
                  {metaConcluida
                    ? 'Parabéns — você bateu a meta de hoje.'
                    : `${Math.max(0, metaDiaria - hoje)} questões para bater a meta.`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-4xl font-semibold tabular-nums tracking-tight ${metaConcluida ? 'text-emerald-700 dark:text-emerald-400' : 'text-foreground'}`}
                  >
                    {hoje}
                  </span>
                  <span className="text-muted-foreground">/{metaDiaria}</span>
                </div>
                <Progress
                  value={hoje}
                  max={metaDiaria}
                  className={metaConcluida ? 'bg-emerald-100 dark:bg-emerald-950' : 'bg-muted'}
                  indicatorClassName={metaConcluida ? 'bg-emerald-600 dark:bg-emerald-500' : undefined}
                />
              </CardContent>
            </Card>
          </motion.div>

          <div className="flex flex-col gap-4">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, delay: 0.04 }}
            >
              <Card>
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-amber-100 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/40">
                    <Flame className="h-6 w-6 text-amber-500" aria-hidden />
                  </div>
                  <div>
                    <p className="text-3xl font-semibold tabular-nums tracking-tight">{streak}</p>
                    <p className="text-xs font-medium text-muted-foreground">
                      {streak === 1 ? 'dia seguido' : 'dias seguidos'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, delay: 0.08 }}
            >
              <Card>
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-violet-100 bg-violet-50 dark:border-violet-900/50 dark:bg-violet-950/40">
                    <Trophy className="h-6 w-6 text-violet-600" aria-hidden />
                  </div>
                  <div>
                    <p className="text-3xl font-semibold tabular-nums tracking-tight">{totalGeral}</p>
                    <p className="text-xs font-medium text-muted-foreground">questões (30 dias)</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, delay: 0.1 }}
        >
          <Card className="overflow-hidden border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Total estudado</CardTitle>
              <CardDescription>Desde o início na plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-semibold tabular-nums tracking-tight text-foreground">{totalTodosTempos}</p>
              <p className="mt-1 text-xs text-muted-foreground">Questões com estudo reverso concluído</p>
            </CardContent>
          </Card>
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
            <Card className="border-primary/25 bg-primary/5 dark:border-primary/30 dark:bg-primary/10">
              <CardContent className="space-y-4 p-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 dark:bg-primary/20">
                  <BookOpen className="h-7 w-7 text-primary" aria-hidden />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Comece a estudar para ver seu progresso</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Conclua o estudo reverso de uma questão e o painel atualiza automaticamente. Use o botão{' '}
                    <span className="font-medium text-foreground">Ir à vitrine</span> no topo da página.
                  </p>
                </div>
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
