'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  CalendarDays, BookOpen, CheckCircle2, Clock,
  ChevronRight, Flame, RefreshCcw, Trophy, Info,
} from 'lucide-react';
import type { ReviewItem } from '@/lib/spaced-repetition';
import { formatAvantCodigo } from '@/lib/avantCodigo';

interface Props {
  revisoes: ReviewItem[];
  totalPendentes: number;
  limite: number;
}

function urgenciaLabel(item: ReviewItem): { label: string; color: string; bg: string } {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dias = Math.floor((hoje.getTime() - item.nextReview.getTime()) / (1000 * 60 * 60 * 24));
  if (dias <= 0) return { label: 'Hoje', color: 'text-indigo-600', bg: 'bg-indigo-50' };
  if (dias === 1) return { label: '1 dia atrás', color: 'text-amber-600', bg: 'bg-amber-50' };
  return { label: `${dias} dias atrás`, color: 'text-rose-600', bg: 'bg-rose-50' };
}

function assuntoDisplay(item: ReviewItem): string {
  return item.subtopico || item.topico || item.modulo_slug;
}

export default function PlanoDiarioClient({ revisoes, totalPendentes, limite }: Props) {
  const hoje = new Date();
  const dataFormatada = hoje.toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  // Empty state: sem nenhuma revisão pendente
  if (revisoes.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 pb-safe">
        <div className="max-w-md w-full text-center space-y-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className="w-24 h-24 mx-auto rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center justify-center"
          >
            <Trophy size={44} className="text-emerald-500" />
          </motion.div>
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
              Plano de Estudo Diário
            </p>
            <h1 className="text-2xl font-[1000] italic tracking-tighter text-slate-900">
              Você está em dia!
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              Nenhuma questão pendente de revisão para hoje. Continue estudando novas questões
              na vitrine para o sistema agendar revisões no momento certo.
            </p>
          </div>
          <Link
            href="/estudar"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 text-white font-black uppercase text-xs tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
          >
            <BookOpen size={16} /> Ir para a Vitrine
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-safe">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-6 md:px-10">
        <div className="max-w-3xl mx-auto">
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-1">
            Plano de Estudo Diário
          </p>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-[1000] italic tracking-tighter text-slate-900 capitalize">
                {dataFormatada}
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                {revisoes.length} questão{revisoes.length !== 1 ? 'ões' : ''} para revisar hoje
                {totalPendentes > limite && (
                  <span className="ml-1 text-rose-500 font-bold">
                    (de {totalPendentes} pendentes — priorizando as mais urgentes)
                  </span>
                )}
              </p>
            </div>

            {/* Stats rápidos */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-100">
                <CalendarDays size={15} className="text-indigo-500" />
                <span className="text-xs font-black text-indigo-700">
                  {revisoes.length}/{limite} hoje
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-100">
                <Clock size={15} className="text-amber-500" />
                <span className="text-xs font-black text-amber-700">
                  ~{revisoes.length * 3} min
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-3xl mx-auto px-6 py-8 md:px-10 space-y-4">

        {/* Banner informativo */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
          <Info size={16} className="text-indigo-400 shrink-0 mt-0.5" />
          <p className="text-xs text-indigo-700 font-medium leading-relaxed">
            Estas questões foram selecionadas pelo algoritmo de revisão espaçada com base no
            seu histórico de estudos. Revise na ordem sugerida para melhor retenção.
          </p>
        </div>

        {/* Lista de questões */}
        <div className="space-y-3">
          {revisoes.map((item, index) => {
            const urgencia = urgenciaLabel(item);
            const assunto = assuntoDisplay(item);
            const repetiu = item.repetitions > 0;

            return (
              <motion.div
                key={item.modulo_slug}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, type: 'spring', stiffness: 300, damping: 25 }}
              >
                <Link
                  href={`/estudar/${item.modulo_slug}?from=plano`}
                  className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-200 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-500/10 transition-all group"
                >
                  {/* Número */}
                  <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center shrink-0 transition-colors">
                    <span className="text-sm font-black text-slate-500 group-hover:text-indigo-600 transition-colors">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                        {item.topico || 'Questão'}
                      </p>
                      {formatAvantCodigo(item.avant_codigo) && (
                        <span className="text-[9px] font-mono font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                          {formatAvantCodigo(item.avant_codigo)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-slate-800 truncate">{assunto}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {/* Badge urgência */}
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black ${urgencia.bg} ${urgencia.color}`}>
                        <Clock size={9} />
                        {urgencia.label}
                      </span>
                      {/* Ciclos de revisão */}
                      {repetiu && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 text-[10px] font-black">
                          <RefreshCcw size={9} />
                          {item.repetitions}× revisada
                        </span>
                      )}
                      {/* Urgente (errou antes) */}
                      {item.priority >= 50 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-black">
                          <Flame size={9} />
                          Precisa atenção
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Seta */}
                  <ChevronRight
                    size={18}
                    className="text-slate-300 group-hover:text-indigo-500 shrink-0 transition-colors"
                  />
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Rodapé se houver mais pendentes além do limite */}
        {totalPendentes > limite && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-100 mt-2">
            <Flame size={16} className="text-rose-400 shrink-0" />
            <p className="text-xs text-rose-700 font-medium leading-relaxed">
              <span className="font-black">{totalPendentes - limite} questões</span> adicionais
              estão aguardando revisão. Elas aparecerão aqui nos próximos dias à medida que você
              conclui as de hoje.
            </p>
          </div>
        )}

        {/* Botão secundário: ver todas as questões */}
        <div className="flex justify-center pt-2">
          <Link
            href="/estudar"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-widest hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
          >
            <BookOpen size={15} /> Estudar novas questões
          </Link>
        </div>

        {/* Indicador de progresso da sessão */}
        <div className="sticky bottom-4 sm:bottom-6 mb-safe flex justify-center pointer-events-none px-2">
          <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-full bg-white border border-slate-200 shadow-lg shadow-black/5 pointer-events-auto max-w-[min(100%,22rem)]">
            <CheckCircle2 size={14} className="text-emerald-500" />
            <span className="text-xs font-bold text-slate-600">
              Conclua o estudo reverso de cada questão para marcá-la como revisada
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
