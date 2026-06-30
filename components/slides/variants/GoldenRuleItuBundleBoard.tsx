'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, AlertTriangle, Hand } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';
import {
  extractLetterFromText,
  inferItuLetterStatus,
  type ItuLetterStatus,
} from '@/lib/slides/ituCateterSlideUtils';

interface GoldenRuleItuBundleBoardProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

type LetterCard = {
  letter: string;
  label: string;
  value: string;
  status: ItuLetterStatus;
};

function statusStyles(status: ItuLetterStatus): {
  ring: string;
  bg: string;
  text: string;
  icon: typeof Check;
} {
  switch (status) {
    case 'bundle_ok':
      return {
        ring: 'ring-emerald-400/60',
        bg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
        text: 'text-white',
        icon: Check,
      };
    case 'exceto':
      return {
        ring: 'ring-rose-400/60',
        bg: 'bg-gradient-to-br from-rose-500 to-orange-600',
        text: 'text-white',
        icon: X,
      };
    default:
      return {
        ring: 'ring-lime-300/50',
        bg: 'bg-gradient-to-br from-lime-200 to-lime-300',
        text: 'text-lime-950',
        icon: AlertTriangle,
      };
  }
}

export function GoldenRuleItuBundleBoard({
  content,
  rows,
  theme,
  footerRule,
}: GoldenRuleItuBundleBoardProps) {
  const letters = useMemo(() => {
    const map = new Map<string, LetterCard>();
    for (const row of rows) {
      const letter =
        extractLetterFromText(row.label) ||
        extractLetterFromText(row.value) ||
        (/^gabarito$/i.test(row.label.trim()) ? null : null);
      if (!letter) continue;
      if (!map.has(letter) || row.badge === 'hot') {
        map.set(letter, {
          letter,
          label: row.label,
          value: row.value,
          status: inferItuLetterStatus(row.label, row.value, row.badge),
        });
      }
    }
    const gabaritoRow = rows.find((r) => /^gabarito$/i.test(r.label.trim()));
    if (gabaritoRow) {
      const gLetter = extractLetterFromText(gabaritoRow.value);
      if (gLetter && map.has(gLetter)) {
        const existing = map.get(gLetter)!;
        map.set(gLetter, { ...existing, status: 'exceto' });
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
          <h2 className="text-center font-display text-lg font-black uppercase tracking-tight text-lime-950 md:text-xl">
            {content}
          </h2>
        )}

        <div className="flex items-center justify-center gap-2 rounded-xl border border-lime-200/80 bg-lime-50/90 px-3 py-2">
          <Hand className="h-4 w-4 shrink-0 text-lime-700 animate-pulse" aria-hidden />
          <p className="font-mono text-[10px] font-bold uppercase tracking-wide text-lime-900 md:text-[11px]">
            Toque em cada letra — verde = cuidado ok · vermelho = EXCETO
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 md:gap-3">
          {letters.map((card) => {
            const st = statusStyles(card.status);
            const selected = card.letter === activeLetter;
            const Icon = st.icon;
            return (
              <button
                key={card.letter}
                type="button"
                onClick={() => select(card.letter)}
                aria-pressed={selected}
                aria-label={`Letra ${card.letter} — toque para ver detalhe`}
                className={`relative flex min-h-[52px] min-w-[52px] flex-col items-center justify-center rounded-2xl border-2 px-3 py-2 transition-all md:min-h-[60px] md:min-w-[60px] ${
                  selected
                    ? `${st.bg} ${st.ring} scale-105 shadow-lg`
                    : 'border-lime-200/80 bg-white/90 hover:border-lime-400 hover:shadow-md animate-pulse'
                }`}
              >
                {!selected && (
                  <span className="absolute -right-1 -top-1 rounded-full bg-lime-500 p-0.5 text-white shadow-sm">
                    <Hand className="h-2.5 w-2.5" aria-hidden />
                  </span>
                )}
                <span className={`font-display text-xl font-black ${selected ? st.text : 'text-lime-900'}`}>
                  {card.letter}
                </span>
                {selected && <Icon className={`h-3.5 w-3.5 ${st.text}`} aria-hidden />}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {active && (
            <motion.div
              key={active.letter}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className={`rounded-2xl border bg-white/95 p-4 shadow-md md:p-5 ${
                active.status === 'exceto'
                  ? 'border-rose-200 border-l-[4px] border-l-rose-500'
                  : active.status === 'bundle_ok'
                    ? 'border-emerald-200 border-l-[4px] border-l-emerald-500'
                    : 'border-lime-200 border-l-[4px] border-l-lime-500'
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${activeStatus.bg}`}>
                  <StatusIcon className={`h-4 w-4 ${activeStatus.text}`} aria-hidden />
                </span>
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-slate-600">
                  Letra {active.letter}
                </span>
              </div>
              <p className="font-body text-sm font-semibold text-slate-800 md:text-base">{active.label}</p>
              <p className="mt-2 font-body text-sm leading-relaxed text-slate-600">{active.value}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {footerRule && (
          <p className="mt-auto text-center font-mono text-[10px] font-bold uppercase tracking-widest text-lime-800/70 md:text-xs">
            {footerRule}
          </p>
        )}
      </div>
    </div>
  );
}
