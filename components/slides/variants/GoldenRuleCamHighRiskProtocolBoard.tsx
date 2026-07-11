'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle, Check, ShieldAlert } from 'lucide-react';
import { SlideLucideIcon } from '../core/SlideLucideIcon';
import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';
import {
  inferHighRiskIconName,
  inferHighRiskRowBadge,
} from '@/lib/slides/camSlideUtils';

interface GoldenRuleCamHighRiskProtocolBoardProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

function rowTone(label: string, value: string, emphasis?: GoldenRuleRow['emphasis']): {
  card: string;
  badge: string;
  badgeText: string;
  value: string;
  Icon: typeof Check;
} {
  const badgeText = inferHighRiskRowBadge(label, value, emphasis);
  if (badgeText === 'ALERTA' || emphasis === 'alert') {
    return {
      card: 'border-l-amber-500/90 bg-gradient-to-br from-amber-50/90 via-white to-rose-50/70',
      badge: 'bg-amber-100/90 text-amber-900',
      badgeText,
      value: 'text-amber-950',
      Icon: ShieldAlert,
    };
  }
  if (badgeText === 'HOT' || emphasis === 'highlight') {
    return {
      card: 'border-l-orange-400/90 bg-gradient-to-br from-orange-50/90 via-white to-amber-50/70',
      badge: 'bg-orange-100/90 text-orange-900',
      badgeText,
      value: 'text-orange-950',
      Icon: AlertTriangle,
    };
  }
  return {
    card: 'border-l-teal-400/90 bg-gradient-to-br from-teal-50/90 via-white to-sky-50/70',
    badge: 'bg-teal-100/90 text-teal-800',
    badgeText,
    value: 'text-teal-950',
    Icon: Check,
  };
}

function ProtocolCard({ row, index }: { row: GoldenRuleRow; index: number }) {
  const reduceMotion = useReducedMotion();
  const tone = rowTone(row.label, row.value, row.emphasis);
  const StatusIcon = tone.Icon;
  const iconName = inferHighRiskIconName(`${row.label} ${row.value}`);
  const stepNum = row.label.match(/^(\d+)\./)?.[1];

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduceMotion ? 0 : index * 0.04 }}
      className={`overflow-hidden rounded-2xl border border-slate-200/70 border-l-[4px] shadow-sm ${tone.card}`}
    >
      <div className="flex items-start gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/80 shadow-sm ring-1 ring-amber-200/60">
          {stepNum ? (
            <span className="font-display text-lg font-black text-amber-800">{stepNum}</span>
          ) : (
            <SlideLucideIcon name={iconName} className="h-5 w-5 text-amber-700" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${tone.badge}`}
            >
              {tone.badgeText}
            </span>
            <StatusIcon className="h-3.5 w-3.5 text-slate-400" aria-hidden />
          </div>
          <p className="mt-1 font-display text-sm font-extrabold uppercase tracking-wide text-slate-900">
            {row.label}
          </p>
          <p className={`mt-1 font-body text-sm font-semibold leading-snug ${tone.value}`}>{row.value}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function GoldenRuleCamHighRiskProtocolBoard({
  content,
  rows,
  theme,
  footerRule,
}: GoldenRuleCamHighRiskProtocolBoardProps) {
  const reduceMotion = useReducedMotion();
  const title = content?.trim();

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-5">
      <motion.div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-40`} />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col gap-4">
        {title ? (
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-full border border-amber-200/80 bg-white/80 px-4 py-2 text-center font-mono text-[10px] font-bold uppercase tracking-widest text-amber-900 shadow-sm md:text-[11px]"
          >
            {title.length <= 72 ? title : 'ALTO RISCO — PROTOCOLO'}
          </motion.p>
        ) : null}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
          {rows.map((row, index) => (
            <ProtocolCard key={`${row.label}-${index}`} row={row} index={index} />
          ))}
        </div>

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
