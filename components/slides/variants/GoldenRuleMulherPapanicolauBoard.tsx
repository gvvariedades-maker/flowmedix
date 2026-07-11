'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronDown, Microscope } from 'lucide-react';
import { SlideLucideIcon } from '../core/SlideLucideIcon';
import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';
import {
  inferPapanicolauIconName,
  inferPapanicolauRowZones,
  isPapanicolauConclusionRow,
  isPapanicolauHotRow,
  isPapanicolauInfoRow,
  isPapanicolauWarnRow,
  SCREENING_AGE_MARKERS,
  screeningAgePosition,
  screeningZoneLabel,
  screeningZoneShort,
  type ScreeningSpectrumZone,
} from '@/lib/slides/mulherPapanicolauSlideUtils';

interface GoldenRuleMulherPapanicolauBoardProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

function AgeRulerBar({ activeAge }: { activeAge: number | null }) {
  return (
    <div className="rounded-xl border border-pink-200/80 bg-pink-50/50 p-3">
      <div className="relative h-3 rounded-full bg-gradient-to-r from-slate-200 via-pink-400 to-slate-300">
        {activeAge !== null ? (
          <motion.span
            layout
            className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-600 ring-2 ring-white shadow-md"
            style={{ left: `${Math.min(100, Math.max(0, ((activeAge - 18) / (64 - 18)) * 100))}%` }}
          />
        ) : null}
        <span
          className="absolute top-1/2 h-full w-px -translate-y-1/2 bg-pink-700/40"
          style={{ left: `${((25 - 18) / (64 - 18)) * 100}%` }}
        />
        <span
          className="absolute top-1/2 h-full w-px -translate-y-1/2 bg-pink-700/40"
          style={{ left: `${((64 - 18) / (64 - 18)) * 100}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between">
        {SCREENING_AGE_MARKERS.map((age) => (
          <span
            key={age}
            className={`font-mono text-[9px] font-bold ${activeAge === age ? 'text-pink-700' : 'text-slate-500'}`}
          >
            {age}
          </span>
        ))}
      </div>
      <p className="mt-1 text-center font-mono text-[8px] font-bold uppercase tracking-widest text-pink-800">
        Rastreio 25–64 · trienal
      </p>
    </div>
  );
}

function PapanicolauRowCard({
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
  const hot = isPapanicolauHotRow(row.label, row.value, row.emphasis, row.badge);
  const warn = isPapanicolauWarnRow(row.label, row.value, row.emphasis, row.badge);
  const info = isPapanicolauInfoRow(row.badge);
  const iconName = inferPapanicolauIconName(`${row.label} ${row.value}`);
  const rowZones = inferPapanicolauRowZones(row.label, row.value);

  return (
    <motion.button
      type="button"
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: dimmed ? 0.45 : 1, y: 0 }}
      transition={{ delay: reduceMotion ? 0 : index * 0.05 }}
      onClick={onToggle}
      aria-expanded={expanded}
      className={`w-full overflow-hidden rounded-[1.25rem] border text-left shadow-sm transition-all ${
        warn
          ? 'border-amber-400/90 border-l-[4px] bg-gradient-to-br from-amber-50/90 via-white to-orange-50/70 ring-2 ring-amber-300/30'
          : hot
            ? 'border-pink-400/90 border-l-[4px] bg-gradient-to-br from-pink-50/90 via-white to-rose-50/70 ring-2 ring-pink-300/30'
            : info
              ? 'border-sky-300/80 border-l-[4px] bg-gradient-to-br from-sky-50/80 via-white to-white'
              : 'border-slate-200/70 border-l-[4px] border-l-pink-300/70 bg-white/95'
      }`}
    >
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                warn ? 'bg-amber-500 text-white' : hot ? 'bg-pink-500 text-white' : 'bg-pink-100 text-pink-800'
              }`}
            >
              <SlideLucideIcon name={iconName} size={18} />
            </div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-wide text-slate-600">{row.label}</p>
          </div>
          {row.badge ? (
            <span className="shrink-0 rounded-full bg-pink-100 px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-pink-800">
              {row.badge}
            </span>
          ) : null}
        </div>
        {rowZones.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {rowZones.map((zone) => (
              <span
                key={zone}
                className="rounded-full bg-rose-100 px-2 py-0.5 font-mono text-[9px] font-bold text-rose-900"
              >
                {screeningZoneLabel(zone)}
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

export function GoldenRuleMulherPapanicolauBoard({
  content,
  rows,
  theme,
  footerRule,
}: GoldenRuleMulherPapanicolauBoardProps) {
  const reduceMotion = useReducedMotion();
  const dataRows = rows.filter((row) => !isPapanicolauConclusionRow(row.label, row.value));
  const conclusionRows = rows.filter((row) => isPapanicolauConclusionRow(row.label, row.value));

  const [selectedZone, setSelectedZone] = useState<ScreeningSpectrumZone | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [activeAge, setActiveAge] = useState<number | null>(25);

  const activeZones = useMemo(() => {
    const set = new Set<ScreeningSpectrumZone>();
    for (const row of dataRows) {
      for (const zone of inferPapanicolauRowZones(row.label, row.value)) {
        set.add(zone);
      }
    }
    return set;
  }, [dataRows]);

  const toggleExpanded = useCallback((index: number) => {
    setExpandedIndex((current) => (current === index ? null : index));
    const row = dataRows[index];
    if (row) {
      const age = screeningAgePosition(`${row.label} ${row.value}`);
      if (age !== null) setActiveAge(age);
    }
  }, [dataRows]);

  const toggleZone = useCallback((zone: ScreeningSpectrumZone) => {
    setSelectedZone((current) => (current === zone ? null : zone));
    if (zone === 'trap_40') setActiveAge(40);
    if (zone === 'active_screening') setActiveAge(25);
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
            className="flex items-center justify-center gap-2 rounded-full border border-pink-200/80 bg-white/80 px-4 py-2 text-center font-mono text-[10px] font-bold uppercase tracking-widest text-pink-900 shadow-sm"
          >
            <Microscope className="h-4 w-4" aria-hidden />
            {title.length <= 72 ? title : 'Papanicolau — INCA/MS'}
          </motion.p>
        ) : null}

        <AgeRulerBar activeAge={activeAge} />

        {activeZones.size > 0 ? (
          <div className="flex flex-wrap justify-center gap-2">
            {Array.from(activeZones).map((zone) => (
              <button
                key={zone}
                type="button"
                onClick={() => toggleZone(zone)}
                className={`min-h-[36px] rounded-full px-3 py-1 font-mono text-[9px] font-bold uppercase transition-all ${
                  selectedZone === zone
                    ? 'bg-pink-500 text-white ring-2 ring-pink-300/60'
                    : 'bg-white/90 text-pink-800 ring-1 ring-pink-200/80'
                }`}
              >
                {screeningZoneShort(zone)}
              </button>
            ))}
          </div>
        ) : null}

        <div className="flex flex-col gap-3">
          {dataRows.map((row, index) => {
            const rowZones = inferPapanicolauRowZones(row.label, row.value);
            const dimmed =
              selectedZone !== null && rowZones.length > 0 && !rowZones.includes(selectedZone);
            return (
              <PapanicolauRowCard
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
            className="rounded-2xl border border-pink-300/80 bg-gradient-to-r from-pink-50 via-white to-rose-50 px-4 py-4 text-center shadow-md"
          >
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-pink-700">{row.label}</p>
            <p className="mt-1 font-display text-lg font-black text-pink-900 md:text-xl">{row.value}</p>
          </motion.div>
        ))}

        {footerRule ? (
          <p
            className={`rounded-xl border px-4 py-3 text-center font-body text-sm italic leading-relaxed ${theme.borderColor} ${theme.iconBg} ${theme.textSecondary}`}
          >
            {footerRule}
          </p>
        ) : null}
      </div>
    </div>
  );
}
