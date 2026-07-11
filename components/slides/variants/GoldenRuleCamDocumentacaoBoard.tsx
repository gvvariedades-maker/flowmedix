'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle, Check, FileText } from 'lucide-react';
import { SlideLucideIcon } from '../core/SlideLucideIcon';
import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';
import {
  inferCamDocumentacaoIconName,
  inferCamDocumentacaoRowBadge,
} from '@/lib/slides/camDocumentacaoSlideUtils';

interface GoldenRuleCamDocumentacaoBoardProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

function isDocExtraRow(label: string): boolean {
  const lower = label.toLowerCase();
  return /gabarito|combina[cç][aã]o|resposta final/.test(lower);
}

function rowTone(label: string, value: string, emphasis?: GoldenRuleRow['emphasis']) {
  const badgeText = inferCamDocumentacaoRowBadge(label, value, emphasis);
  if (badgeText === 'ALERTA' || emphasis === 'alert') {
    return {
      card: 'border-l-rose-400/90 bg-gradient-to-br from-rose-50/90 via-white to-orange-50/70',
      badge: 'bg-rose-100/90 text-rose-800',
      badgeText,
      value: 'text-rose-900',
      Icon: AlertTriangle,
    };
  }
  if (badgeText === '6') {
    return {
      card: 'border-l-teal-400/90 bg-gradient-to-br from-teal-50/90 via-white to-cyan-50/70',
      badge: 'bg-teal-100/90 text-teal-800',
      badgeText: 'CERTO 6',
      value: 'text-teal-950',
      Icon: Check,
    };
  }
  return {
    card: 'border-l-cyan-400/90 bg-gradient-to-br from-cyan-50/90 via-white to-sky-50/70',
    badge: 'bg-cyan-100/90 text-cyan-800',
    badgeText,
    value: 'text-cyan-950',
    Icon: FileText,
  };
}

function DocCard({ row, index }: { row: GoldenRuleRow; index: number }) {
  const reduceMotion = useReducedMotion();
  const tone = rowTone(row.label, row.value, row.emphasis);
  const StatusIcon = tone.Icon;
  const iconName = inferCamDocumentacaoIconName(`${row.label} ${row.value}`);

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduceMotion ? 0 : index * 0.04 }}
      className={`overflow-hidden rounded-2xl border border-slate-200/70 border-l-[4px] shadow-sm ${tone.card}`}
    >
      <div className="flex items-start gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/80 shadow-sm ring-1 ring-cyan-200/60">
          <SlideLucideIcon name={iconName} className="h-5 w-5 text-cyan-700" />
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

export function GoldenRuleCamDocumentacaoBoard({
  content,
  rows,
  theme,
  footerRule,
}: GoldenRuleCamDocumentacaoBoardProps) {
  const reduceMotion = useReducedMotion();
  const dataRows = rows.filter((row) => !isDocExtraRow(row.label));
  const extraRows = rows.filter((row) => isDocExtraRow(row.label));
  const title = content?.trim();

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-5">
      <motion.div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-40`} />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col gap-4">
        {title ? (
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-full border border-cyan-200/80 bg-white/80 px-4 py-2 text-center font-mono text-[10px] font-bold uppercase tracking-widest text-cyan-900 shadow-sm md:text-[11px]"
          >
            {title.length <= 72 ? title : 'REGISTRO CERTO — CERTO 6'}
          </motion.p>
        ) : null}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
          {dataRows.map((row, index) => (
            <DocCard key={`${row.label}-${index}`} row={row} index={index} />
          ))}
        </div>

        {extraRows.map((row, index) => (
          <motion.div
            key={`extra-${index}`}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: reduceMotion ? 0 : 0.2 + index * 0.05 }}
            className="rounded-2xl border border-teal-300/80 bg-gradient-to-r from-teal-50 via-white to-cyan-50 px-4 py-4 text-center shadow-md ring-1 ring-teal-200/50 md:px-6 md:py-5"
          >
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-teal-800">
              {row.label}
            </p>
            <p className="mt-1 font-display text-lg font-black uppercase tracking-wide text-teal-950 md:text-xl">
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
