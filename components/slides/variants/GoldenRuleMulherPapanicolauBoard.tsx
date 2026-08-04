'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
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
import {
  BoardChrome,
  CategoryStrip,
  CriticalNumber,
  LabelBodyRow,
  boardTone,
  type BoardTone,
} from '../primitives';

interface GoldenRuleMulherPapanicolauBoardProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

/** Régua etária local — escala 18–64, trienal 25–64 (rastreio colo). */
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
  const tone: BoardTone = warn ? 'transfer' : hot ? 'exception' : info ? 'info' : 'neutral';
  const t = boardTone(tone);

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
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${t.badge} ${t.badgeText}`}
              >
                <SlideLucideIcon name={iconName} size={14} />
              </span>
              <span className="min-w-0 flex-1">
                {row.badge ? (
                  <CategoryStrip label={row.badge} tone={tone} className="mb-1.5 self-start" />
                ) : null}
                {rowZones.length > 0 ? (
                  <div className="mb-1.5 flex flex-wrap gap-1">
                    {rowZones.map((zone) => (
                      <CategoryStrip key={zone} label={screeningZoneLabel(zone)} tone="command" />
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

/** Papanicolau board — LabelBodyRow + AgeRulerBar local (Fábrica G2). */
export function GoldenRuleMulherPapanicolauBoard({
  content,
  rows,
  theme,
  footerRule,
}: GoldenRuleMulherPapanicolauBoardProps) {
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

  const toggleExpanded = useCallback(
    (index: number) => {
      setExpandedIndex((current) => (current === index ? null : index));
      const row = dataRows[index];
      if (row) {
        const age = screeningAgePosition(`${row.label} ${row.value}`);
        if (age !== null) setActiveAge(age);
      }
    },
    [dataRows],
  );

  const toggleZone = useCallback((zone: ScreeningSpectrumZone) => {
    setSelectedZone((current) => (current === zone ? null : zone));
    if (zone === 'trap_40') setActiveAge(40);
    if (zone === 'active_screening') setActiveAge(25);
  }, []);

  const title = content?.trim();
  const eyebrow =
    title && title.length <= 72 ? title : title ? 'Papanicolau — INCA/MS' : 'Rastreio colo · marcos';

  return (
    <BoardChrome
      theme={theme}
      eyebrow={eyebrow}
      footerRule={footerRule}
      footerLabel="Transferência de prova"
      maxWidth="3xl"
      washOpacity={0.4}
    >
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
