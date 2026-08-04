'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { SlideLucideIcon } from '../core/SlideLucideIcon';
import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';
import {
  inferPlanejamentoIconName,
  inferPlanejamentoRowZones,
  isPlanejamentoConclusionRow,
  isPlanejamentoHotRow,
  isPlanejamentoWarnRow,
  PLANEJAMENTO_METHOD_ZONES,
  planejamentoZoneLabel,
  type PlanejamentoMethodZone,
} from '@/lib/slides/mulherPlanejamentoSlideUtils';
import {
  BoardChrome,
  CategoryStrip,
  CriticalNumber,
  LabelBodyRow,
  type BoardTone,
} from '../primitives';

interface GoldenRuleMulherPlanejamentoBoardProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

function MethodZoneRail({
  activeZones,
  selectedZone,
  onSelect,
}: {
  activeZones: Set<PlanejamentoMethodZone>;
  selectedZone: PlanejamentoMethodZone | null;
  onSelect: (zone: PlanejamentoMethodZone) => void;
}) {
  return (
    <div
      className="flex items-center justify-between gap-0.5 rounded-xl border border-pink-200/80 bg-pink-50/60 px-2 py-2"
      role="tablist"
      aria-label="Categorias contraceptivas"
    >
      {PLANEJAMENTO_METHOD_ZONES.map((zone) => {
        const isActive = activeZones.has(zone);
        const isSelected = selectedZone === zone;
        return (
          <button
            key={zone}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onSelect(zone)}
            className={`flex min-w-0 flex-1 flex-col items-center rounded-lg px-0.5 py-1 transition-all duration-200 ${
              isSelected
                ? 'bg-pink-500 text-white ring-2 ring-pink-300/60'
                : isActive
                  ? 'bg-white/90 text-pink-900 ring-1 ring-pink-300/50'
                  : 'bg-white/40 text-slate-400 opacity-70'
            }`}
          >
            <span className="text-center font-mono text-[7px] font-black leading-tight sm:text-[8px]">
              {planejamentoZoneLabel(zone)}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function PlanejamentoRowCard({
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
  const hot = isPlanejamentoHotRow(row.label, row.value, row.emphasis, row.badge);
  const warn = isPlanejamentoWarnRow(row.label, row.value, row.emphasis, row.badge);
  const iconName = inferPlanejamentoIconName(`${row.label} ${row.value}`);
  const rowZones = inferPlanejamentoRowZones(row.label, row.value);
  const tone: BoardTone = warn ? 'warn' : hot ? 'exception' : 'neutral';

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
                  hot ? 'bg-pink-500 text-white' : warn ? 'bg-amber-500 text-white' : 'bg-pink-100 text-pink-800'
                }`}
              >
                <SlideLucideIcon name={iconName} size={14} />
              </span>
              <span className="min-w-0 flex-1">
                {row.badge ? (
                  <CategoryStrip
                    label={row.badge}
                    tone={warn ? 'warn' : 'exception'}
                    className="mb-1.5 self-start"
                  />
                ) : null}
                {rowZones.length > 0 ? (
                  <div className="mb-1.5 flex flex-wrap gap-1">
                    {rowZones.map((zone) => (
                      <CategoryStrip
                        key={zone}
                        label={planejamentoZoneLabel(zone)}
                        tone={zone === 'trap_oral' ? 'warn' : 'command'}
                      />
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

/** Planejamento familiar board — LabelBodyRow + MethodZoneRail (Fábrica G2). */
export function GoldenRuleMulherPlanejamentoBoard({
  content,
  rows,
  theme,
  footerRule,
}: GoldenRuleMulherPlanejamentoBoardProps) {
  const dataRows = rows.filter((row) => !isPlanejamentoConclusionRow(row.label, row.value));
  const conclusionRows = rows.filter((row) => isPlanejamentoConclusionRow(row.label, row.value));

  const activeZones = useMemo(() => {
    const set = new Set<PlanejamentoMethodZone>();
    for (const row of dataRows) {
      for (const zone of inferPlanejamentoRowZones(row.label, row.value)) {
        set.add(zone);
      }
    }
    return set;
  }, [dataRows]);

  const [selectedZone, setSelectedZone] = useState<PlanejamentoMethodZone | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpanded = useCallback((index: number) => {
    setExpandedIndex((current) => (current === index ? null : index));
  }, []);

  const toggleZone = useCallback((zone: PlanejamentoMethodZone) => {
    setSelectedZone((current) => (current === zone ? null : zone));
  }, []);

  const title = content?.trim();
  const eyebrow = title && title.length <= 72 ? title : 'Planejamento familiar — MS';

  return (
    <BoardChrome
      theme={theme}
      eyebrow={eyebrow}
      footerRule={footerRule}
      footerLabel="Transferência de prova"
      maxWidth="3xl"
      washOpacity={0.4}
    >
      {activeZones.size > 0 ? (
        <MethodZoneRail activeZones={activeZones} selectedZone={selectedZone} onSelect={toggleZone} />
      ) : null}

      <div className="flex flex-col gap-3">
        {dataRows.map((row, index) => {
          const rowZones = inferPlanejamentoRowZones(row.label, row.value);
          const dimmed =
            selectedZone !== null && rowZones.length > 0 && !rowZones.includes(selectedZone);
          return (
            <PlanejamentoRowCard
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
