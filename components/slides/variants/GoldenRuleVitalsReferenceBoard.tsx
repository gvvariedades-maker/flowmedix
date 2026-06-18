'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Check, AlertTriangle, Target } from 'lucide-react';
import { resolveLucideIcon } from '../core/lucideIcon';
import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';
import {
  extractMeasuredValue,
  inferSvIconName,
  inferSvReferenceRange,
  inferSvShortLabel,
  isConclusionRow,
} from '@/lib/slides/vitalsSlideUtils';

interface GoldenRuleVitalsReferenceBoardProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

function statusTone(emphasis: GoldenRuleRow['emphasis']): {
  card: string;
  badge: string;
  badgeText: string;
  value: string;
  Icon: typeof Check;
} {
  if (emphasis === 'alert') {
    return {
      card: 'border-l-amber-400/90 bg-gradient-to-br from-amber-50/90 via-white to-orange-50/80',
      badge: 'bg-amber-100/90 text-amber-800',
      badgeText: 'ALTERADO',
      value: 'text-amber-900',
      Icon: AlertTriangle,
    };
  }
  if (emphasis === 'success') {
    return {
      card: 'border-l-emerald-400/90 bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/80',
      badge: 'bg-emerald-100/90 text-emerald-800',
      badgeText: 'NORMAL',
      value: 'text-emerald-900',
      Icon: Check,
    };
  }
  return {
    card: 'border-l-rose-400/90 bg-gradient-to-br from-rose-50/90 via-white to-pink-50/80',
    badge: 'bg-rose-100/90 text-rose-800',
    badgeText: 'REFERÊNCIA',
    value: 'text-rose-900',
    Icon: Target,
  };
}

function VitalReferenceCard({ row, index }: { row: GoldenRuleRow; index: number }) {
  const emphasis = row.emphasis ?? 'default';
  const tone = statusTone(emphasis);
  const StatusIcon = tone.Icon;
  const iconName = inferSvIconName(`${row.label} ${row.value}`);
  const Icon = resolveLucideIcon(iconName);
  const measured = extractMeasuredValue(row.label);
  const reference = inferSvReferenceRange(`${row.label} ${row.value}`);
  const svLabel = inferSvShortLabel(`${row.label} ${row.value}`);
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduceMotion ? 0 : index * 0.06 }}
      className={`overflow-hidden rounded-[1.25rem] border border-slate-200/70 border-l-[4px] shadow-sm ${tone.card}`}
    >
      <div className="flex flex-col gap-3 p-4 md:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/80 shadow-sm">
              <Icon className="h-5 w-5 text-rose-700" aria-hidden />
            </div>
            <div>
              <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500">
                {svLabel}
              </p>
              <p className="font-display text-lg font-black tabular-nums text-slate-900 md:text-xl">
                {measured}
              </p>
            </div>
          </div>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${tone.badge}`}
          >
            {tone.badgeText}
          </span>
        </div>

        {reference ? (
          <p className="font-body text-xs text-slate-500">
            Faixa de referência:{' '}
            <span className="font-semibold text-slate-700">{reference}</span>
          </p>
        ) : null}

        <div className="flex items-center gap-2 rounded-xl border border-white/80 bg-white/70 px-3 py-2.5">
          <StatusIcon className={`h-4 w-4 shrink-0 ${tone.value}`} aria-hidden />
          <p className={`font-display text-sm font-extrabold uppercase tracking-wide md:text-base ${tone.value}`}>
            {row.value}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function GoldenRuleVitalsReferenceBoard({
  content,
  rows,
  theme,
  footerRule,
}: GoldenRuleVitalsReferenceBoardProps) {
  const reduceMotion = useReducedMotion();
  const vitalRows = rows.filter((row) => !isConclusionRow(row.label, row.value));
  const conclusionRows = rows.filter((row) => isConclusionRow(row.label, row.value));
  const title = content?.trim();

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-5">
      <motion.div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-40`} />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col gap-4">
        {title ? (
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-full border border-rose-200/80 bg-white/80 px-4 py-2 text-center font-mono text-[10px] font-bold uppercase tracking-widest text-rose-800 shadow-sm md:text-[11px]"
          >
            {title.length <= 72 ? title : 'Referência de sinais vitais'}
          </motion.p>
        ) : null}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
          {vitalRows.map((row, index) => (
            <VitalReferenceCard key={`${row.label}-${index}`} row={row} index={index} />
          ))}
        </div>

        {conclusionRows.map((row, index) => (
          <motion.div
            key={`conclusion-${index}`}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: reduceMotion ? 0 : 0.2 + index * 0.05 }}
            className="rounded-2xl border border-amber-300/80 bg-gradient-to-r from-amber-50 via-white to-yellow-50 px-4 py-4 text-center shadow-md ring-1 ring-amber-200/50 md:px-6 md:py-5"
          >
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-amber-700">
              {row.label || 'Conclusão'}
            </p>
            <p className="mt-1 font-display text-xl font-black uppercase tracking-wide text-amber-900 md:text-2xl">
              {row.value}
            </p>
          </motion.div>
        ))}

        {footerRule ? (
          <p
            className={`rounded-xl border px-4 py-3 text-center font-body text-sm italic leading-relaxed md:text-base ${theme.borderColor} ${theme.iconBg} ${theme.textSecondary}`}
          >
            {footerRule}
          </p>
        ) : null}
      </div>
    </div>
  );
}
