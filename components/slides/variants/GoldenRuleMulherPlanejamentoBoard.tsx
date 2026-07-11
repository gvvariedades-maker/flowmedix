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
          ? 'border-pink-400/90 border-l-[4px] bg-gradient-to-br from-pink-50/90 via-white to-rose-50/70 ring-2 ring-pink-300/30'
          : warn
            ? 'border-amber-400/90 border-l-[4px] bg-gradient-to-br from-amber-50/90 via-white to-orange-50/70 ring-2 ring-amber-300/30'
            : 'border-slate-200/70 border-l-[4px] border-l-pink-300/70 bg-white/95'
      }`}
    >
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                hot
                  ? 'bg-pink-500 text-white'
                  : warn
                    ? 'bg-amber-500 text-white'
                    : 'bg-pink-100 text-pink-800'
              }`}
            >
              <SlideLucideIcon name={iconName} size={18} />
            </div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-wide text-slate-600">
              {row.label}
            </p>
          </div>
          {row.badge ? (
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase ${
                warn ? 'bg-amber-100 text-amber-800' : 'bg-pink-100 text-pink-800'
              }`}
            >
              {row.badge}
            </span>
          ) : null}
        </div>
        {rowZones.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {rowZones.map((zone) => (
              <span
                key={zone}
                className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-bold ${
                  zone === 'trap_oral'
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-rose-100 text-rose-900'
                }`}
              >
                {planejamentoZoneLabel(zone)}
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

export function GoldenRuleMulherPlanejamentoBoard({
  content,
  rows,
  theme,
  footerRule,
}: GoldenRuleMulherPlanejamentoBoardProps) {
  const reduceMotion = useReducedMotion();
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
  const displayTitle =
    title && title.length <= 72 ? title : 'Planejamento familiar — MS';

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-5">
      <motion.div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-40`} />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col gap-4">
        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-full border border-pink-200/80 bg-white/80 px-4 py-2 text-center font-mono text-[10px] font-bold uppercase tracking-widest text-pink-900 shadow-sm md:text-[11px]"
        >
          {displayTitle}
        </motion.p>

        {activeZones.size > 0 ? (
          <MethodZoneRail
            activeZones={activeZones}
            selectedZone={selectedZone}
            onSelect={toggleZone}
          />
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

        {conclusionRows.map((row, index) => (
          <motion.div
            key={`conclusion-${index}`}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-rose-300/80 bg-gradient-to-r from-pink-50 via-white to-rose-50 px-4 py-4 text-center shadow-md"
          >
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-rose-700">
              {row.label}
            </p>
            <p className="mt-1 font-display text-lg font-black text-rose-900 md:text-xl">{row.value}</p>
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
