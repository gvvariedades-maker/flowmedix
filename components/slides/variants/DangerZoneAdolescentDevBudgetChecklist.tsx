'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle, Sparkles } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import type { DangerZoneItem } from './DangerZone';
import { BoardChrome } from '../primitives';
import { cn } from '@/lib/utils';

interface DangerZoneAdolescentDevBudgetChecklistProps {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
}

type Row = {
  key: string;
  label: string;
  detail: string;
  correct: string;
};

/**
 * Slide 4 desenvolvimento — estilo “fricção antisséptica” (Anvisa/hand hygiene):
 * header ouro + caixas amarelas + barra ouro + Atenção! Estático (0 taps).
 */
export function DangerZoneAdolescentDevBudgetChecklist({
  content,
  items,
  theme,
  footerRule,
}: DangerZoneAdolescentDevBudgetChecklistProps) {
  const reduceMotion = useReducedMotion();

  const { lead, pair, wide, bar, subtitle } = useMemo(() => {
    const rows: Row[] = items.map((item, index) => ({
      key: `${item.label}-${index}`,
      label: (item.label || item.title || `Pegadinha ${index + 1}`).trim(),
      detail: (item.detail || item.description || '').trim(),
      correct: typeof item.correct === 'string' ? item.correct.trim() : '',
    }));

    const lead = rows[0];
    const pair = rows.slice(1, 3);
    const wide = rows[3] ?? rows[2];
    const bar =
      lead?.correct ||
      'Gabarito Certo (A) — os limiares cronológicos do enunciado estão corretos';
    const subtitle =
      lead?.detail ||
      'Identifique a pegadinha antes de marcar Errado no C/E de puberdade.';

    return { lead, pair, wide, bar, subtitle };
  }, [items]);

  if (items.length === 0) return null;

  return (
    <BoardChrome theme={theme} washOpacity={0.1} maxWidth="lg">
      {/* Header amarelo + título ouro */}
      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-[#FFF4C8] px-3 py-3 sm:px-4"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#C9A227] text-white shadow-md">
            <AlertTriangle className="h-6 w-6" aria-hidden />
          </span>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="rounded-xl bg-[#C9A227] px-3 py-2.5 text-center shadow-sm">
              <p className="font-display text-sm font-black leading-snug text-white md:text-[15px]">
                {content || 'Pegadinhas — puberdade tardia (C/E)'}
              </p>
            </div>
            <p className="text-center font-body text-sm font-semibold leading-snug text-slate-800">
              {subtitle}
            </p>
          </div>
        </div>
      </motion.section>

      {/* Dois cards lado a lado */}
      {pair.length > 0 ? (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {pair.map((row, index) => (
            <motion.article
              key={row.key}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduceMotion ? 0 : 0.04 + index * 0.03 }}
              className="rounded-2xl border border-[#C9A227]/55 bg-[#FFF7D6] px-3 py-3 text-center"
            >
              <p className="font-display text-sm font-black text-slate-900">{row.label}</p>
              <p className="mt-1 font-body text-sm font-semibold leading-snug text-slate-700">
                {row.detail}
              </p>
              {row.correct ? (
                <p className="mt-2 font-body text-xs font-bold leading-snug text-emerald-800">
                  {row.correct}
                </p>
              ) : null}
            </motion.article>
          ))}
        </div>
      ) : null}

      {/* Caixa larga */}
      {wide ? (
        <motion.article
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-[#C9A227]/55 bg-[#FFF7D6] px-3 py-3 text-center"
        >
          <p className="font-display text-sm font-black text-slate-900">{wide.label}</p>
          <p className="mt-1 font-body text-sm font-semibold leading-snug text-slate-700">
            {wide.detail}
          </p>
          {wide.correct ? (
            <p className="mt-2 font-body text-sm font-bold leading-snug text-emerald-800">
              {wide.correct}
            </p>
          ) : null}
        </motion.article>
      ) : null}

      {/* Barra ouro — regra-chave / gabarito */}
      <div className="rounded-2xl bg-[#C9A227] px-3 py-2.5 text-center shadow-md">
        <p className="inline-flex items-center justify-center gap-2 font-display text-sm font-black text-white md:text-base">
          <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
          {bar}
        </p>
      </div>

      {/* Atenção! */}
      <div className="space-y-1.5 text-center">
        <p className="font-display text-lg font-black text-red-600">Atenção!</p>
        <div
          className={cn(
            'rounded-2xl border border-[#C9A227]/55 bg-[#FFF7D6] px-3 py-3',
          )}
        >
          <p className="font-body text-sm font-bold leading-snug text-slate-900">
            {footerRule ||
              lead?.correct ||
              'Não marque Errado só porque os números parecem “específicos demais”.'}
          </p>
        </div>
      </div>
    </BoardChrome>
  );
}
