'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { getCompareBackFaceLabel } from '@/lib/slides/goldenRuleTypography';
import { inferSvIconName, inferSvShortLabel } from '@/lib/slides/vitalsSlideUtils';
import { SlideLucideIcon } from '../core/SlideLucideIcon';
import type { ThemeColors } from '../core/themeGenerator';
import type { DangerZoneItem } from './DangerZone';

interface DangerZoneVitalsClassifyArenaProps {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  footerRule?: string;
}

function ArenaSplitCard({
  index,
  item,
}: {
  index: number;
  item: DangerZoneItem;
}) {
  const reduceMotion = useReducedMotion();
  const label = item.label || item.title || `Pegadinha ${index + 1}`;
  const trapText = item.detail || item.description || '';
  const correctText = typeof item.correct === 'string' ? item.correct.trim() : '';
  const iconSource = `${label} ${trapText} ${correctText}`;
    const svLabel = inferSvShortLabel(iconSource);
  const correctLabel = getCompareBackFaceLabel(label, correctText);

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduceMotion ? 0 : index * 0.05 }}
      className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"
    >
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100/90">
          <SlideLucideIcon name={inferSvIconName(iconSource)} className="h-4 w-4 text-rose-700" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500">
            {svLabel}
          </p>
          <p className="truncate font-display text-xs font-bold uppercase tracking-normal text-slate-800">
            {label}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-rose-100 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-rose-800">
          ERRO #{index + 1}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="border-b border-slate-100 border-l-[3px] border-l-rose-400 bg-gradient-to-br from-rose-50/90 via-white to-white p-4 md:border-b-0 md:border-r">
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-100 text-rose-700">
              <X className="h-4 w-4" strokeWidth={3} aria-hidden />
            </span>
            <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-rose-700">
              Como a banca monta
            </p>
          </div>
          <p className="font-body text-sm font-semibold leading-relaxed text-slate-800">{trapText}</p>
        </div>

        <div className="border-l-[3px] border-l-emerald-400 bg-gradient-to-br from-emerald-50/90 via-white to-white p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Check className="h-4 w-4" strokeWidth={3} aria-hidden />
            </span>
            <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-emerald-800">
              {correctLabel}
            </p>
          </div>
          <p className="font-body text-sm font-bold leading-relaxed text-emerald-950">
            {correctText || '—'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function DangerZoneVitalsClassifyArena({
  content,
  items,
  theme,
  footerRule,
}: DangerZoneVitalsClassifyArenaProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-4 md:p-6">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 flex flex-col gap-4">
        {content ? (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <div className={`rounded-full border px-5 py-2.5 ${theme.borderColor} ${theme.iconBg}`}>
              <p
                className={`text-center font-display text-xs font-extrabold uppercase tracking-[0.12em] md:text-sm ${theme.iconText}`}
              >
                {content}
              </p>
            </div>
          </motion.div>
        ) : null}

        <div className="space-y-3">
          {items.map((item, index) => (
            <ArenaSplitCard key={index} item={item} index={index} />
          ))}
        </div>

        {footerRule ? (
          <div
            className={`rounded-xl border px-4 py-3 md:px-5 md:py-4 ${theme.borderColor} ${theme.iconBg}`}
          >
            <p
              className={`text-center font-body text-sm font-semibold leading-relaxed md:text-base ${theme.textSecondary}`}
            >
              {footerRule}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
