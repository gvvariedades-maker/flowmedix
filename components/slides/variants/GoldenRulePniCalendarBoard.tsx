'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { resolveLucideIcon } from '../core/lucideIcon';
import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';
import {
  inferCalendarRowMonths,
  inferPniIconName,
  isCalendarHotRow,
  isPniCatchUpCorpus,
  isPniConclusionRow,
  PNI_MONTH_SLOTS,
  pniMonthLabel,
} from '@/lib/slides/pniSlideUtils';

interface GoldenRulePniCalendarBoardProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

function MonthRail({
  activeMonths,
  selectedMonth,
  onSelect,
}: {
  activeMonths: Set<number>;
  selectedMonth: number | null;
  onSelect: (month: number) => void;
}) {
  return (
    <div
      className="flex items-center justify-between gap-0.5 rounded-xl border border-lime-200/80 bg-lime-50/60 px-2 py-2"
      role="tablist"
      aria-label="Marcos do calendário PNI"
    >
      {PNI_MONTH_SLOTS.map((month) => {
        const isActive = activeMonths.has(month);
        const isSelected = selectedMonth === month;
        return (
          <button
            key={month}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onSelect(month)}
            className={`flex min-w-0 flex-1 flex-col items-center rounded-lg px-0.5 py-1 transition-all duration-200 ${
              isSelected
                ? 'bg-lime-500 text-white ring-2 ring-lime-300/60'
                : isActive
                  ? 'bg-white/90 text-lime-900 ring-1 ring-lime-300/50'
                  : 'bg-white/40 text-slate-400 opacity-70'
            }`}
          >
            <span className="font-mono text-[9px] font-black tabular-nums">{pniMonthLabel(month)}</span>
          </button>
        );
      })}
    </div>
  );
}

function CalendarRowCard({
  row,
  index,
  expanded,
  onToggle,
  dimmed,
}: {
  row: GoldenRuleRow;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  dimmed: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const hot = isCalendarHotRow(row.label, row.value, row.emphasis, row.badge);
  const iconName = inferPniIconName(`${row.label} ${row.value}`);
  const Icon = resolveLucideIcon(iconName);
  const rowMonths = inferCalendarRowMonths(row.label, row.value);

  return (
    <motion.button
      type="button"
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: dimmed ? 0.45 : 1, y: 0 }}
      transition={{ delay: reduceMotion ? 0 : index * 0.05 }}
      onClick={onToggle}
      aria-expanded={expanded}
      className={`w-full overflow-hidden rounded-[1.25rem] border text-left shadow-sm transition-all ${
        hot
          ? 'border-lime-400/90 border-l-[4px] bg-gradient-to-br from-lime-50/90 via-white to-emerald-50/70 ring-2 ring-lime-300/30'
          : 'border-slate-200/70 border-l-[4px] border-l-lime-300/70 bg-white/95'
      }`}
    >
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${hot ? 'bg-lime-500 text-white' : 'bg-lime-100 text-lime-800'}`}>
              <Icon size={18} aria-hidden />
            </div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-wide text-slate-600">{row.label}</p>
          </div>
          {row.badge ? (
            <span className="shrink-0 rounded-full bg-lime-100 px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-lime-800">
              {row.badge}
            </span>
          ) : null}
        </div>
        {rowMonths.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {rowMonths.map((m) => (
              <span
                key={m}
                className="rounded-full bg-sky-100 px-2 py-0.5 font-mono text-[9px] font-bold text-sky-900"
              >
                {pniMonthLabel(m)}
              </span>
            ))}
          </div>
        ) : null}
        <p className={`font-body text-sm leading-relaxed text-slate-800 ${expanded ? '' : 'line-clamp-2'}`}>
          {row.value}
        </p>
        {!expanded ? (
          <span className="inline-flex items-center gap-1 self-start rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-slate-500">
            <ChevronDown className="h-2.5 w-2.5" aria-hidden />
            expandir
          </span>
        ) : null}
      </div>
    </motion.button>
  );
}

export function GoldenRulePniCalendarBoard({
  content,
  rows,
  theme,
  footerRule,
}: GoldenRulePniCalendarBoardProps) {
  const reduceMotion = useReducedMotion();
  const corpus = useMemo(
    () => rows.map((r) => `${r.label} ${r.value}`).join(' ') + (content ?? ''),
    [rows, content],
  );
  const catchUpMode = isPniCatchUpCorpus(corpus);
  const dataRows = rows.filter((row) => !isPniConclusionRow(row.label, row.value));
  const conclusionRows = rows.filter((row) => isPniConclusionRow(row.label, row.value));

  const activeMonths = useMemo(() => {
    const set = new Set<number>();
    for (const row of dataRows) {
      for (const m of inferCalendarRowMonths(row.label, row.value)) {
        set.add(m);
      }
    }
    return set;
  }, [dataRows]);

  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpanded = useCallback((index: number) => {
    setExpandedIndex((current) => (current === index ? null : index));
  }, []);

  const toggleMonth = useCallback((month: number) => {
    setSelectedMonth((current) => (current === month ? null : month));
  }, []);

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
            {title.length <= 72 ? title : 'Calendário PNI — referência'}
          </motion.p>
        ) : null}

        {!catchUpMode && activeMonths.size > 0 ? (
          <MonthRail
            activeMonths={activeMonths}
            selectedMonth={selectedMonth}
            onSelect={toggleMonth}
          />
        ) : null}

        {catchUpMode ? (
          <p className="rounded-xl border border-sky-200/80 bg-sky-50/80 px-3 py-2 text-center font-mono text-[10px] font-bold uppercase tracking-widest text-sky-900">
            Modo catch-up — conduta por faixa etária
          </p>
        ) : null}

        <div className="flex flex-col gap-3">
          {dataRows.map((row, index) => {
            const rowMonths = inferCalendarRowMonths(row.label, row.value);
            const dimmed =
              selectedMonth !== null &&
              rowMonths.length > 0 &&
              !rowMonths.includes(selectedMonth);
            return (
              <CalendarRowCard
                key={`${row.label}-${index}`}
                row={row}
                index={index}
                expanded={expandedIndex === index}
                onToggle={() => toggleExpanded(index)}
                dimmed={dimmed}
              />
            );
          })}
        </div>

        {conclusionRows.map((row, index) => (
          <motion.div
            key={`conclusion-${index}`}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-emerald-300/80 bg-gradient-to-r from-lime-50 via-white to-emerald-50 px-4 py-4 text-center shadow-md"
          >
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-700">
              {row.label}
            </p>
            <p className="mt-1 font-display text-lg font-black text-emerald-900 md:text-xl">{row.value}</p>
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
