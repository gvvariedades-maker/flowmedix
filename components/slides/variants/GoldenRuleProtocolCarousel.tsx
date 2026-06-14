'use client';

import { useCallback, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { AlertTriangle, ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';

interface GoldenRuleProtocolCarouselProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

function ruleAccent(row: GoldenRuleRow): 'alert' | 'tip' | 'neutral' {
  if (row.emphasis === 'alert') return 'alert';
  if (row.emphasis === 'success' || row.badge === 'ok') return 'tip';
  return 'neutral';
}

function ruleCardTone(accent: 'alert' | 'tip' | 'neutral'): string {
  switch (accent) {
    case 'alert':
      return 'border-rose-300/80 border-l-rose-500 bg-gradient-to-br from-rose-50 via-white to-orange-50/90 shadow-lg shadow-rose-200/40 ring-1 ring-rose-200/50';
    case 'tip':
      return 'border-emerald-300/80 border-l-emerald-500 bg-gradient-to-br from-emerald-50 via-white to-teal-50/90 shadow-lg shadow-emerald-200/40 ring-1 ring-emerald-200/50';
    default:
      return 'border-amber-300/80 border-l-amber-500 bg-gradient-to-br from-amber-50 via-white to-yellow-50/80 shadow-lg shadow-amber-200/40 ring-1 ring-amber-200/50';
  }
}

export function GoldenRuleProtocolCarousel({
  content,
  rows,
  theme,
  footerRule,
}: GoldenRuleProtocolCarouselProps) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const total = rows.length;
  const row = rows[index];

  const go = useCallback(
    (dir: -1 | 1) => {
      setIndex((i) => Math.max(0, Math.min(total - 1, i + dir)));
    },
    [total],
  );

  if (!row) {
    return null;
  }

  const accent = ruleAccent(row);

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden p-4 md:p-6">
      <motion.div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-45`} />

      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col">
        {content ? (
          <p className="mb-3 text-center font-mono text-[10px] font-bold uppercase tracking-widest text-amber-700/90">
            {content.length <= 48 ? content : 'Referência de prova'}
          </p>
        ) : null}

        <div className="relative flex flex-1 flex-col justify-center">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => go(-1)}
            className="absolute left-0 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-amber-300/80 bg-gradient-to-br from-amber-50 to-white text-amber-900 shadow-md shadow-amber-200/50 disabled:opacity-30"
            aria-label="Regra anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={index >= total - 1}
            onClick={() => go(1)}
            className="absolute right-0 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-amber-300/80 bg-gradient-to-br from-amber-50 to-white text-amber-900 shadow-md shadow-amber-200/50 disabled:opacity-30"
            aria-label="Próxima regra"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={index}
              initial={reduceMotion ? false : { opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, x: -24 }}
              transition={{ duration: 0.28 }}
              className={`mx-10 flex min-h-[220px] flex-col rounded-2xl border border-l-[5px] p-5 md:min-h-[260px] md:p-6 ${ruleCardTone(accent)}`}
            >
              <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-widest text-amber-700">
                {row.label || `Regra ${index + 1} de ${total}`}
              </p>
              <p className="font-body text-base font-bold italic leading-snug text-slate-900 md:text-lg">
                {row.value}
              </p>

              {accent === 'alert' ? (
                <div className="mt-4 flex gap-2 rounded-xl border border-rose-300/70 bg-gradient-to-r from-rose-100/80 to-orange-50/90 p-3 shadow-inner">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" aria-hidden />
                  <p className="font-body text-xs font-semibold leading-relaxed text-rose-900">
                    Pegadinha frequente neste tema — confira o dispositivo antes de marcar.
                  </p>
                </div>
              ) : null}

              {accent === 'tip' ? (
                <div className="mt-4 flex gap-2 rounded-xl border border-emerald-300/70 bg-gradient-to-r from-emerald-100/80 to-teal-50/90 p-3 shadow-inner">
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                  <p className="font-body text-xs font-semibold leading-relaxed text-emerald-900">
                    Decore para a prova: este é o gabarito conceitual da questão.
                  </p>
                </div>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-4 flex justify-center gap-1.5">
          {rows.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all ${
                i === index ? 'w-6 bg-amber-500' : 'w-2 bg-amber-200'
              }`}
              aria-label={`Regra ${i + 1}`}
            />
          ))}
        </div>

        {footerRule ? (
          <p className="mt-4 rounded-xl border border-amber-200/60 bg-gradient-to-r from-amber-50/90 to-yellow-50/80 px-3 py-2 text-center font-body text-xs italic text-amber-900/80 shadow-sm">
            {footerRule}
          </p>
        ) : null}
      </div>
    </div>
  );
}
