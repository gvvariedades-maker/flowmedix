'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, BookOpen, Flame, Target,
  Trophy, TrendingUp, CalendarDays, BookMarked, RotateCcw,
} from 'lucide-react';
import type { DesempenhoData, DiaEstudo } from './page';

type Periodo = 7 | 15 | 30;

function abrevData(str: string): string {
  const d = new Date(str + 'T00:00:00');
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
}

function BarraGrafico({ serie, periodo }: { serie: DiaEstudo[]; periodo: Periodo }) {
  const dados = useMemo(() => serie.slice(-periodo), [serie, periodo]);
  const max = Math.max(...dados.map(d => d.count), 1);

  // Mostra legenda a cada N barras para não poluir
  const step = periodo === 7 ? 1 : periodo === 15 ? 2 : 5;

  return (
    <div className="w-full">
      <div className="flex items-end gap-1 h-40">
        {dados.map((dia, i) => {
          const pct = dia.count / max;
          const altura = Math.max(pct * 100, dia.count > 0 ? 4 : 1);
          const isToday = dia.data === new Date().toISOString().slice(0, 10);
          return (
            <div key={dia.data} className="flex-1 flex flex-col items-center gap-1 group relative">
              {/* Tooltip */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                <div className="bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded-lg whitespace-nowrap shadow-lg">
                  {dia.count} {dia.count === 1 ? 'questão' : 'questões'}
                </div>
              </div>
              {/* Barra */}
              <div className="w-full flex-1 flex items-end">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${altura}%` }}
                  transition={{ duration: 0.5, delay: i * 0.02, ease: 'easeOut' }}
                  className={`w-full rounded-t-md transition-colors ${
                    isToday
                      ? 'bg-indigo-600'
                      : dia.count > 0
                        ? 'bg-indigo-300 group-hover:bg-indigo-400'
                        : 'bg-slate-100 group-hover:bg-slate-200'
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>
      {/* Eixo X */}
      <div className="flex items-center gap-1 mt-2">
        {dados.map((dia, i) => (
          <div key={dia.data} className="flex-1 text-center">
            {i % step === 0 || i === dados.length - 1 ? (
              <span className="text-[9px] font-bold text-slate-400">{abrevData(dia.data)}</span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MeuDesempenhoClient({ dados }: { dados: DesempenhoData }) {
  const router = useRouter();
  const [periodo, setPeriodo] = useState<Periodo>(30);
  const [dialogZerar, setDialogZerar] = useState(false);
  const [zerando, setZerando] = useState(false);
  const [erroZerar, setErroZerar] = useState<string | null>(null);

  const {
    hoje, metaDiaria, streak, totalGeral, totalTodosTempos,
    serie30dias, topAssuntos,
  } = dados;

  const metaPct = Math.min(Math.round((hoje / metaDiaria) * 100), 100);
  const metaConcluida = hoje >= metaDiaria;

  // Total do período selecionado
  const totalPeriodo = useMemo(
    () => serie30dias.slice(-periodo).reduce((s, d) => s + d.count, 0),
    [serie30dias, periodo]
  );

  // Empty state (gráfico dos últimos 30 dias)
  const semDados = totalGeral === 0;
  const podeZerarHistorico = totalTodosTempos > 0;

  async function confirmarZerarDesempenho() {
    setErroZerar(null);
    setZerando(true);
    try {
      const res = await fetch('/api/zerar-desempenho', { method: 'POST' });
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
    <div className="min-h-screen bg-slate-50 pb-safe relative">
      <AnimatePresence>
        {dialogZerar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="zerar-desempenho-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-xl p-6 space-y-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                  <RotateCcw size={20} className="text-rose-600" />
                </div>
                <div>
                  <h2 id="zerar-desempenho-title" className="text-lg font-[1000] text-slate-900 tracking-tight">
                    Zerar todo o desempenho?
                  </h2>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    Todas as questões registradas no seu histórico serão apagadas: metas, sequência de dias,
                    gráficos e totais voltam ao zero. Esta ação não pode ser desfeita.
                  </p>
                </div>
              </div>
              {erroZerar && (
                <p className="text-sm font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
                  {erroZerar}
                </p>
              )}
              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-2">
                <button
                  type="button"
                  disabled={zerando}
                  onClick={() => {
                    setDialogZerar(false);
                    setErroZerar(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={zerando}
                  onClick={() => void confirmarZerarDesempenho()}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-sm hover:bg-rose-700 disabled:opacity-50"
                >
                  {zerando ? 'Zerando…' : 'Sim, zerar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-6 md:px-10">
        <div className="max-w-3xl mx-auto">
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-1">
            Meu Desempenho
          </p>
          <h1 className="text-2xl font-[1000] italic tracking-tighter text-slate-900">
            Acompanhe seu progresso
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 md:px-10 pb-2 sm:pb-4 space-y-6">

        {/* ── HERO: Meta do dia + Streak ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Meta do dia */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-5 rounded-3xl border ${
              metaConcluida
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  metaConcluida ? 'bg-emerald-100' : 'bg-indigo-50'
                }`}>
                  <Target size={16} className={metaConcluida ? 'text-emerald-600' : 'text-indigo-600'} />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                  Meta do dia
                </span>
              </div>
              {metaConcluida && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 uppercase tracking-wide">
                  Concluída!
                </span>
              )}
            </div>

            <div className="flex items-end gap-1 mb-3">
              <span className={`text-4xl font-[1000] italic tracking-tighter leading-none ${
                metaConcluida ? 'text-emerald-600' : 'text-slate-900'
              }`}>
                {hoje}
              </span>
              <span className="text-base font-bold text-slate-400 mb-1">/{metaDiaria}</span>
            </div>

            {/* Barra de progresso */}
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${metaPct}%` }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className={`h-full rounded-full ${metaConcluida ? 'bg-emerald-500' : 'bg-indigo-500'}`}
              />
            </div>
            <p className="text-[10px] font-bold text-slate-400 mt-1.5">
              {metaConcluida
                ? 'Parabéns! Meta batida hoje.'
                : `${metaDiaria - hoje} questões para bater a meta`}
            </p>
          </motion.div>

          {/* Streak + Cards menores */}
          <div className="flex flex-col gap-4">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 }}
              className="flex-1 p-5 bg-white rounded-3xl border border-slate-200 flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                <Flame size={22} className="text-amber-500" />
              </div>
              <div>
                <p className="text-3xl font-[1000] italic tracking-tighter text-slate-900 leading-none">
                  {streak}
                </p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-0.5">
                  {streak === 1 ? 'dia seguido' : 'dias seguidos'}
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex-1 p-5 bg-white rounded-3xl border border-slate-200 flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
                <Trophy size={22} className="text-violet-500" />
              </div>
              <div>
                <p className="text-3xl font-[1000] italic tracking-tighter text-slate-900 leading-none">
                  {totalGeral}
                </p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-0.5">
                  estudadas (30 dias)
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── TOTAL GERAL (todos os tempos) ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-3xl p-5 flex items-center gap-5"
        >
          <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
            <BookMarked size={26} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-0.5">
              Total de questões estudadas
            </p>
            <p className="text-4xl font-[1000] italic tracking-tighter text-white leading-none">
              {totalTodosTempos}
            </p>
            <p className="text-indigo-300 text-xs font-bold mt-1">
              desde que você começou no AVANT
            </p>
          </div>
          {totalTodosTempos >= 10 && (
            <div className="shrink-0 text-right">
              <p className="text-[10px] font-black text-indigo-200 uppercase tracking-wide">ciclos</p>
              <p className="text-[10px] font-black text-indigo-200 uppercase tracking-wide">concluídos</p>
            </div>
          )}
        </motion.div>

        {/* ── Zerar desempenho ───────────────────────────────────────────────── */}
        {podeZerarHistorico && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.13 }}
            className="rounded-3xl border border-slate-200 bg-white p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                <RotateCcw size={18} className="text-slate-600" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                  Privacidade e dados
                </p>
                <p className="text-sm text-slate-600 mt-0.5">
                  Quer começar do zero? Remove todo o histórico de questões vinculado à sua conta.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setDialogZerar(true)}
              className="shrink-0 px-4 py-2.5 rounded-xl border border-rose-200 text-rose-700 font-bold text-xs uppercase tracking-widest hover:bg-rose-50 transition-colors"
            >
              Zerar desempenho
            </button>
          </motion.div>
        )}

        {/* ── GRÁFICO ─────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="bg-white rounded-3xl border border-slate-200 p-5"
        >
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-indigo-500" />
              <span className="text-sm font-black text-slate-700">Questões estudadas</span>
              <span className="text-xs font-bold text-slate-400">
                — {totalPeriodo} nos últimos {periodo} dias
              </span>
            </div>
            {/* Filtros */}
            <div className="flex gap-1.5">
              {([7, 15, 30] as Periodo[]).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriodo(p)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wide transition-all ${
                    periodo === p
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {p}d
                </button>
              ))}
            </div>
          </div>

          {semDados ? (
            <div className="h-40 flex items-center justify-center text-slate-400 text-sm">
              Nenhuma questão estudada ainda.
            </div>
          ) : (
            <BarraGrafico key={periodo} serie={serie30dias} periodo={periodo} />
          )}

          {/* Legenda */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-indigo-600" />
              <span className="text-[10px] font-bold text-slate-500">Hoje</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-indigo-300" />
              <span className="text-[10px] font-bold text-slate-500">Dias anteriores</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-slate-100" />
              <span className="text-[10px] font-bold text-slate-500">Sem atividade</span>
            </div>
          </div>
        </motion.div>

        {/* ── TOP ASSUNTOS ──────────────────────────────────────────────────────── */}
        {topAssuntos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="bg-white rounded-3xl border border-slate-200 p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-indigo-500" />
              <span className="text-sm font-black text-slate-700">Assuntos mais estudados</span>
              <span className="text-xs font-bold text-slate-400">— últimos 30 dias</span>
            </div>
            <div className="space-y-3">
              {topAssuntos.map((a, i) => {
                const pct = Math.round((a.count / topAssuntos[0].count) * 100);
                return (
                  <div key={a.nome} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] font-black text-slate-300 w-4 shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-700 truncate">{a.nome}</span>
                      </div>
                      <span className="text-xs font-black text-indigo-600 shrink-0 ml-2">
                        {a.count}
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden ml-6">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.5, delay: 0.2 + i * 0.06, ease: 'easeOut' }}
                        className="h-full rounded-full bg-indigo-400"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── EMPTY STATE / CTA ────────────────────────────────────────────────── */}
        {semDados ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 text-center space-y-4"
          >
            <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-100 flex items-center justify-center">
              <BookOpen size={26} className="text-indigo-500" />
            </div>
            <div>
              <p className="text-sm font-black text-indigo-800">Comece a estudar para ver seu progresso</p>
              <p className="text-xs text-indigo-500 mt-1">
                Conclua o estudo reverso de uma questão e o gráfico atualiza automaticamente.
              </p>
            </div>
            <Link
              href="/estudar"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all"
            >
              <BookOpen size={14} /> Ir para a Vitrine
            </Link>
          </motion.div>
        ) : (
          <div className="flex justify-center pb-4">
            <Link
              href="/plano-diario"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-widest hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
            >
              <CalendarDays size={15} /> Ver plano de estudo diário
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
