'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Cross, Scale } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { BoardChrome } from '../primitives';
import { cn } from '@/lib/utils';

type HubRow = {
  label?: string;
  value?: string;
  badge?: string;
};

interface GoldenRuleAdolescentMentalHubBoardProps {
  content?: string;
  rows?: HubRow[];
  theme: ThemeColors;
  footerRule?: string;
}

const CARD_TONES = [
  { border: 'border-emerald-400', chip: 'bg-emerald-600', icon: 'text-emerald-700' },
  { border: 'border-sky-400', chip: 'bg-sky-600', icon: 'text-sky-700' },
  { border: 'border-emerald-400', chip: 'bg-emerald-600', icon: 'text-emerald-700' },
  { border: 'border-sky-400', chip: 'bg-sky-600', icon: 'text-sky-700' },
  { border: 'border-violet-400', chip: 'bg-violet-600', icon: 'text-violet-700' },
] as const;

/**
 * Slide 3 mental — hub tipo “Legislação SUS”:
 * núcleo central + cards numéricos (estático).
 */
export function GoldenRuleAdolescentMentalHubBoard({
  content,
  rows = [],
  theme,
  footerRule,
}: GoldenRuleAdolescentMentalHubBoardProps) {
  const reduceMotion = useReducedMotion();

  const cards = useMemo(
    () =>
      rows.slice(0, 5).map((row, index) => ({
        key: `${row.label}-${index}`,
        n: index + 1,
        label: (row.label || `Critério ${index + 1}`).trim(),
        value: (row.value || '').trim(),
        tone: CARD_TONES[index % CARD_TONES.length]!,
      })),
    [rows],
  );

  if (cards.length === 0 && !content) return null;

  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.26}
      maxWidth="lg"
      footerLabel="Fixação"
      footerRule={footerRule}
    >
      <div className="flex justify-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1.5 text-white shadow-md">
          <Scale className="h-3.5 w-3.5 text-emerald-400" aria-hidden />
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider">
            Critérios diferenciais
          </span>
        </span>
      </div>

      <div className="relative mx-auto flex max-w-md flex-col items-center">
        <motion.div
          initial={reduceMotion ? false : { scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-[1] flex h-36 w-36 flex-col items-center justify-center rounded-full bg-slate-900 text-center shadow-xl ring-4 ring-emerald-400/40 md:h-40 md:w-40"
        >
          <span className="mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
            <Cross className="h-4 w-4 text-emerald-400" aria-hidden />
          </span>
          <p className="px-3 font-display text-[11px] font-black uppercase leading-tight tracking-wide text-white md:text-xs">
            {content || 'Anorexia × Bulimia'}
          </p>
          <p className="mt-1 font-mono text-[9px] font-bold uppercase tracking-widest text-emerald-400">
            Decore clínico
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {cards.map((card, index) => (
          <motion.article
            key={card.key}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduceMotion ? 0 : 0.05 + index * 0.04 }}
            className={cn(
              'relative rounded-2xl border-2 bg-white px-3 pb-3 pt-5 shadow-md',
              card.tone.border,
              index === cards.length - 1 && cards.length % 2 === 1 ? 'sm:col-span-2 sm:mx-auto sm:max-w-md' : '',
            )}
          >
            <span
              className={cn(
                'absolute -top-3 left-1/2 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full font-display text-xs font-black text-white shadow',
                card.tone.chip,
              )}
            >
              {card.n}
            </span>
            <p className={cn('text-center font-display text-xs font-black uppercase tracking-wide', card.tone.icon)}>
              {card.label}
            </p>
            <p className="mt-1.5 text-center font-body text-sm font-semibold leading-snug text-slate-900">
              {card.value}
            </p>
          </motion.article>
        ))}
      </div>
    </BoardChrome>
  );
}
