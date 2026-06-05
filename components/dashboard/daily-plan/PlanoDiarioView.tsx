'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen,
  CalendarDays,
  Clock,
  Flame,
  Lock,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardMobilePage } from '@/components/layout/DashboardMobilePage';
import { DASHBOARD_PAGE_CENTER, DASHBOARD_PAGE_ROOT } from '@/lib/layout/mobileBottomNav';
import { phraseQuestoesAgendadas } from '@/lib/labelQuestoes';
import { cn } from '@/lib/utils';
import { PlanoDiarioTopicCard } from './PlanoDiarioTopicCard';
import type { PlanoDiarioProps } from './types';

function PlanoDiarioEmpty() {
  return (
    <DashboardMobilePage
      variant="default"
      className={cn('bg-[#010409] px-4 pt-6', DASHBOARD_PAGE_CENTER)}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className="w-full max-w-md space-y-8 text-center"
      >
        <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-3xl border border-emerald-500/30 bg-[#0d1117] shadow-lg shadow-black/40">
          <Trophy className="h-14 w-14 text-emerald-500" aria-hidden />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">Plano de estudo diário</p>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Você está em dia</h1>
          <p className="text-sm leading-relaxed text-slate-400">
            Nenhuma questão pendente de revisão hoje. Estude novas questões na vitrine; o algoritmo de revisão
            espaçada agendará retornos conforme seu desempenho.
          </p>
        </div>
        <Button
          asChild
          className="w-full rounded-2xl bg-[#00f2ff]/15 font-semibold text-[#00f2ff] hover:bg-[#00f2ff]/25"
        >
          <Link href="/estudar" className="inline-flex items-center justify-center gap-2">
            <BookOpen className="h-4 w-4" aria-hidden />
            Ir para a Vitrine
          </Link>
        </Button>
      </motion.div>
    </DashboardMobilePage>
  );
}

function PlanoDiarioInfoAlgoritmo() {
  return (
    <div className="flex gap-4 rounded-2xl border border-[rgba(251,191,36,0.20)] bg-[rgba(251,191,36,0.08)] p-5 shadow-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[rgba(251,191,36,0.28)] bg-[rgba(251,191,36,0.12)] text-amber-200 shadow-sm">
        <Lock className="h-4 w-4" aria-hidden />
      </div>
      <div className="min-w-0 space-y-1 text-left">
        <p className="text-sm font-semibold text-amber-200">Revisões personalizadas</p>
        <p className="text-xs leading-relaxed text-amber-200/85">
          As questões abaixo foram selecionadas por revisão espaçada, com base no seu histórico. Siga a ordem
          sugerida para melhor fixação na memória.
        </p>
      </div>
    </div>
  );
}

function PlanoDiarioSimuladoCta() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cyan-500/25 bg-cyan-500/10 p-4">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-cyan-200">Meta do dia: 1 simulado de 10 questões</p>
        <p className="text-xs text-cyan-100/80">
          Use modo treino para reforço rápido ou modo prova para simular concurso real.
        </p>
      </div>
      <Button
        asChild
        className="rounded-xl border border-cyan-500/40 bg-cyan-500/15 text-cyan-200 hover:bg-cyan-500/25"
      >
        <Link href="/simulados">Abrir Simulados</Link>
      </Button>
    </div>
  );
}

export default function PlanoDiarioView({ revisoes, totalPendentes, limite }: PlanoDiarioProps) {
  const hoje = new Date();
  const dataFormatada = hoje.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  if (revisoes.length === 0) {
    return <PlanoDiarioEmpty />;
  }

  return (
    <PlanoDiarioConteúdo
      dataFormatada={dataFormatada}
      limite={limite}
      revisoes={revisoes}
      totalPendentes={totalPendentes}
    />
  );
}

function PlanoDiarioConteúdo({
  dataFormatada,
  revisoes,
  totalPendentes,
  limite,
}: {
  dataFormatada: string;
  revisoes: PlanoDiarioProps['revisoes'];
  totalPendentes: number;
  limite: number;
}) {
  return (
    <DashboardMobilePage variant="default" className={cn(DASHBOARD_PAGE_ROOT, 'bg-[#010409]')}>
      <header className="border-b border-[rgba(255,255,255,0.08)] bg-[#010409] shadow-sm shadow-black/30">
        <div className="mx-auto max-w-3xl px-4 py-8 md:px-10">
          <div className="flex flex-col items-center text-center sm:block sm:text-left">
            <p className="text-xs font-black uppercase tracking-widest text-cyan-400">
              Plano de estudo diário
            </p>
            <div className="mt-3 flex items-center justify-center gap-2 sm:justify-start">
              <Zap className="h-6 w-6 shrink-0 text-cyan-400 drop-shadow-sm sm:h-7 sm:w-7" aria-hidden />
              <h1 className="text-balance text-4xl font-black capitalize leading-tight tracking-tight text-white">
                {dataFormatada}
              </h1>
            </div>
            <p className="mt-2 text-sm text-slate-400">
              {phraseQuestoesAgendadas(revisoes.length)} para hoje
              {totalPendentes > limite && (
                <span className="ml-1 font-medium text-rose-500">
                  (de {totalPendentes} pendentes — priorizando as mais urgentes)
                </span>
              )}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
            <div className="flex items-center gap-2 rounded-2xl border border-[rgba(0,242,255,0.20)] bg-[rgba(0,242,255,0.08)] px-4 py-2.5 shadow-sm">
              <CalendarDays className="h-4 w-4 text-cyan-300" aria-hidden />
              <span className="text-sm font-bold tabular-nums text-cyan-300">
                {revisoes.length}/{limite} hoje
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-[rgba(0,242,255,0.20)] bg-[rgba(0,242,255,0.08)] px-4 py-2.5 shadow-sm">
              <Clock className="h-4 w-4 text-cyan-300" aria-hidden />
              <span className="text-sm font-bold tabular-nums text-cyan-300">~{revisoes.length * 3} min</span>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <Sparkles className="h-4 w-4 text-slate-500" aria-hidden />
              <span className="text-xs font-medium text-slate-500">Foco e consistência</span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-8 px-4 py-10 md:px-10">
        <PlanoDiarioInfoAlgoritmo />
        <PlanoDiarioSimuladoCta />

        <ul className="space-y-8">
          {revisoes.map((item, index) => (
            <PlanoDiarioTopicCard
              key={`${item.modulo_slug}-${String(item.avant_codigo ?? '')}-${index}`}
              item={item}
              index={index}
            />
          ))}
        </ul>

        {totalPendentes > limite && (
          <div
            className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-5 shadow-sm"
            role="status"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-200/80 bg-white text-rose-600">
              <Flame className="h-4 w-4" aria-hidden />
            </div>
            <p className="text-sm font-medium leading-relaxed text-rose-950">
              <span className="font-bold">{totalPendentes - limite} questões</span> ainda aguardam revisão. Elas
              entrarão no plano nos próximos dias conforme você conclui as de hoje.
            </p>
          </div>
        )}

        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            asChild
            className="rounded-2xl border-[rgba(255,255,255,0.15)] bg-transparent px-6 font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-white/[0.04] hover:text-white"
          >
            <Link href="/estudar" className="inline-flex items-center gap-2">
              <BookOpen className="h-4 w-4" aria-hidden />
              Estudar novas questões
            </Link>
          </Button>
        </div>
      </div>
    </DashboardMobilePage>
  );
}
