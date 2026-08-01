'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { SlideLucideIcon } from '../core/SlideLucideIcon';
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
import {
  BoardChrome,
  CategoryStrip,
  CriticalNumber,
  LabelBodyRow,
  type BoardTone,
} from '../primitives';

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
  const rowMonths = inferCalendarRowMonths(row.label, row.value);
  const tone: BoardTone = hot ? 'lime' : 'neutral';

  return (
    <motion.button
      type="button"
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: dimmed ? 0.45 : 1, y: 0 }}
      transition={{ delay: reduceMotion ? 0 : index * 0.05 }}
      onClick={onToggle}
      aria-expanded={expanded}
      className="w-full text-left"
    >
      <LabelBodyRow
        chip={row.label}
        tone={tone}
        className={hot ? 'ring-2 ring-lime-300/40' : undefined}
        body={
          <span className="flex flex-col gap-2">
            <span className="flex items-start gap-2">
              <span
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                  hot ? 'bg-lime-500 text-white' : 'bg-lime-100 text-lime-800'
                }`}
              >
                <SlideLucideIcon name={iconName} size={14} />
              </span>
              <span className="min-w-0 flex-1">
                {row.badge ? (
                  <CategoryStrip label={row.badge} tone="lime" className="mb-1.5 self-start" />
                ) : null}
                {rowMonths.length > 0 ? (
                  <div className="mb-1.5 flex flex-wrap gap-1">
                    {rowMonths.map((m) => (
                      <CategoryStrip key={m} label={pniMonthLabel(m)} tone="command" />
                    ))}
                  </div>
                ) : null}
                <span className={expanded ? '' : 'line-clamp-2'}>{row.value}</span>
              </span>
            </span>
            {!expanded ? (
              <span className="inline-flex items-center gap-1 self-start font-mono text-[9px] font-bold uppercase text-slate-500">
                <ChevronDown className="h-2.5 w-2.5" aria-hidden />
                expandir
              </span>
            ) : null}
          </span>
        }
      />
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
  const eyebrow =
    title && title.length <= 72
      ? title
      : title
        ? 'Calendário PNI — referência'
        : undefined;

  return (
    <BoardChrome theme={theme} maxWidth="3xl" eyebrow={eyebrow} footerRule={footerRule}>
      {!catchUpMode && activeMonths.size > 0 ? (
        <MonthRail
          activeMonths={activeMonths}
          selectedMonth={selectedMonth}
          onSelect={toggleMonth}
        />
      ) : null}

      {catchUpMode ? (
        <CategoryStrip
          label="Modo catch-up — conduta por faixa etária"
          tone="command"
          className="self-center px-3 py-1.5 text-[10px]"
        />
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

      {conclusionRows.map((row, index) => {
        const short = row.value.trim().length <= 24;
        return (
          <motion.div
            key={`conclusion-${index}`}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-emerald-300/80 bg-gradient-to-r from-lime-50 via-white to-emerald-50 px-4 py-4 text-center shadow-md"
          >
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-700">
              {row.label}
            </p>
            {short ? (
              <div className="mt-2 flex justify-center">
                <CriticalNumber value={row.value} emphasis="ok" />
              </div>
            ) : (
              <p className="mt-1 font-display text-lg font-black text-emerald-900 md:text-xl">
                {row.value}
              </p>
            )}
          </motion.div>
        );
      })}
    </BoardChrome>
  );
}
