'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { SlideLucideIcon } from '../core/SlideLucideIcon';
import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';
import {
  inferPartoIconName,
  inferPartoRowPhases,
  isPartoConclusionRow,
  isPartoHotRow,
  isPartoOkRow,
  isPartoWarnRow,
  LABOR_PHASE_SLOTS,
  laborPhaseLabel,
  laborPhaseShort,
  type LaborPhaseSlot,
} from '@/lib/slides/mulherPartoSlideUtils';
import { BoardChrome, CategoryStrip, CriticalNumber, LabelBodyRow, type BoardTone } from '../primitives';

interface GoldenRuleMulherPartoHumanizadoBoardProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

function PhaseRail({
  activePhases,
  selectedPhase,
  onSelect,
}: {
  activePhases: Set<LaborPhaseSlot>;
  selectedPhase: LaborPhaseSlot | null;
  onSelect: (phase: LaborPhaseSlot) => void;
}) {
  return (
    <div
      className="grid grid-cols-4 gap-1 rounded-xl border border-pink-200/80 bg-pink-50/60 p-2"
      role="tablist"
      aria-label="Fases do trabalho de parto"
    >
      {LABOR_PHASE_SLOTS.map((slot) => {
        const isActive = activePhases.has(slot);
        const isSelected = selectedPhase === slot;
        return (
          <button
            key={slot}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onSelect(slot)}
            className={`flex min-h-[40px] flex-col items-center justify-center rounded-lg px-0.5 py-1 transition-all ${
              isSelected
                ? 'bg-pink-500 text-white ring-2 ring-pink-300/60'
                : isActive
                  ? 'bg-white/90 text-pink-900 ring-1 ring-pink-300/50'
                  : 'bg-white/40 text-slate-400 opacity-70'
            }`}
          >
            <span className="font-mono text-[8px] font-black leading-tight sm:text-[9px]">
              {laborPhaseShort(slot)}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function PartoRowCard({
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
  const hot = isPartoHotRow(row.label, row.value, row.emphasis, row.badge);
  const warn = isPartoWarnRow(row.label, row.value, row.emphasis, row.badge);
  const ok = isPartoOkRow(row.badge);
  const iconName = inferPartoIconName(`${row.label} ${row.value}`);
  const rowPhases = inferPartoRowPhases(row.label, row.value);
  const tone: BoardTone = warn ? 'warn' : hot ? 'exception' : ok ? 'ok' : 'neutral';
  const badgeTone: BoardTone = warn ? 'warn' : ok ? 'ok' : 'exception';

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
        body={
          <span className="flex flex-col gap-2">
            <span className="flex items-start gap-2">
              <span
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                  hot || warn ? 'bg-pink-500 text-white' : 'bg-pink-100 text-pink-800'
                }`}
              >
                <SlideLucideIcon name={iconName} size={14} />
              </span>
              <span className="min-w-0 flex-1">
                {row.badge ? (
                  <CategoryStrip label={row.badge} tone={badgeTone} className="mb-1.5 self-start" />
                ) : null}
                {rowPhases.length > 0 ? (
                  <div className="mb-1.5 flex flex-wrap gap-1">
                    {rowPhases.map((phase) => (
                      <CategoryStrip key={phase} label={laborPhaseLabel(phase)} tone="command" />
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

/** Parto humanizado board — LabelBodyRow + PhaseRail (Fábrica G2). */
export function GoldenRuleMulherPartoHumanizadoBoard({
  content,
  rows,
  theme,
  footerRule,
}: GoldenRuleMulherPartoHumanizadoBoardProps) {
  const dataRows = rows.filter((row) => !isPartoConclusionRow(row.label, row.value));
  const conclusionRows = rows.filter((row) => isPartoConclusionRow(row.label, row.value));

  const activePhases = useMemo(() => {
    const set = new Set<LaborPhaseSlot>();
    for (const row of dataRows) {
      for (const phase of inferPartoRowPhases(row.label, row.value)) {
        set.add(phase);
      }
    }
    return set;
  }, [dataRows]);

  const [selectedPhase, setSelectedPhase] = useState<LaborPhaseSlot | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpanded = useCallback((index: number) => {
    setExpandedIndex((current) => (current === index ? null : index));
  }, []);

  const togglePhase = useCallback((phase: LaborPhaseSlot) => {
    setSelectedPhase((current) => (current === phase ? null : phase));
  }, []);

  const title = content?.trim();
  const eyebrow = title && title.length <= 72 ? title : 'Parto humanizado · OMS';

  return (
    <BoardChrome
      theme={theme}
      eyebrow={eyebrow}
      footerRule={footerRule}
      footerLabel="Transferência de prova"
      maxWidth="3xl"
      washOpacity={0.4}
    >
      {activePhases.size > 0 ? (
        <PhaseRail activePhases={activePhases} selectedPhase={selectedPhase} onSelect={togglePhase} />
      ) : null}

      <div className="flex flex-col gap-3">
        {dataRows.map((row, index) => {
          const rowPhases = inferPartoRowPhases(row.label, row.value);
          const dimmed =
            selectedPhase !== null && rowPhases.length > 0 && !rowPhases.includes(selectedPhase);
          return (
            <PartoRowCard
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
            className="rounded-2xl border-2 border-fuchsia-400 bg-gradient-to-r from-pink-50 via-white to-fuchsia-50 px-4 py-4 text-center shadow-md"
          >
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-fuchsia-700">
              {row.label}
            </p>
            <p className="mt-1 font-display text-lg font-black text-fuchsia-900 md:text-xl">{row.value}</p>
          </div>
        );
      })}
    </BoardChrome>
  );
}
