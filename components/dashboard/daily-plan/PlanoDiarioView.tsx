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
      className={cn('bg-background px-4 pt-6', DASHBOARD_PAGE_CENTER)}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className="w-full max-w-md space-y-8 text-center"
      >
        <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-3xl border border-emerald-200 bg-emerald-50 shadow-sm">
          <Trophy className="h-14 w-14 text-emerald-600" aria-hidden />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Plano de estudo diário</p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Você está em dia</h1>
          <p className="text-sm leading-relaxed text-slate-600">
            Nenhuma questão pendente de revisão hoje. Estude novas questões na vitrine; o algoritmo de revisão
            espaçada agendará retornos conforme seu desempenho.
          </p>
        </div>
        <Button asChild className="btn-editorial-primary w-full">
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
    <div className="flex gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-white text-amber-700 shadow-sm">
        <Lock className="h-4 w-4" aria-hidden />
      </div>
      <div className="min-w-0 space-y-1 text-left">
        <p className="text-sm font-semibold text-amber-900">Revisões personalizadas</p>
        <p className="text-xs leading-relaxed text-amber-800/90">
          As questões abaixo foram selecionadas por revisão espaçada, com base no seu histórico. Siga a ordem
          sugerida para melhor fixação na memória.
        </p>
      </div>
    </div>
  );
}

function PlanoDiarioSimuladoCta() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[rgba(143,224,32,0.35)] bg-[rgba(143,224,32,0.08)] p-4">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-[#3d6b0f]">Meta do dia: 1 simulado de 10 questões</p>
        <p className="text-xs text-slate-600">
          Use modo treino para reforço rápido ou modo prova para simular concurso real.
        </p>
      </div>
      <Button asChild className="btn-editorial-outline rounded-xl">
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
    <DashboardMobilePage variant="default" className={cn(DASHBOARD_PAGE_ROOT, 'bg-background')}>
      <header className="border-b border-slate-200 bg-background shadow-sm">
        <div className="mx-auto max-w-3xl px-4 py-8 md:px-10">
          <div className="flex flex-col items-center text-center sm:block sm:text-left">
            <p className="text-xs font-black uppercase tracking-widest text-[#3d6b0f]">
              Plano de estudo diário
            </p>
            <div className="mt-3 flex items-center justify-center gap-2 sm:justify-start">
              <Zap className="h-6 w-6 shrink-0 text-[#3d6b0f] sm:h-7 sm:w-7" aria-hidden />
              <h1 className="text-balance text-4xl font-black capitalize leading-tight tracking-tight text-slate-900">
                {dataFormatada}
              </h1>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              {phraseQuestoesAgendadas(revisoes.length)} para hoje
              {totalPendentes > limite && (
                <span className="ml-1 font-medium text-rose-600">
                  (de {totalPendentes} pendentes — priorizando as mais urgentes)
                </span>
              )}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
            <div className="flex items-center gap-2 rounded-2xl border border-[rgba(143,224,32,0.35)] bg-[rgba(143,224,32,0.08)] px-4 py-2.5 shadow-sm">
              <CalendarDays className="h-4 w-4 text-[#3d6b0f]" aria-hidden />
              <span className="text-sm font-bold tabular-nums text-[#3d6b0f]">
                {revisoes.length}/{limite} hoje
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 shadow-sm">
              <Clock className="h-4 w-4 text-slate-600" aria-hidden />
              <span className="text-sm font-bold tabular-nums text-slate-700">~{revisoes.length * 3} min</span>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <Sparkles className="h-4 w-4 text-slate-400" aria-hidden />
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
            className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-sm"
            role="status"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-200 bg-white text-rose-600">
              <Flame className="h-4 w-4" aria-hidden />
            </div>
            <p className="text-sm font-medium leading-relaxed text-rose-950">
              <span className="font-bold">{totalPendentes - limite} questões</span> ainda aguardam revisão. Elas
              entrarão no plano nos próximos dias conforme você conclui as de hoje.
            </p>
          </div>
        )}

        <div className="flex justify-center pt-2">
          <Button variant="outline" asChild className="btn-editorial-outline rounded-2xl px-6">
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
