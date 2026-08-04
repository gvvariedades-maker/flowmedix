'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { SlideLucideIcon } from '../core/SlideLucideIcon';
import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';
import {
  inferPrenatalIconName,
  inferPrenatalRowTrimesters,
  isPrenatalConclusionRow,
  isPrenatalHotRow,
  PRENATAL_TRIMESTER_SLOTS,
  prenatalTrimesterLabel,
  type PrenatalTrimesterSlot,
} from '@/lib/slides/mulherPrenatalSlideUtils';
import {
  BoardChrome,
  CategoryStrip,
  CriticalNumber,
  LabelBodyRow,
  type BoardTone,
} from '../primitives';

interface GoldenRuleMulherPrenatalBoardProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

function TrimesterRail({
  activeSlots,
  selectedSlot,
  onSelect,
}: {
  activeSlots: Set<PrenatalTrimesterSlot>;
  selectedSlot: PrenatalTrimesterSlot | null;
  onSelect: (slot: PrenatalTrimesterSlot) => void;
}) {
  return (
    <div
      className="flex items-center justify-between gap-0.5 rounded-xl border border-pink-200/80 bg-pink-50/60 px-2 py-2"
      role="tablist"
      aria-label="Marcos gestacionais"
    >
      {PRENATAL_TRIMESTER_SLOTS.map((slot) => {
        const isActive = activeSlots.has(slot);
        const isSelected = selectedSlot === slot;
        return (
          <button
            key={slot}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onSelect(slot)}
            className={`flex min-w-0 flex-1 flex-col items-center rounded-lg px-0.5 py-1 transition-all duration-200 ${
              isSelected
                ? 'bg-pink-500 text-white ring-2 ring-pink-300/60'
                : isActive
                  ? 'bg-white/90 text-pink-900 ring-1 ring-pink-300/50'
                  : 'bg-white/40 text-slate-400 opacity-70'
            }`}
          >
            <span className="font-mono text-[8px] font-black tabular-nums leading-tight sm:text-[9px]">
              {prenatalTrimesterLabel(slot)}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function PrenatalRowCard({
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
  const hot = isPrenatalHotRow(row.label, row.value, row.emphasis, row.badge);
  const iconName = inferPrenatalIconName(`${row.label} ${row.value}`);
  const rowSlots = inferPrenatalRowTrimesters(row.label, row.value);
  const tone: BoardTone = hot ? 'exception' : 'neutral';

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
        className={hot ? 'ring-2 ring-rose-300/40' : undefined}
        body={
          <span className="flex flex-col gap-2">
            <span className="flex items-start gap-2">
              <span
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                  hot ? 'bg-pink-500 text-white' : 'bg-pink-100 text-pink-800'
                }`}
              >
                <SlideLucideIcon name={iconName} size={14} />
              </span>
              <span className="min-w-0 flex-1">
                {row.badge ? (
                  <CategoryStrip label={row.badge} tone="exception" className="mb-1.5 self-start" />
                ) : null}
                {rowSlots.length > 0 ? (
                  <div className="mb-1.5 flex flex-wrap gap-1">
                    {rowSlots.map((slot) => (
                      <CategoryStrip key={slot} label={prenatalTrimesterLabel(slot)} tone="command" />
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

/** Pré-natal board — LabelBodyRow + TrimesterRail (Fábrica G2). */
export function GoldenRuleMulherPrenatalBoard({
  content,
  rows,
  theme,
  footerRule,
}: GoldenRuleMulherPrenatalBoardProps) {
  const dataRows = rows.filter((row) => !isPrenatalConclusionRow(row.label, row.value));
  const conclusionRows = rows.filter((row) => isPrenatalConclusionRow(row.label, row.value));

  const activeSlots = useMemo(() => {
    const set = new Set<PrenatalTrimesterSlot>();
    for (const row of dataRows) {
      for (const slot of inferPrenatalRowTrimesters(row.label, row.value)) {
        set.add(slot);
      }
    }
    return set;
  }, [dataRows]);

  const [selectedSlot, setSelectedSlot] = useState<PrenatalTrimesterSlot | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpanded = useCallback((index: number) => {
    setExpandedIndex((current) => (current === index ? null : index));
  }, []);

  const toggleSlot = useCallback((slot: PrenatalTrimesterSlot) => {
    setSelectedSlot((current) => (current === slot ? null : slot));
  }, []);

  const title = content?.trim();
  const eyebrow =
    title && title.length <= 72 ? title : title ? 'Pré-natal — Caderno AB 32' : 'Pré-natal · marcos';

  return (
    <BoardChrome
      theme={theme}
      eyebrow={eyebrow}
      footerRule={footerRule}
      footerLabel="Transferência de prova"
      maxWidth="3xl"
      washOpacity={0.4}
    >
      {activeSlots.size > 0 ? (
        <TrimesterRail activeSlots={activeSlots} selectedSlot={selectedSlot} onSelect={toggleSlot} />
      ) : null}

      <div className="flex flex-col gap-3">
        {dataRows.map((row, index) => {
          const rowSlots = inferPrenatalRowTrimesters(row.label, row.value);
          const dimmed =
            selectedSlot !== null && rowSlots.length > 0 && !rowSlots.includes(selectedSlot);
          return (
            <PrenatalRowCard
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
        return short ? (
          <div key={`conclusion-${index}`} className="flex justify-center">
            <CriticalNumber label={row.label} value={row.value} emphasis="alert" />
          </div>
        ) : (
          <div
            key={`conclusion-${index}`}
            className="rounded-2xl border-2 border-rose-400 bg-gradient-to-r from-pink-50 via-white to-rose-50 px-4 py-4 text-center shadow-md"
          >
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-rose-700">
              {row.label}
            </p>
            <p className="mt-1 font-display text-lg font-black text-rose-900 md:text-xl">{row.value}</p>
          </div>
        );
      })}
    </BoardChrome>
  );
}
