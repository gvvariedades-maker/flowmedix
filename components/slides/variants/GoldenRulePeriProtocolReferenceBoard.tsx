'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { SlideLucideIcon } from '../core/SlideLucideIcon';
import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';
import {
  inferPeriRowProtocolSlots,
  periProtocolSlotLabel,
  PERI_PROTOCOL_WHO,
  type PeriProtocolSlot,
} from '@/lib/slides/perioperatoriaSlideUtils';

const PROTOCOL_RAIL: PeriProtocolSlot[] = [...PERI_PROTOCOL_WHO, 'cdc', 'assepsia'];

interface GoldenRulePeriProtocolReferenceBoardProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

function ProtocolSlotRail({
  activeSlots,
  selectedSlot,
  onSelect,
}: {
  activeSlots: Set<PeriProtocolSlot>;
  selectedSlot: PeriProtocolSlot | null;
  onSelect: (slot: PeriProtocolSlot) => void;
}) {
  return (
    <div
      className="flex flex-wrap items-center justify-center gap-1 rounded-xl border border-violet-200/80 bg-violet-50/60 px-2 py-2"
      role="tablist"
      aria-label="Protocolo WHO e CDC"
    >
      {PROTOCOL_RAIL.map((slot) => {
        const isActive = activeSlots.has(slot);
        const isSelected = selectedSlot === slot;
        return (
          <button
            key={slot}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onSelect(slot)}
            className={`rounded-full px-2 py-1 font-mono text-[9px] font-black transition-all ${
              isSelected
                ? 'bg-violet-500 text-white ring-2 ring-violet-300/60'
                : isActive
                  ? 'bg-white/90 text-violet-900 ring-1 ring-violet-300/50'
                  : 'bg-white/40 text-slate-400 opacity-70'
            }`}
          >
            {periProtocolSlotLabel(slot)}
          </button>
        );
      })}
    </div>
  );
}

export function GoldenRulePeriProtocolReferenceBoard({
  content,
  rows,
  theme,
  footerRule,
}: GoldenRulePeriProtocolReferenceBoardProps) {
  const reduceMotion = useReducedMotion();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<PeriProtocolSlot | null>(null);

  const activeSlots = useMemo(() => {
    const slots = new Set<PeriProtocolSlot>();
    rows.forEach((row) => {
      inferPeriRowProtocolSlots(row.label, row.value).forEach((s) => slots.add(s));
    });
    if (slots.size === 0) PROTOCOL_RAIL.forEach((s) => slots.add(s));
    return slots;
  }, [rows]);

  const toggleExpanded = useCallback((index: number) => {
    setExpandedIndex((current) => (current === index ? null : index));
  }, []);

  if (rows.length === 0) return null;

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 flex flex-col gap-3">
        {content ? (
          <p className="text-center font-display text-base font-bold text-violet-950">{content}</p>
        ) : null}

        <ProtocolSlotRail activeSlots={activeSlots} selectedSlot={selectedSlot} onSelect={setSelectedSlot} />

        <div className="flex flex-col gap-2">
          {rows.map((row, index) => {
            const rowSlots = inferPeriRowProtocolSlots(row.label, row.value);
            const expanded = expandedIndex === index;
            const dimmed =
              selectedSlot !== null && rowSlots.length > 0 && !rowSlots.includes(selectedSlot);
            const hot = /sign[\s-]?in|time[\s-]?out|sign[\s-]?out|cdc|who/i.test(`${row.label} ${row.value}`);

            return (
              <motion.button
                key={index}
                type="button"
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: dimmed ? 0.45 : 1, y: 0 }}
                transition={{ delay: reduceMotion ? 0 : index * 0.05 }}
                onClick={() => toggleExpanded(index)}
                aria-expanded={expanded}
                className={`w-full overflow-hidden rounded-[1.25rem] border text-left shadow-sm ${
                  hot
                    ? 'border-violet-400/90 border-l-[4px] bg-gradient-to-br from-violet-50/90 via-white to-indigo-50/70 ring-2 ring-violet-300/30'
                    : 'border-slate-200/70 border-l-[4px] border-l-violet-300/70 bg-white/95'
                }`}
              >
                <div className="flex flex-col gap-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap gap-1">
                        {rowSlots.map((slot) => (
                          <span
                            key={slot}
                            className="rounded-full bg-violet-100 px-2 py-0.5 font-mono text-[9px] font-bold text-violet-800"
                          >
                            {periProtocolSlotLabel(slot)}
                          </span>
                        ))}
                      </div>
                      <p className="font-display text-sm font-bold text-slate-900">{row.label}</p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-700">{row.value}</p>
                    </div>
                    <SlideLucideIcon name="CheckSquare" className="h-5 w-5 shrink-0 text-violet-600" />
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
                    />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {footerRule ? (
          <p className="text-center text-xs font-medium text-violet-800/80">{footerRule}</p>
        ) : null}
      </div>
    </div>
  );
}
