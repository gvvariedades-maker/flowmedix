'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Tags } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';
import {
  inferTriageColor,
  triageColorLabel,
  type TriageColor,
} from '@/lib/slides/urgenciasManchesterSlideUtils';

const COLOR_META: Record<
  TriageColor,
  { bar: string; ring: string; panel: string; text: string }
> = {
  vermelho: {
    bar: 'bg-red-500',
    ring: 'ring-red-400/50',
    panel: 'from-red-50/95 via-white to-rose-50/90',
    text: 'text-red-900',
  },
  amarelo: {
    bar: 'bg-yellow-400',
    ring: 'ring-yellow-400/50',
    panel: 'from-yellow-50/95 via-white to-amber-50/90',
    text: 'text-yellow-900',
  },
  verde: {
    bar: 'bg-emerald-500',
    ring: 'ring-emerald-400/50',
    panel: 'from-emerald-50/95 via-white to-green-50/90',
    text: 'text-emerald-900',
  },
  azul: {
    bar: 'bg-sky-500',
    ring: 'ring-sky-400/50',
    panel: 'from-sky-50/95 via-white to-blue-50/90',
    text: 'text-sky-900',
  },
  preto: {
    bar: 'bg-slate-700',
    ring: 'ring-slate-400/50',
    panel: 'from-slate-50/95 via-white to-gray-50/90',
    text: 'text-slate-900',
  },
  alerta: {
    bar: 'bg-amber-500',
    ring: 'ring-amber-400/50',
    panel: 'from-amber-50/95 via-white to-orange-50/90',
    text: 'text-amber-900',
  },
  geral: {
    bar: 'bg-slate-400',
    ring: 'ring-slate-300/50',
    panel: 'from-slate-50/95 via-white to-gray-50/90',
    text: 'text-slate-800',
  },
};

interface GoldenRuleUrgenciasManchesterBoardProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

export function GoldenRuleUrgenciasManchesterBoard({
  content,
  rows,
  theme,
  footerRule,
}: GoldenRuleUrgenciasManchesterBoardProps) {
  const reduceMotion = useReducedMotion();
  const [selected, setSelected] = useState(() => {
    const hotIdx = rows.findIndex((r) => r.badge === 'hot' || r.emphasis === 'highlight');
    return hotIdx >= 0 ? hotIdx : 0;
  });

  const rowColors = useMemo(
    () => rows.map((row) => inferTriageColor(row.label ?? '', row.value ?? '')),
    [rows],
  );

  const activeRow = rows[selected];
  const activeColor = rowColors[selected] ?? 'geral';
  const meta = COLOR_META[activeColor];

  const selectRow = useCallback((index: number) => setSelected(index), []);

  if (!activeRow) return null;

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-4 md:p-6">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col gap-4">
        {content ? (
          <p className="text-center font-display text-lg font-black uppercase tracking-wide text-red-900 md:text-xl">
            {content.length <= 40 ? content : 'Cores da triagem'}
          </p>
        ) : null}

        <div className="flex h-3 overflow-hidden rounded-full shadow-inner">
          {(['vermelho', 'amarelo', 'verde', 'azul'] as TriageColor[]).map((color) => (
            <div key={color} className={`flex-1 ${COLOR_META[color].bar}`} />
          ))}
        </div>

        <div className="flex flex-col gap-2">
          {rows.map((row, index) => {
            const color = rowColors[index] ?? 'geral';
            const rowMeta = COLOR_META[color];
            const isActive = selected === index;
            return (
              <button
                key={index}
                type="button"
                onClick={() => selectRow(index)}
                className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all ${
                  isActive
                    ? `border-2 bg-white shadow-md ${rowMeta.ring} ring-2`
                    : 'border-slate-200/90 bg-white/80 hover:shadow-sm'
                }`}
              >
                <span
                  className={`h-8 w-2 shrink-0 rounded-full ${rowMeta.bar}`}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className={`font-mono text-[9px] font-bold uppercase tracking-widest ${rowMeta.text}`}>
                    {triageColorLabel(color)}
                  </p>
                  <p className="font-body text-sm font-semibold text-slate-900">{row.label}</p>
                </div>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selected}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`overflow-hidden rounded-2xl border-2 border-white/80 bg-gradient-to-br shadow-lg ${meta.panel} ${meta.ring} ring-1`}
          >
            <div className="border-b border-black/5 px-4 py-3">
              <p className={`font-mono text-[9px] font-extrabold uppercase tracking-widest ${meta.text}`}>
                {triageColorLabel(activeColor)}
              </p>
              <h3 className="font-body text-sm font-semibold text-slate-900">{activeRow.label}</h3>
            </div>
            <p className="px-4 py-3 font-body text-sm leading-relaxed text-slate-700">{activeRow.value}</p>
          </motion.div>
        </AnimatePresence>

        {footerRule ? (
          <p
            className={`rounded-xl border px-4 py-3 text-center font-body text-sm font-medium italic leading-relaxed ${theme.borderColor} bg-white/80 ${theme.textSecondary}`}
          >
            {footerRule}
          </p>
        ) : null}
      </div>
    </div>
  );
}
