'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Clock, Scale, Stethoscope, UserRound } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { BoardChrome } from '../primitives';
import { cn } from '@/lib/utils';

type HubRow = {
  label?: string;
  value?: string;
  badge?: string;
};

interface GoldenRuleAdolescentDevVigilanceBoardProps {
  content?: string;
  rows?: HubRow[];
  theme: ThemeColors;
  footerRule?: string;
}

const ICONS = [UserRound, Scale, Stethoscope, Clock] as const;

/**
 * Slide 3 desenvolvimento — estilo “Vigilância epidemiológica”:
 * header mostarda + chunks + pares lavanda/apricot. Estático.
 */
export function GoldenRuleAdolescentDevVigilanceBoard({
  content,
  rows = [],
  theme,
  footerRule,
}: GoldenRuleAdolescentDevVigilanceBoardProps) {
  const reduceMotion = useReducedMotion();

  const cards = useMemo(
    () =>
      rows.slice(0, 4).map((row, index) => ({
        key: `${row.label}-${index}`,
        label: (row.label || `Marco ${index + 1}`).trim(),
        value: (row.value || '').trim(),
      })),
    [rows],
  );

  if (cards.length === 0 && !content) return null;

  return (
    <BoardChrome theme={theme} washOpacity={0.14} maxWidth="lg">
      <header className="text-center">
        <h2 className="font-display text-sm font-black uppercase tracking-widest text-slate-500">
          Vigilância puberal
        </h2>
      </header>

      <div className="rounded-2xl bg-[#D4A017] px-3 py-3 text-center shadow-md">
        <p className="font-display text-sm font-black leading-snug text-white md:text-base">
          {content || 'Atraso na puberdade — marcos cronológicos'}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {['idade-limite', 'exame físico', 'Tanner'].map((chip) => (
          <span
            key={chip}
            className="rounded-xl bg-amber-50 px-3 py-1.5 font-display text-xs font-black uppercase tracking-wide text-amber-900 ring-1 ring-amber-200"
          >
            {chip}
          </span>
        ))}
      </div>

      <div className="rounded-2xl bg-rose-100/90 px-3 py-2.5 text-center">
        <p className="font-body text-sm font-semibold text-rose-950">
          com a finalidade de investigar e encaminhar se:
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {cards.map((card, index) => {
          const Icon = ICONS[index % ICONS.length]!;
          return (
            <motion.article
              key={card.key}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduceMotion ? 0 : index * 0.04 }}
              className="flex flex-col items-center gap-2"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md ring-2 ring-violet-200">
                <Icon className="h-5 w-5 text-violet-700" aria-hidden />
              </span>
              <div className="w-full rounded-2xl bg-violet-100 px-3 py-2 text-center">
                <p className="font-display text-xs font-black uppercase tracking-wide text-violet-900">
                  {card.label}
                </p>
              </div>
              <div className="h-2 w-px bg-slate-700" aria-hidden />
              <div className="w-full rounded-2xl bg-orange-50 px-3 py-2.5 text-center ring-1 ring-orange-100">
                <p className="font-body text-sm font-semibold leading-snug text-slate-900">
                  {card.value}
                </p>
              </div>
            </motion.article>
          );
        })}
      </div>

      {footerRule ? (
        <div
          className={cn(
            'rounded-2xl border-2 border-[#D4A017]/50 bg-amber-50/80 px-3 py-2.5 text-center',
          )}
        >
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-amber-900">
            Fixação
          </p>
          <p className="mt-0.5 font-body text-xs font-semibold leading-snug text-slate-800 md:text-sm">
            {footerRule}
          </p>
        </div>
      ) : null}
    </BoardChrome>
  );
}
