'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Snowflake, Thermometer, X } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import type { DangerZoneItem } from './DangerZone';
import { BoardChrome, CategoryStrip, PolarityPanel } from '../primitives';
import { cn } from '@/lib/utils';
import {
  inferTemperatureSlots,
  isPniVfColdChainCorpus,
  PNI_TEMP_MARKERS,
  pniTempLabel,
} from '@/lib/slides/pniSlideUtils';

function TemperatureRail({
  trapMarkers,
  correctMarkers,
}: {
  trapMarkers: number[];
  correctMarkers: number[];
}) {
  return (
    <div
      className="flex items-center justify-between gap-0.5 rounded-xl border border-teal-200 bg-teal-50 px-2 py-1.5"
      aria-hidden
    >
      {PNI_TEMP_MARKERS.map((marker) => {
        const isTrap = trapMarkers.includes(marker);
        const isCorrect = correctMarkers.includes(marker);
        const inBand = marker >= 2 && marker <= 8;
        return (
          <div
            key={marker}
            className={cn(
              'flex min-w-0 flex-1 flex-col items-center rounded-md px-0.5 py-1',
              isTrap && 'bg-rose-200 ring-1 ring-rose-400',
              isCorrect && (inBand ? 'bg-teal-300 ring-1 ring-teal-500' : 'bg-emerald-200 ring-1 ring-emerald-500'),
              !isTrap && !isCorrect && (inBand ? 'bg-teal-100/70 opacity-80' : 'bg-white/70 opacity-50'),
            )}
          >
            <span
              className={cn(
                'font-mono text-[9px] font-black tabular-nums',
                isTrap ? 'text-rose-900' : isCorrect ? 'text-teal-900' : 'text-slate-500',
              )}
            >
              {pniTempLabel(marker)}
              {marker > 0 ? '°' : ''}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function extractLetterFromLabel(label: string): string | null {
  const match = label.match(/^Letra\s+([A-E])\b/i);
  return match?.[1]?.toUpperCase() ?? null;
}

function isTransferItem(label: string): boolean {
  return /transfer|similares/i.test(label);
}

function shortTitle(label: string, letter: string | null): string {
  if (!letter) return label.replace(/^Transferência\s*[—–-]?\s*/i, '').trim() || label;
  return label.replace(new RegExp(`^Letra\\s+${letter}\\s*[—–-]\\s*`, 'i'), '').trim() || label;
}

function TrapRow({
  index,
  item,
  prefersReducedMotion,
  showRail,
}: {
  index: number;
  item: DangerZoneItem;
  prefersReducedMotion: boolean | null;
  showRail: boolean;
}) {
  const label = item.label || item.title || `Pegadinha ${index + 1}`;
  const letter = extractLetterFromLabel(label);
  const trapText = item.detail || item.description || '';
  const correctText = typeof item.correct === 'string' ? item.correct.trim() : '';
  const { trapMarkers, correctMarkers, hasRail } = inferTemperatureSlots(label, trapText, correctText);

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: prefersReducedMotion ? 0 : index * 0.03 }}
    >
      <PolarityPanel tone="exception" emphasized={!!letter} className="!gap-2">
        <div className="flex items-center gap-2.5">
          {letter ? (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 font-body text-lg font-black text-white shadow-sm">
              {letter}
            </span>
          ) : (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
              <Thermometer className="h-4 w-4" strokeWidth={2.5} aria-hidden />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <CategoryStrip label={`Erro #${index + 1}`} tone="exception" className="mb-1 self-start" />
            <p className="font-body text-sm font-bold leading-snug text-slate-900 md:text-[15px]">
              {shortTitle(label, letter)}
            </p>
          </div>
        </div>

        {showRail && hasRail ? (
          <TemperatureRail trapMarkers={trapMarkers} correctMarkers={correctMarkers} />
        ) : null}

        {trapText ? (
          <p className="flex items-start gap-1.5 font-body text-sm leading-snug text-rose-800">
            <X className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={3} aria-hidden />
            <span>{trapText}</span>
          </p>
        ) : null}
        {correctText ? (
          <p className="flex items-start gap-1.5 rounded-xl bg-emerald-50 px-3 py-2.5 font-body text-sm font-semibold leading-snug text-emerald-900 ring-1 ring-emerald-200 md:text-[15px]">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" strokeWidth={3} aria-hidden />
            <span>{correctText}</span>
          </p>
        ) : null}
      </PolarityPanel>
    </motion.div>
  );
}

function TransferBanner({
  item,
  prefersReducedMotion,
}: {
  item: DangerZoneItem;
  prefersReducedMotion: boolean | null;
}) {
  const label = item.label || item.title || 'Transferência';
  const trapText = item.detail || item.description || '';
  const correctText = typeof item.correct === 'string' ? item.correct.trim() : '';

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <PolarityPanel tone="transfer" emphasized className="!gap-2">
        <div className="flex items-center gap-2">
          <Snowflake className="h-4 w-4 text-amber-700" aria-hidden />
          <CategoryStrip label="Transferência" tone="transfer" />
        </div>
        <p className="font-body text-base font-bold leading-snug text-slate-900">
          {shortTitle(label, null)}
        </p>
        {trapText ? (
          <p className="font-body text-sm leading-snug text-amber-900">{trapText}</p>
        ) : null}
        {correctText ? (
          <p className="flex items-start gap-1.5 rounded-xl bg-amber-50/80 px-3 py-2.5 font-body text-sm font-semibold leading-snug text-amber-950 ring-1 ring-amber-200">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" strokeWidth={3} aria-hidden />
            <span>{correctText}</span>
          </p>
        ) : null}
      </PolarityPanel>
    </motion.div>
  );
}

interface DangerZoneTemperatureMismatchProps {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  footerRule?: string;
  compareRevealMode?: LogicFlowRevealMode;
}

/** Arena aberta Glance OS — lista vertical; transferência fora; 0 taps. */
export function DangerZoneTemperatureMismatch({
  content,
  items,
  theme,
  footerRule,
}: DangerZoneTemperatureMismatchProps) {
  const prefersReducedMotion = useReducedMotion();
  const corpus = useMemo(
    () =>
      `${content} ${items.map((i) => `${i.label ?? ''} ${i.detail ?? ''} ${i.correct ?? ''}`).join(' ')}`,
    [content, items],
  );
  const vfMode = isPniVfColdChainCorpus(corpus);
  const traps = items.filter((item) => !isTransferItem(item.label || item.title || ''));
  const transfers = items.filter((item) => isTransferItem(item.label || item.title || ''));

  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.35}
      eyebrow={vfMode ? 'ARMADILHA — V/F CADEIA' : 'ARMADILHA — REDE DE FRIO'}
      title={content || undefined}
      titleClassName="text-sm font-bold uppercase tracking-wide text-rose-900 md:text-base"
      footerRule={footerRule}
      footerLabel={footerRule ? 'TRANSFERÊNCIA' : undefined}
      maxWidth="3xl"
      className="gap-3"
    >
      <div className="flex flex-col gap-2.5">
        {traps.map((item, index) => (
          <TrapRow
            key={`trap-${index}`}
            index={index}
            item={item}
            prefersReducedMotion={prefersReducedMotion}
            showRail={!vfMode}
          />
        ))}
      </div>

      {transfers.length > 0 ? (
        <div className="flex flex-col gap-2.5 border-t border-amber-200/70 pt-3">
          {transfers.map((item, index) => (
            <TransferBanner
              key={`transfer-${index}`}
              item={item}
              prefersReducedMotion={prefersReducedMotion}
            />
          ))}
        </div>
      ) : null}
    </BoardChrome>
  );
}
