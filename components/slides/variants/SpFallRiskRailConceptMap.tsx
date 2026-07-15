'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Hand, ShieldAlert } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { SlideLucideIcon } from '../core/SlideLucideIcon';
import {
  inferSpFallSlot,
  spFallSlotLabel,
  SP_FALL_RAIL_SLOTS,
  type SpFallSlot,
} from '@/lib/slides/segurancaPacienteSlideUtils';

export interface SpFallRiskConcept {
  icon: string;
  title: string;
  description: string;
}

const SLOT_STYLES: Record<
  SpFallSlot,
  { marker: string; card: string; ring: string; text: string; label: string }
> = {
  morse: {
    marker: 'bg-amber-500',
    card: 'border-amber-200 bg-amber-50/90',
    ring: 'ring-amber-400/50',
    text: 'text-amber-900',
    label: 'Escala Morse',
  },
  risk_factor: {
    marker: 'bg-orange-500',
    card: 'border-orange-200 bg-orange-50/90',
    ring: 'ring-orange-400/50',
    text: 'text-orange-900',
    label: 'Fatores de risco',
  },
  environment: {
    marker: 'bg-yellow-500',
    card: 'border-yellow-200 bg-yellow-50/90',
    ring: 'ring-yellow-400/50',
    text: 'text-yellow-900',
    label: 'Ambiente seguro',
  },
  intervention: {
    marker: 'bg-amber-600',
    card: 'border-amber-300 bg-amber-100/90',
    ring: 'ring-amber-500/60',
    text: 'text-amber-950',
    label: 'Intervenções',
  },
  bracelet: {
    marker: 'bg-rose-500',
    card: 'border-rose-200 bg-rose-50/90',
    ring: 'ring-rose-400/50',
    text: 'text-rose-900',
    label: 'Pulseira de risco',
  },
  mobility: {
    marker: 'bg-slate-500',
    card: 'border-slate-200 bg-slate-50/90',
    ring: 'ring-slate-400/50',
    text: 'text-slate-800',
    label: 'Mobilidade',
  },
  general: {
    marker: 'bg-amber-400',
    card: 'border-slate-200 bg-white/90',
    ring: 'ring-amber-300/50',
    text: 'text-slate-800',
    label: 'Prevenção de quedas',
  },
};

function markerPosition(slot: SpFallSlot): number {
  switch (slot) {
    case 'morse':
      return 0;
    case 'risk_factor':
      return 20;
    case 'environment':
      return 40;
    case 'intervention':
      return 60;
    case 'bracelet':
      return 80;
    case 'mobility':
      return 100;
    default:
      return 50;
  }
}

interface SpFallRiskRailConceptMapProps {
  concepts: SpFallRiskConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

export function SpFallRiskRailConceptMap({
  concepts,
  theme,
  footerRule,
}: SpFallRiskRailConceptMapProps) {
  const reduceMotion = useReducedMotion();
  const [activeSlots, setActiveSlots] = useState<Set<SpFallSlot>>(() => new Set());
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const mapped = useMemo(
    () =>
      concepts.map((concept) => ({
        concept,
        slot: inferSpFallSlot(concept.title, concept.description),
      })),
    [concepts],
  );

  const toggleSlot = useCallback((slot: SpFallSlot) => {
    setActiveSlots((prev) => {
      const next = new Set(prev);
      if (next.has(slot)) next.delete(slot);
      else next.add(slot);
      return next;
    });
  }, []);

  const railSlots = SP_FALL_RAIL_SLOTS.filter((s) => mapped.some((m) => m.slot === s));

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-4 md:p-6">
      <motion.div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="inline-flex w-fit min-h-[44px] items-center gap-1.5 rounded-full border border-amber-200/80 bg-white/90 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-amber-800 shadow-sm">
            <ShieldAlert className="h-3 w-3" aria-hidden />
            Trilho Morse — prevenção de quedas
          </span>
          <p className="flex items-center gap-1.5 font-body text-xs font-medium text-slate-600">
            <Hand className="h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden />
            Toque os marcadores do trilho de risco
          </p>
        </div>

        <div className="relative rounded-2xl border border-amber-200/70 bg-gradient-to-r from-amber-50/80 via-white to-orange-50/70 px-3 py-4 shadow-inner">
          <div className="absolute left-4 right-4 top-1/2 h-1 -translate-y-1/2 rounded-full bg-amber-200/80" />
          <div className="relative flex items-center justify-between gap-1">
            {(railSlots.length > 0 ? railSlots : SP_FALL_RAIL_SLOTS).map((slot) => {
              const style = SLOT_STYLES[slot];
              const isActive = activeSlots.has(slot);
              const hasConcept = mapped.some((m) => m.slot === slot);
              return (
                <button
                  key={slot}
                  type="button"
                  disabled={!hasConcept}
                  onClick={() => hasConcept && toggleSlot(slot)}
                  aria-pressed={isActive}
                  className={`relative z-10 flex min-h-[44px] min-w-[44px] flex-col items-center gap-1 rounded-xl px-1 py-1 transition-all ${
                    isActive
                      ? `scale-110 ring-2 ${style.ring} bg-white shadow-md`
                      : hasConcept
                        ? 'opacity-90 hover:opacity-100'
                        : 'opacity-35'
                  }`}
                  style={{ left: `${markerPosition(slot)}%` }}
                >
                  <span className={`h-3 w-3 rounded-full ${style.marker} shadow-sm`} />
                  <span className={`font-mono text-[7px] font-bold uppercase ${style.text}`}>
                    {spFallSlotLabel(slot)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {mapped.map(({ concept, slot }, index) => {
            const style = SLOT_STYLES[slot];
            const isExpanded = expandedIndex === index;
            const isHighlighted = activeSlots.has(slot) || activeSlots.size === 0;
            if (!isHighlighted && activeSlots.size > 0) return null;
            return (
              <motion.button
                key={`${concept.title}-${index}`}
                type="button"
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduceMotion ? 0 : index * 0.05 }}
                onClick={() => setExpandedIndex(isExpanded ? null : index)}
                className={`w-full rounded-xl border p-3 text-left shadow-sm transition-all ${style.card} ${
                  isExpanded ? `ring-2 ${style.ring}` : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${theme.iconBg} ${theme.iconText}`}
                  >
                    <SlideLucideIcon name={concept.icon} size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className={`font-mono text-[9px] font-bold uppercase tracking-widest ${style.text}`}>
                      {style.label}
                    </span>
                    <p className={`mt-0.5 font-body text-sm font-bold ${theme.textPrimary}`}>{concept.title}</p>
                    {isExpanded ? (
                      <p className={`mt-1 font-body text-sm leading-relaxed ${theme.textSecondary}`}>
                        {concept.description}
                      </p>
                    ) : (
                      <p className={`mt-1 line-clamp-2 font-body text-xs ${theme.textSecondary}`}>
                        {concept.description}
                      </p>
                    )}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {footerRule ? (
          <p
            className={`rounded-xl border px-4 py-3 text-center font-body text-sm italic leading-relaxed ${theme.borderColor} bg-white/80 ${theme.textSecondary}`}
          >
            {footerRule}
          </p>
        ) : null}
      </div>
    </div>
  );
}
