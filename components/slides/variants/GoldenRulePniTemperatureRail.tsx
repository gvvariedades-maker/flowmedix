'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { SlideLucideIcon } from '../core/SlideLucideIcon';
import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';
import {
  inferPniIconName,
  inferTemperatureRowMarkers,
  isPniConclusionRow,
  isPniVfColdChainCorpus,
  isTemperatureHotRow,
  PNI_TEMP_MARKERS,
  pniTempLabel,
} from '@/lib/slides/pniSlideUtils';

interface GoldenRulePniTemperatureRailProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

function TemperatureRail({
  activeMarkers,
  selectedMarker,
  onSelect,
}: {
  activeMarkers: Set<number>;
  selectedMarker: number | null;
  onSelect: (marker: number) => void;
}) {
  return (
    <div
      className="flex items-center justify-between gap-0.5 rounded-xl border border-teal-200/80 bg-teal-50/60 px-2 py-2"
      role="tablist"
      aria-label="Marcadores de temperatura PNI"
    >
      {PNI_TEMP_MARKERS.map((marker) => {
        const isActive = activeMarkers.has(marker);
        const isSelected = selectedMarker === marker;
        const inCoreBand = marker >= 2 && marker <= 8;
        return (
          <button
            key={marker}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onSelect(marker)}
            className={`flex min-w-0 flex-1 flex-col items-center rounded-lg px-0.5 py-1 transition-all duration-200 ${
              isSelected
                ? 'bg-teal-600 text-white ring-2 ring-teal-300/60'
                : inCoreBand && isActive
                  ? 'bg-teal-400/90 text-white ring-1 ring-teal-300/50'
                  : isActive
                    ? 'bg-white/90 text-teal-900 ring-1 ring-teal-200/50'
                    : 'bg-white/40 text-slate-400 opacity-70'
            }`}
          >
            <span className="font-mono text-[9px] font-black tabular-nums">
              {pniTempLabel(marker)}
              {marker > 0 ? '°C' : ''}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function TemperatureRowCard({
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
  const hot = isTemperatureHotRow(row.label, row.value, row.emphasis, row.badge);
  const iconName = inferPniIconName(`${row.label} ${row.value}`);
    const rowMarkers = inferTemperatureRowMarkers(row.label, row.value);

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
          ? 'border-teal-400/90 border-l-[4px] bg-gradient-to-br from-teal-50/90 via-white to-cyan-50/70 ring-2 ring-teal-300/30'
          : 'border-slate-200/70 border-l-[4px] border-l-teal-300/70 bg-white/95'
      }`}
    >
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                hot ? 'bg-teal-600 text-white' : 'bg-teal-100 text-teal-800'
              }`}
            >
              <SlideLucideIcon name={iconName} size={18} />
            </div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-wide text-slate-600">
              {row.label}
            </p>
          </div>
          {row.badge ? (
            <span className="shrink-0 rounded-full bg-teal-100 px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-teal-800">
              {row.badge}
            </span>
          ) : null}
        </div>
        {rowMarkers.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {rowMarkers.map((m) => (
              <span
                key={m}
                className="rounded-full bg-cyan-100 px-2 py-0.5 font-mono text-[9px] font-bold text-cyan-900"
              >
                {pniTempLabel(m)}°C
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

export function GoldenRulePniTemperatureRail({
  content,
  rows,
  theme,
  footerRule,
}: GoldenRulePniTemperatureRailProps) {
  const reduceMotion = useReducedMotion();
  const corpus = useMemo(
    () => rows.map((r) => `${r.label} ${r.value}`).join(' ') + (content ?? ''),
    [rows, content],
  );
  const vfMode = isPniVfColdChainCorpus(corpus);
  const dataRows = rows.filter((row) => !isPniConclusionRow(row.label, row.value));
  const conclusionRows = rows.filter((row) => isPniConclusionRow(row.label, row.value));

  const activeMarkers = useMemo(() => {
    const set = new Set<number>();
    for (const row of dataRows) {
      for (const m of inferTemperatureRowMarkers(row.label, row.value)) {
        set.add(m);
      }
    }
    if (set.size === 0) {
      set.add(2);
      set.add(8);
    }
    return set;
  }, [dataRows]);

  const [selectedMarker, setSelectedMarker] = useState<number | null>(null);
  const hotIndex = useMemo(
    () =>
      dataRows.findIndex((row) =>
        isTemperatureHotRow(row.label, row.value, row.emphasis, row.badge),
      ),
    [dataRows],
  );
  const [expandedIndex, setExpandedIndex] = useState<number | 'auto'>('auto');
  const resolvedExpanded =
    expandedIndex === 'auto' ? (hotIndex >= 0 ? hotIndex : null) : expandedIndex;

  const toggleExpanded = useCallback((index: number) => {
    setExpandedIndex((current) => {
      const open = current === 'auto' ? hotIndex : current;
      return open === index ? 'auto' : index;
    });
  }, [hotIndex]);

  const toggleMarker = useCallback((marker: number) => {
    setSelectedMarker((current) => (current === marker ? null : marker));
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
            className="rounded-full border border-teal-200/80 bg-white/80 px-4 py-2 text-center font-mono text-[10px] font-bold uppercase tracking-widest text-teal-900 shadow-sm md:text-[11px]"
          >
            {title.length <= 72 ? title : 'Rede de frio — referência PNI'}
          </motion.p>
        ) : null}

        {/* Rail 2–8 sempre: gesto do ramo, mesmo em corpus V/F. */}
        <TemperatureRail
          activeMarkers={activeMarkers}
          selectedMarker={selectedMarker}
          onSelect={toggleMarker}
        />
        {vfMode ? (
          <p className="rounded-xl border border-teal-200/80 bg-teal-50/80 px-3 py-2 text-center font-mono text-[10px] font-bold uppercase tracking-widest text-teal-900">
            V/F — assertivas da sala de vacina
          </p>
        ) : null}

        <div className="flex flex-col gap-3">
          {dataRows.map((row, index) => {
            const rowMarkers = inferTemperatureRowMarkers(row.label, row.value);
            const dimmed =
              selectedMarker !== null &&
              rowMarkers.length > 0 &&
              !rowMarkers.includes(selectedMarker);
            return (
              <TemperatureRowCard
                key={`${row.label}-${index}`}
                row={row}
                index={index}
                expanded={resolvedExpanded === index}
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
            className="rounded-2xl border border-emerald-300/80 bg-gradient-to-r from-teal-50 via-white to-emerald-50 px-4 py-4 text-center shadow-md"
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
