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
import { BoardChrome, CriticalNumber } from '../primitives';
import { cn } from '@/lib/utils';

interface GoldenRulePniIntervalMatrixProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

const CHIP_STYLES: Record<PniChipColor, string> = {
  lime: 'bg-lime-200 text-lime-950 ring-lime-400/60',
  sky: 'bg-sky-200 text-sky-950 ring-sky-400/60',
  amber: 'bg-amber-200 text-amber-950 ring-amber-400/60',
  teal: 'bg-teal-200 text-teal-950 ring-teal-400/60',
  emerald: 'bg-emerald-200 text-emerald-950 ring-emerald-400/60',
};

function rowTone(
  emphasis: GoldenRuleRow['emphasis'],
  label: string,
  value: string,
): {
  card: string;
  badge: string;
  badgeText: string;
  value: string;
  Icon: typeof Check;
  hot: boolean;
} {
  const badgeText = inferPniMatrixRowBadge(label, value, emphasis);
  const hot = emphasis === 'highlight' || /grace|4\s*dia|≤4/.test(`${label} ${value}`.toLowerCase());

  if (badgeText === 'FALSA') {
    return {
      card: 'border-l-rose-500 bg-gradient-to-br from-rose-50 via-white to-orange-50 border-rose-200',
      badge: 'bg-rose-600 text-white',
      badgeText,
      value: 'text-rose-900',
      Icon: AlertTriangle,
      hot: false,
    };
  }
  if (badgeText === 'VERDADEIRA') {
    return {
      card: 'border-l-emerald-500 bg-gradient-to-br from-emerald-50 via-white to-lime-50 border-emerald-200',
      badge: 'bg-emerald-600 text-white',
      badgeText,
      value: 'text-emerald-900',
      Icon: Check,
      hot: false,
    };
  }
  return {
    card: hot
      ? 'border-l-amber-500 bg-gradient-to-br from-amber-50 via-white to-lime-50 border-amber-300 ring-2 ring-amber-200/70'
      : 'border-l-lime-500 bg-gradient-to-br from-lime-50 via-white to-sky-50 border-lime-200',
    badge: hot ? 'bg-amber-600 text-white' : 'bg-lime-700 text-white',
    badgeText: hot ? 'ÂNCORA' : badgeText,
    value: 'text-slate-900',
    Icon: Target,
    hot,
  };
}

function isVpcFlowRow(label: string, value: string): boolean {
  return /vpc13|vpp23|pneumo/.test(`${label} ${value}`.toLowerCase());
}

function PniVpcFlowMini() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-1 rounded-xl border-2 border-sky-300/80 bg-sky-50 px-2 py-2">
      <span className="rounded-md bg-sky-700 px-2 py-1 font-mono text-[10px] font-black text-white">
        VPC13
      </span>
      <span className="font-mono text-[10px] font-bold text-sky-700">→ 8SEM →</span>
      <span className="rounded-md bg-sky-700 px-2 py-1 font-mono text-[10px] font-black text-white">
        VPP23
      </span>
      <span className="w-full text-center font-mono text-[9px] font-bold text-amber-800">
        VPP23 1º → 1A → VPC13
      </span>
    </div>
  );
}

function criticalFromRow(label: string, value: string): { value: string; unit?: string } | null {
  const chips = inferIntervalChips(`${label} ${value}`);
  if (chips.length === 0) return null;
  const match = chips[0].label.match(/^(\d+)([A-Z]+)?$/i);
  if (!match) return { value: chips[0].label };
  return { value: match[1], unit: match[2] };
}

function PniMatrixCard({ row, index }: { row: GoldenRuleRow; index: number }) {
  const reduceMotion = useReducedMotion();
  const emphasis = row.emphasis ?? 'default';
  const tone = rowTone(emphasis, row.label, row.value);
  const StatusIcon = tone.Icon;
  const iconName = inferPniIconName(`${row.label} ${row.value}`);
  const chipLabel = inferPniRowChip(`${row.label} ${row.value}`);
  const extraChips = inferIntervalChips(`${row.label} ${row.value}`).slice(0, 3);
  const showVpcFlow = isVpcFlowRow(row.label, row.value);
  const critical = criticalFromRow(row.label, row.value);

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduceMotion ? 0 : index * 0.05 }}
      className={cn(
        'flex min-h-[9.5rem] flex-col gap-2.5 overflow-hidden rounded-2xl border-2 border-l-[5px] p-3.5 shadow-md',
        tone.card,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {critical ? (
            <CriticalNumber
              value={critical.value}
              unit={critical.unit}
              emphasis={tone.hot ? 'alert' : 'ok'}
              className="!min-w-0 !px-2.5 !py-1.5 !shadow-md"
            />
          ) : (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
              <SlideLucideIcon name={iconName} className="h-5 w-5 text-lime-700" />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-body text-sm font-bold leading-snug text-slate-900">{row.label}</p>
            <span
              className={cn(
                'mt-1 inline-flex rounded-md px-1.5 py-0.5 font-mono text-[10px] font-black tabular-nums ring-1',
                CHIP_STYLES[extraChips[0]?.color ?? 'lime'],
              )}
            >
              {extraChips[0]?.label ?? chipLabel}
            </span>
          </div>
        </div>
        <span
          className={cn(
            'shrink-0 rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest',
            tone.badge,
          )}
        >
          {tone.badgeText}
        </span>
      </div>

      {showVpcFlow ? <PniVpcFlowMini /> : null}

      <div className="mt-auto flex items-start gap-2 rounded-xl border border-slate-200/80 bg-white/90 px-3 py-2.5 shadow-sm">
        <StatusIcon className={cn('mt-0.5 h-4 w-4 shrink-0', tone.value)} aria-hidden />
        <p className={cn('font-body text-sm font-semibold leading-snug md:text-[15px]', tone.value)}>
          {row.value}
        </p>
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
  const dataRows = rows.filter((row) => !isPniConclusionRow(row.label, row.value));
  const conclusionRows = rows.filter((row) => isPniConclusionRow(row.label, row.value));
  const title = content?.trim();

  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.35}
      eyebrow="TABELA PNI"
      title={title && title.length <= 48 ? title : undefined}
      footerRule={footerRule}
      footerLabel={footerRule ? 'DECORE' : undefined}
      maxWidth="3xl"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {dataRows.map((row, index) => (
          <PniMatrixCard key={`${row.label}-${index}`} row={row} index={index} />
        ))}
      </div>

      {conclusionRows.map((row, index) => (
        <div
          key={`conclusion-${index}`}
          className="rounded-2xl border-2 border-emerald-400 bg-gradient-to-r from-lime-50 via-white to-emerald-50 px-4 py-3 text-center shadow-md"
        >
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-700">
            {row.label || 'Gabarito'}
          </p>
          <p className="mt-1 font-body text-lg font-bold text-emerald-900 md:text-xl">{row.value}</p>
        </div>
      ))}
    </BoardChrome>
  );
}
