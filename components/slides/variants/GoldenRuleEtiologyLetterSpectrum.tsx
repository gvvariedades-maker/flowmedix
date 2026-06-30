'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';
import {
  extractLetterFromText,
  inferEtiologyLetterStatus,
  type EtiologyLetterStatus,
} from '@/lib/slides/etiologySlideUtils';

interface GoldenRuleEtiologyLetterSpectrumProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

type LetterCard = {
  letter: string;
  label: string;
  value: string;
  status: EtiologyLetterStatus;
};

function statusStyles(status: EtiologyLetterStatus): {
  ring: string;
  bg: string;
  text: string;
  icon: typeof Check;
} {
  switch (status) {
    case 'correct':
      return {
        ring: 'ring-emerald-400/60',
        bg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
        text: 'text-white',
        icon: Check,
      };
    case 'eliminated':
      return {
        ring: 'ring-rose-400/50',
        bg: 'bg-gradient-to-br from-rose-400 to-orange-500',
        text: 'text-white',
        icon: X,
      };
    default:
      return {
        ring: 'ring-slate-300/50',
        bg: 'bg-gradient-to-br from-slate-200 to-slate-300',
        text: 'text-slate-800',
        icon: Check,
      };
  }
}

export function GoldenRuleEtiologyLetterSpectrum({
  content,
  rows,
  theme,
  footerRule,
}: GoldenRuleEtiologyLetterSpectrumProps) {
  const letters = useMemo(() => {
    const map = new Map<string, LetterCard>();
    for (const row of rows) {
      const letter =
        extractLetterFromText(row.label) ||
        extractLetterFromText(row.value) ||
        (/^gabarito$/i.test(row.label.trim()) ? 'A' : null);
      if (!letter) continue;
      if (!map.has(letter) || row.badge === 'hot') {
        map.set(letter, {
          letter,
          label: row.label,
          value: row.value,
          status: inferEtiologyLetterStatus(row.label, row.value, row.badge),
        });
      }
    }
    return ['A', 'B', 'C', 'D', 'E'].filter((l) => map.has(l)).map((l) => map.get(l)!);
  }, [rows]);

  const [activeLetter, setActiveLetter] = useState(letters[0]?.letter ?? 'A');
  const active = letters.find((l) => l.letter === activeLetter) ?? letters[0];

  const select = useCallback((letter: string) => setActiveLetter(letter), []);

  if (letters.length === 0) return null;

  const activeStatus = statusStyles(active?.status ?? 'neutral');
  const StatusIcon = activeStatus.icon;

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-5">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-30`} />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-4">
        {content && (
          <div className="rounded-2xl border border-orange-200/80 bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-3 text-center shadow-sm">
            <p className="font-display text-lg font-black tracking-wide text-orange-900 md:text-xl">
              {content}
            </p>
          </div>
        )}

        {/* Espectro A–D */}
        <div className="flex items-stretch justify-center gap-2 md:gap-3">
          {letters.map((card) => {
            const st = statusStyles(card.status);
            const selected = card.letter === activeLetter;
            const Icon = st.icon;
            return (
              <button
                key={card.letter}
                type="button"
                onClick={() => select(card.letter)}
                className={`flex min-h-[72px] min-w-[56px] flex-1 max-w-[88px] flex-col items-center justify-center gap-1 rounded-2xl transition-all duration-200 md:min-h-[88px] md:max-w-[100px] ${
                  selected ? `${st.bg} ${st.text} ring-4 ${st.ring} scale-105 shadow-lg` : `${st.bg} ${st.text} opacity-55 hover:opacity-90`
                }`}
              >
                <span className="font-display text-2xl font-black md:text-3xl">{card.letter}</span>
                {card.status !== 'neutral' && (
                  <Icon className="h-4 w-4" strokeWidth={3} aria-hidden />
                )}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {active && (
            <motion.div
              key={active.letter}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              className="rounded-2xl border border-orange-200/70 bg-white/90 p-4 shadow-md md:p-5"
            >
              <div className="mb-2 flex items-center gap-2">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${activeStatus.bg} ${activeStatus.text}`}
                >
                  <StatusIcon className="h-4 w-4" strokeWidth={3} aria-hidden />
                </span>
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-orange-800">
                  Letra {active.letter}
                </span>
              </div>
              <p className="font-display text-sm font-bold text-slate-800 md:text-base">{active.label}</p>
              <p className="mt-2 font-body text-sm leading-relaxed text-slate-600">{active.value}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {footerRule && (
          <p className="text-center font-body text-xs font-medium text-orange-900/70 md:text-sm">
            {footerRule}
          </p>
        )}
      </div>
    </div>
  );
}
