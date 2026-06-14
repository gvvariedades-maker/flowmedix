'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Lightbulb, TrendingUp } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';

interface GoldenRuleMeshRevealProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

function anchorFromContent(content?: string): string {
  if (!content) return 'B';
  const letter = content.match(/\bletra\s*([A-E])\b/i)?.[1];
  if (letter) return letter.toUpperCase();
  if (content.length <= 6) return content.trim();
  const words = content.split(/\s+/).filter(Boolean);
  if (words.length <= 3) return words.join(' · ');
  return 'IPCS';
}

export function GoldenRuleMeshReveal({
  content,
  rows,
  theme,
  footerRule,
}: GoldenRuleMeshRevealProps) {
  const reduceMotion = useReducedMotion();
  const [layer, setLayer] = useState(0);
  const maxLayer = 3;

  const anchor = useMemo(() => anchorFromContent(content), [content]);

  const contextRow = rows[0];
  const metricRows = rows.slice(0, 3);
  const insightText = footerRule ?? rows[rows.length - 1]?.value ?? 'Bundle de prevenção de IPCS na prova.';

  const advance = useCallback(() => {
    setLayer((l) => Math.min(maxLayer, l + 1));
  }, []);

  const back = useCallback(() => {
    setLayer((l) => Math.max(0, l - 1));
  }, []);

  const progressPct = ['2%', '33%', '66%', '100%'][layer];
  const stepLabels = ['Toque para revelar', 'CAMADA 1 DE 3', 'CAMADA 2 DE 3', 'CAMADA 3 DE 3'];
  const layerNames = ['', 'Contexto', 'Métricas', 'Insight'];

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
      {/* Mesh orbs */}
      <div className="absolute inset-0 overflow-hidden bg-[#fafbff]">
        <motion.div
          className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-gradient-to-br from-indigo-200 to-blue-200 opacity-55 blur-[80px]"
          animate={{ x: [0, 20, -15, 0], y: [0, -30, 20, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -right-16 top-[10%] h-72 w-72 rounded-full bg-gradient-to-br from-fuchsia-200 to-pink-200 opacity-50 blur-[80px]"
          animate={{ x: [0, -18, 12, 0], y: [0, 22, -16, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        />
        <motion.div
          className="absolute bottom-[15%] left-[5%] h-64 w-64 rounded-full bg-gradient-to-br from-emerald-200 to-teal-200 opacity-50 blur-[80px]"
          animate={{ x: [0, 15, -10, 0], y: [0, -18, 14, 0] }}
          transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
        />
        <motion.div
          className="absolute bottom-0 right-[10%] h-52 w-52 rounded-full bg-gradient-to-br from-amber-200 to-yellow-200 opacity-45 blur-[80px]"
          animate={{ x: [0, -12, 18, 0], y: [0, 16, -12, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
        />
      </div>

      <div className="relative z-10 flex items-center justify-between px-6 pt-5">
        <span className="flex items-center gap-1.5 rounded-full border border-white/90 bg-white/75 px-3.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-indigo-600 shadow-sm backdrop-blur-md">
          ✦ Mesh Reveal
        </span>
        <div className="flex gap-1.5">
          {[1, 2, 3].map((d) => (
            <div
              key={d}
              className={`h-2 w-2 rounded-full border transition-all ${
                layer >= d
                  ? 'border-indigo-500 bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]'
                  : 'border-indigo-300/40 bg-indigo-100/50'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-7">
        <button
          type="button"
          onClick={layer < maxLayer ? advance : undefined}
          className="mb-4 text-center focus:outline-none"
        >
          <p
            className={`mb-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 transition-opacity ${
              layer > 0 ? 'opacity-0' : 'opacity-100'
            }`}
          >
            Toque para revelar
          </p>
          <motion.div
            key={layer}
            animate={reduceMotion ? undefined : { scale: [1, 1.06, 1] }}
            transition={{ duration: 0.35 }}
            className="bg-gradient-to-br from-indigo-500 via-violet-500 to-violet-400 bg-clip-text font-display text-7xl font-black tracking-tight text-transparent md:text-8xl"
          >
            {anchor}
          </motion.div>
          {layer === 0 ? (
            <p className="mt-3 flex items-center justify-center gap-1.5 font-body text-xs font-medium text-slate-400">
              <span className="flex h-5 w-5 animate-bounce items-center justify-center rounded-full border border-indigo-200 bg-indigo-50 text-[10px] text-indigo-500">
                ↓
              </span>
              Toque no número
            </p>
          ) : null}
        </button>

        <div className="w-full max-w-sm space-y-3">
          {layer >= 1 && contextRow ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/95 bg-white/82 p-5 shadow-lg shadow-indigo-100/40 backdrop-blur-xl"
            >
              <div className="flex gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 text-xl">
                  <TrendingUp className="h-5 w-5 text-indigo-600" aria-hidden />
                </div>
                <div>
                  <p className="font-body text-sm font-extrabold text-slate-900">{contextRow.label}</p>
                  <p className="mt-1 font-body text-sm leading-relaxed text-slate-600">{contextRow.value}</p>
                </div>
              </div>
            </motion.div>
          ) : null}

          {layer >= 2 && metricRows.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/95 bg-white/82 p-4 shadow-lg shadow-indigo-100/40 backdrop-blur-xl"
            >
              <div className="flex gap-2">
                {metricRows.map((row) => (
                  <div
                    key={row.label}
                    className="flex-1 rounded-xl border border-indigo-100 bg-indigo-50/80 px-2 py-3 text-center"
                  >
                    <p className="font-mono text-lg font-black leading-none text-indigo-700">
                      {row.label.slice(0, 4)}
                    </p>
                    <p className="mt-1 font-mono text-[8px] font-bold uppercase tracking-wide text-slate-400">
                      {row.label}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : null}

          {layer >= 3 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 p-5 shadow-xl shadow-indigo-300/40"
            >
              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10" />
              <div className="relative flex items-center gap-3">
                <Lightbulb className="h-7 w-7 shrink-0 text-amber-200" aria-hidden />
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-white/65">
                    Insight principal
                  </p>
                  <p className="font-body text-sm font-bold leading-snug text-white">{insightText}</p>
                </div>
              </div>
            </motion.div>
          ) : null}
        </div>
      </div>

      <div className="relative z-10 px-6 pb-2">
        <div className="h-0.5 overflow-hidden rounded-full bg-indigo-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-violet-400 transition-all duration-500"
            style={{ width: progressPct }}
          />
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between px-6 pb-6 pt-2">
        <button
          type="button"
          disabled={layer === 0}
          onClick={back}
          className="flex items-center gap-2 rounded-full border border-indigo-200/80 bg-white/80 px-5 py-2.5 font-body text-sm font-bold text-indigo-800 shadow-sm backdrop-blur-md disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" /> Voltar
        </button>
        <div className="text-center">
          <p className="font-mono text-[10px] font-bold uppercase tracking-wide text-slate-400">
            {stepLabels[layer]}
          </p>
          <p className="font-body text-[11px] font-semibold text-violet-400">{layerNames[layer]}</p>
        </div>
        <button
          type="button"
          disabled={layer >= maxLayer}
          onClick={advance}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-2.5 font-body text-sm font-bold text-white shadow-lg shadow-indigo-300/40 disabled:opacity-30"
        >
          {layer >= maxLayer ? '✓ Completo' : 'Revelar'} <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
