'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  Flame,
  Lock,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PlanoDiarioMarcadosProvider, usePlanoDiarioMarcadosContext } from './PlanoDiarioMarcadosContext';
import { PlanoDiarioTopicCard } from './PlanoDiarioTopicCard';
import type { PlanoDiarioProps } from './types';

function PlanoDiarioEmpty() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50/95 px-4 pb-safe pt-6">
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className="w-full max-w-md space-y-8 text-center"
      >
        <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-3xl border border-emerald-200/80 bg-white shadow-lg shadow-emerald-100/60">
          <Trophy className="h-14 w-14 text-emerald-600" aria-hidden />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Plano de estudo diário</p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Você está em dia</h1>
          <p className="text-sm leading-relaxed text-slate-600">
            Nenhuma questão pendente de revisão hoje. Continue na vitrine para novas questões; o algoritmo
            agendará revisões no tempo certo.
          </p>
        </div>
        <Button
          asChild
          className="rounded-2xl bg-sky-600 px-8 py-6 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:bg-sky-700 hover:shadow-lg"
        >
          <Link href="/estudar" className="inline-flex items-center gap-2">
            <BookOpen className="h-4 w-4" aria-hidden />
            Ir à vitrine
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}

function PlanoDiarioInfoAlgoritmo() {
  return (
    <div
      className={cn(
        'flex gap-4 rounded-2xl border border-amber-200/90 bg-amber-50/90 p-5 shadow-sm',
        'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6)]',
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-200/80 bg-white text-amber-700 shadow-sm">
        <Lock className="h-4 w-4" aria-hidden />
      </div>
      <div className="min-w-0 space-y-1 text-left">
        <p className="text-sm font-semibold text-amber-950">Revisões personalizadas</p>
        <p className="text-xs leading-relaxed text-amber-900/80">
          As questões abaixo foram selecionadas por revisão espaçada, com base no seu histórico. Siga a ordem
          sugerida para melhor fixação na memória.
        </p>
      </div>
    </div>
  );
}

function PlanoDiarioLembretesToolbar() {
  const { limparHoje, marcadosCount } = usePlanoDiarioMarcadosContext();
  if (marcadosCount === 0) return null;
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <p className="text-center text-xs text-slate-500">
        {marcadosCount} {marcadosCount === 1 ? 'item' : 'itens'} lembrado
        {marcadosCount === 1 ? '' : 's'} neste aparelho
      </p>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={limparHoje}
        className="h-auto py-1 text-xs font-medium text-sky-700 underline-offset-2 hover:underline"
      >
        Limpar lembretes de hoje
      </Button>
    </div>
  );
}

export default function PlanoDiarioView({ userId, revisoes, totalPendentes, limite }: PlanoDiarioProps) {
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
    <PlanoDiarioMarcadosProvider userId={userId}>
      <PlanoDiarioConteúdo
        dataFormatada={dataFormatada}
        limite={limite}
        revisoes={revisoes}
        totalPendentes={totalPendentes}
      />
    </PlanoDiarioMarcadosProvider>
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
    <div className="min-h-screen bg-slate-50 pb-safe">
      <header className="border-b border-slate-200/80 bg-white/90 shadow-sm shadow-slate-200/30 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl px-4 py-8 md:px-10">
          <div className="flex flex-col items-center text-center sm:block sm:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Plano de estudo diário</p>
            <div className="mt-3 flex items-center justify-center gap-2 sm:justify-start">
              <Zap className="h-6 w-6 shrink-0 text-amber-500 drop-shadow-sm sm:h-7 sm:w-7" aria-hidden />
              <h1 className="text-balance text-2xl font-semibold capitalize leading-tight tracking-tight text-slate-900 sm:text-3xl">
                {dataFormatada}
              </h1>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              {revisoes.length} questão{revisoes.length !== 1 ? 'ões' : ''} agendada
              {revisoes.length !== 1 ? 's' : ''} para hoje
              {totalPendentes > limite && (
                <span className="ml-1 font-medium text-rose-600">
                  (de {totalPendentes} pendentes — priorizando as mais urgentes)
                </span>
              )}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
            <div className="flex items-center gap-2 rounded-2xl border border-sky-200 bg-sky-50/90 px-4 py-2.5 shadow-sm">
              <CalendarDays className="h-4 w-4 text-sky-600" aria-hidden />
              <span className="text-sm font-bold tabular-nums text-sky-900">
                {revisoes.length}/{limite} hoje
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50/90 px-4 py-2.5 shadow-sm">
              <Clock className="h-4 w-4 text-amber-600" aria-hidden />
              <span className="text-sm font-bold text-amber-950">~{revisoes.length * 3} min</span>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <Sparkles className="h-4 w-4 text-emerald-600" aria-hidden />
              <span className="text-xs font-medium text-slate-500">Foco e consistência</span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-8 px-4 py-10 md:px-10">
        <PlanoDiarioInfoAlgoritmo />
        <PlanoDiarioLembretesToolbar />

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
            className="rounded-2xl border-slate-200 bg-white px-6 font-semibold text-slate-600 transition-all duration-200 hover:scale-[1.02] hover:border-sky-200 hover:text-sky-800"
          >
            <Link href="/estudar" className="inline-flex items-center gap-2">
              <BookOpen className="h-4 w-4" aria-hidden />
              Estudar novas questões
            </Link>
          </Button>
        </div>

        <div className="sticky bottom-4 z-10 mb-6 flex justify-center sm:bottom-6">
          <div className="pointer-events-none max-w-md px-2">
            <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/95 px-4 py-3 text-left shadow-lg shadow-slate-400/15 backdrop-blur-sm">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
              <span className="text-xs font-medium text-slate-600">
                O checkbox marca um lembrete local (só neste aparelho). A revisão oficial exige o estudo reverso
                na questão.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
