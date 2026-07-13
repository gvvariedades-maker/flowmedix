'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Hand } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';
import {
  inferZRailSlot,
  zRailSlotLabel,
  Z_RAIL_MARKERS,
  type ZRailSlot,
} from '@/lib/slides/adolescentAntropometriaSlideUtils';

export interface GrowthZRailConcept {
  icon: string;
  title: string;
  description: string;
}

const SLOT_STYLES: Record<
  ZRailSlot,
  { marker: string; card: string; ring: string; text: string }
> = {
  tool: {
    marker: 'bg-sky-500',
    card: 'border-sky-200 bg-sky-50/90',
    ring: 'ring-sky-400/50',
    text: 'text-sky-900',
  },
  metric: {
    marker: 'bg-cyan-500',
    card: 'border-cyan-200 bg-cyan-50/90',
    ring: 'ring-cyan-400/50',
    text: 'text-cyan-900',
  },
  band_overweight: {
    marker: 'bg-sky-600',
    card: 'border-sky-300 bg-sky-100/90',
    ring: 'ring-sky-500/60',
    text: 'text-sky-950',
  },
  action: {
    marker: 'bg-teal-500',
    card: 'border-teal-200 bg-teal-50/90',
    ring: 'ring-teal-400/50',
    text: 'text-teal-900',
  },
  band_severe_low: {
    marker: 'bg-amber-500',
    card: 'border-amber-200 bg-amber-50/90',
    ring: 'ring-amber-400/50',
    text: 'text-amber-900',
  },
  band_severe_high: {
    marker: 'bg-rose-500',
    card: 'border-rose-200 bg-rose-50/90',
    ring: 'ring-rose-400/50',
    text: 'text-rose-900',
  },
  pegadinha: {
    marker: 'bg-orange-500',
    card: 'border-orange-200 bg-orange-50/90',
    ring: 'ring-orange-400/50',
    text: 'text-orange-900',
  },
  general: {
    marker: 'bg-slate-400',
    card: 'border-slate-200 bg-white/90',
    ring: 'ring-slate-300/50',
    text: 'text-slate-800',
  },
};

function markerForSlot(slot: ZRailSlot): number {
  switch (slot) {
    case 'band_severe_low':
      return -3;
    case 'metric':
      return 0;
    case 'band_overweight':
      return 1.5;
    case 'band_severe_high':
      return 3;
    case 'pegadinha':
      return 2;
    default:
      return 0;
  }
}

interface AdolescentGrowthZRailConceptMapProps {
  concepts: GrowthZRailConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

export function AdolescentGrowthZRailConceptMap({
  concepts,
  theme,
  footerRule,
}: AdolescentGrowthZRailConceptMapProps) {
  const reduceMotion = useReducedMotion();
  const [activeSlots, setActiveSlots] = useState<Set<ZRailSlot>>(() => new Set());
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const mapped = useMemo(
    () =>
      concepts.map((concept) => ({
        concept,
        slot: inferZRailSlot(concept.title, concept.description),
      })),
    [concepts],
  );

  const toggleSlot = useCallback((slot: ZRailSlot) => {
    setActiveSlots((prev) => {
      const next = new Set(prev);
      if (next.has(slot)) next.delete(slot);
      else next.add(slot);
      return next;
    });
  }, []);

  if (concepts.length === 0) return null;

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 flex flex-col gap-4">
        <div className="text-center">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-sky-700">
            Caderneta — escore Z (5–19 anos)
          </p>
        </div>

        <div
          role="status"
          className="flex flex-col items-center gap-1.5 rounded-xl border border-amber-200/80 bg-amber-50/90 px-3 py-2.5 text-center"
        >
          <p className="flex items-center justify-center gap-2 font-body text-xs font-semibold text-amber-950">
            <Hand className="h-3.5 w-3.5 shrink-0 text-amber-700" aria-hidden />
            Toque nos marcos do trilho ou nos cards abaixo
          </p>
          <p className="font-body text-[11px] leading-relaxed text-amber-900/85">
            Cada card liga um conceito (ferramenta, Z, sobrepeso, conduta) ao ponto certo da curva OMS.
          </p>
        </div>

        <div className="overflow-x-auto pb-1">
          <div className="min-w-[320px] px-2">
            <div className="relative flex h-14 items-center justify-between">
              <div className="absolute left-2 right-2 top-1/2 h-1 -translate-y-1/2 rounded-full bg-sky-200/80" />
              {Z_RAIL_MARKERS.map((marker) => {
                const lit = mapped.some(
                  ({ slot }) => activeSlots.has(slot) && Math.abs(markerForSlot(slot) - marker) < 1.1,
                );
                return (
                  <button
                    key={marker}
                    type="button"
                    onClick={() => {
                      const hit = mapped.find(
                        ({ slot }) => Math.abs(markerForSlot(slot) - marker) < 1.1,
                      );
                      if (hit) toggleSlot(hit.slot);
                    }}
                    className={`relative z-10 flex h-11 min-w-[44px] flex-col items-center justify-center rounded-xl border-2 transition-all ${
                      lit
                        ? 'border-sky-500 bg-sky-100 shadow-md ring-2 ring-sky-300/60'
                        : 'border-slate-200 bg-white/90'
                    }`}
                    aria-label={`Marca Z ${marker}`}
                  >
                    <span className="font-mono text-[11px] font-black tabular-nums text-slate-800">
                      {marker > 0 ? `+${marker}` : marker}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {mapped.map(({ concept, slot }, index) => {
            const styles = SLOT_STYLES[slot];
            const Icon = resolveLucideIcon(concept.icon);
            const expanded = expandedIndex === index;
            const active = activeSlots.has(slot);

            return (
              <motion.button
                key={index}
                type="button"
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduceMotion ? 0 : index * 0.05 }}
                onClick={() => {
                  toggleSlot(slot);
                  setExpandedIndex(expanded ? null : index);
                }}
                className={`min-h-[44px] rounded-2xl border p-3 text-left shadow-sm transition-all ${styles.card} ${
                  active ? `ring-2 ${styles.ring}` : ''
                }`}
              >
                <div className="flex items-start gap-2">
                  <span
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${styles.marker}`}
                  >
                    <Icon className="h-4 w-4 text-white" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`font-mono text-[9px] font-bold uppercase tracking-widest ${styles.text}`}>
                      {zRailSlotLabel(slot)}
                    </p>
                    <p className={`font-display text-sm font-extrabold ${styles.text}`}>{concept.title}</p>
                    <p className={`mt-1 font-body text-xs leading-relaxed text-slate-700 ${expanded ? '' : 'line-clamp-2'}`}>
                      {concept.description}
                    </p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {footerRule ? (
          <p className="rounded-xl border border-sky-200/80 bg-white/80 px-3 py-2 text-center font-body text-xs font-semibold text-sky-900">
            {footerRule}
          </p>
        ) : null}
      </div>
    </div>
  );
}
