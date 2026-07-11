'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Check, AlertTriangle, Target } from 'lucide-react';
import { SlideLucideIcon } from '../core/SlideLucideIcon';
import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';
import {
  inferIntervalChips,
  inferPniIconName,
  inferPniMatrixRowBadge,
  inferPniRowChip,
  isPniConclusionRow,
  type PniChipColor,
} from '@/lib/slides/pniSlideUtils';

interface GoldenRulePniIntervalMatrixProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

const CHIP_STYLES: Record<PniChipColor, string> = {
  lime: 'bg-lime-100/90 text-lime-900 ring-lime-300/50',
  sky: 'bg-sky-100/90 text-sky-900 ring-sky-300/50',
  amber: 'bg-amber-100/90 text-amber-900 ring-amber-300/50',
  teal: 'bg-teal-100/90 text-teal-900 ring-teal-300/50',
  emerald: 'bg-emerald-100/90 text-emerald-900 ring-emerald-300/50',
};

function rowTone(emphasis: GoldenRuleRow['emphasis'], label: string, value: string): {
  card: string;
  badge: string;
  badgeText: string;
  value: string;
  Icon: typeof Check;
} {
  const badgeText = inferPniMatrixRowBadge(label, value, emphasis);
  if (badgeText === 'FALSA') {
    return {
      card: 'border-l-rose-400/90 bg-gradient-to-br from-rose-50/90 via-white to-orange-50/80',
      badge: 'bg-rose-100/90 text-rose-800',
      badgeText,
      value: 'text-rose-900',
      Icon: AlertTriangle,
    };
  }
  if (badgeText === 'VERDADEIRA') {
    return {
      card: 'border-l-emerald-400/90 bg-gradient-to-br from-emerald-50/90 via-white to-lime-50/80',
      badge: 'bg-emerald-100/90 text-emerald-800',
      badgeText,
      value: 'text-emerald-900',
      Icon: Check,
    };
  }
  return {
    card: 'border-l-lime-400/90 bg-gradient-to-br from-lime-50/90 via-white to-sky-50/70',
    badge: 'bg-lime-100/90 text-lime-800',
    badgeText,
    value: 'text-lime-950',
    Icon: Target,
  };
}

function extractRomanFromLabel(label: string): string | null {
  const match = label.match(/^([IVX]+)\s*[—–-]/);
  return match?.[1] ?? null;
}

function isVpcFlowRow(label: string, value: string): boolean {
  const text = `${label} ${value}`.toLowerCase();
  return /vpc13|vpp23|pneumo/.test(text);
}

function PniVpcFlowMini() {
  return (
    <div className="flex items-center justify-center gap-1 rounded-xl border border-sky-200/80 bg-sky-50/80 px-2 py-2">
      <span className="rounded-md bg-white px-2 py-1 font-mono text-[9px] font-black text-sky-900">VPC13</span>
      <span className="font-mono text-[10px] font-bold text-sky-600">→ 8SEM →</span>
      <span className="rounded-md bg-white px-2 py-1 font-mono text-[9px] font-black text-sky-900">VPP23</span>
      <span className="mx-1 text-slate-300">|</span>
      <span className="rounded-md bg-amber-50 px-2 py-1 font-mono text-[8px] font-bold text-amber-900">VPP23 1º → 1A → VPC13</span>
    </div>
  );
}

function PniMatrixCard({ row, index }: { row: GoldenRuleRow; index: number }) {
  const reduceMotion = useReducedMotion();
  const emphasis = row.emphasis ?? 'default';
  const tone = rowTone(emphasis, row.label, row.value);
  const StatusIcon = tone.Icon;
  const iconName = inferPniIconName(`${row.label} ${row.value}`);
    const chipLabel = inferPniRowChip(`${row.label} ${row.value}`);
  const extraChips = inferIntervalChips(`${row.label} ${row.value}`).slice(0, 3);
  const roman = extractRomanFromLabel(row.label);
  const showVpcFlow = isVpcFlowRow(row.label, row.value);

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
            {roman ? (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime-600 font-display text-lg font-black text-white shadow-sm">
                {roman}
              </div>
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/80 shadow-sm">
                <SlideLucideIcon name={iconName} className="h-5 w-5 text-lime-700" />
              </div>
            )}
            <div className="min-w-0">
              <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500">
                {row.label}
              </p>
              <span
                className={`mt-1 inline-flex rounded-full px-2 py-0.5 font-mono text-[10px] font-black tabular-nums ring-1 ${CHIP_STYLES[extraChips[0]?.color ?? 'lime']}`}
              >
                {extraChips[0]?.label ?? chipLabel}
              </span>
            </div>
          </div>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${tone.badge}`}
          >
            {tone.badgeText}
          </span>
        </div>

        {extraChips.length > 1 ? (
          <div className="flex flex-wrap gap-1.5">
            {extraChips.slice(1).map((chip) => (
              <span
                key={chip.label}
                className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-bold tabular-nums ring-1 ${CHIP_STYLES[chip.color]}`}
              >
                {chip.label}
              </span>
            ))}
          </div>
        ) : null}

        {showVpcFlow ? <PniVpcFlowMini /> : null}

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

export function GoldenRulePniIntervalMatrix({
  content,
  rows,
  theme,
  footerRule,
}: GoldenRulePniIntervalMatrixProps) {
  const reduceMotion = useReducedMotion();
  const dataRows = rows.filter((row) => !isPniConclusionRow(row.label, row.value));
  const conclusionRows = rows.filter((row) => isPniConclusionRow(row.label, row.value));
  const title = content?.trim();

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-5">
      <motion.div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-40`} />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col gap-4">
        {title ? (
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-full border border-lime-200/80 bg-white/80 px-4 py-2 text-center font-mono text-[10px] font-bold uppercase tracking-widest text-lime-900 shadow-sm md:text-[11px]"
          >
            {title.length <= 72 ? title : 'Referência PNI — intervalos'}
          </motion.p>
        ) : null}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
          {dataRows.map((row, index) => (
            <PniMatrixCard key={`${row.label}-${index}`} row={row} index={index} />
          ))}
        </div>

        {conclusionRows.map((row, index) => (
          <motion.div
            key={`conclusion-${index}`}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: reduceMotion ? 0 : 0.2 + index * 0.05 }}
            className="rounded-2xl border border-emerald-300/80 bg-gradient-to-r from-lime-50 via-white to-emerald-50 px-4 py-4 text-center shadow-md ring-1 ring-emerald-200/50 md:px-6 md:py-5"
          >
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-700">
              {row.label || 'Gabarito'}
            </p>
            <p className="mt-1 font-display text-xl font-black uppercase tracking-wide text-emerald-900 md:text-2xl">
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
