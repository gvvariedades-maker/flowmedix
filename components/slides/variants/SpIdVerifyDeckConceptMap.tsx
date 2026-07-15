'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BadgeCheck, UserCheck } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { SlideLucideIcon } from '../core/SlideLucideIcon';
import {
  inferSpIdSlot,
  spIdSlotLabel,
  SP_ID_RAIL_SLOTS,
  type SpIdSlot,
} from '@/lib/slides/segurancaPacienteSlideUtils';

export interface SpIdVerifyConcept {
  icon: string;
  title: string;
  description: string;
}

const SLOT_META: Record<
  SpIdSlot,
  { label: string; border: string; badge: string; badgeText: string; ring: string; bar: string }
> = {
  two_identifiers: {
    label: 'Dois identificadores',
    border: 'border-l-amber-500/90',
    badge: 'bg-amber-100/90',
    badgeText: 'text-amber-900',
    ring: 'ring-amber-400/35',
    bar: 'bg-amber-500',
  },
  wristband: {
    label: 'Pulseira',
    border: 'border-l-orange-500/90',
    badge: 'bg-orange-100/90',
    badgeText: 'text-orange-900',
    ring: 'ring-orange-400/35',
    bar: 'bg-orange-500',
  },
  bedside: {
    label: 'Leito',
    border: 'border-l-yellow-500/90',
    badge: 'bg-yellow-100/90',
    badgeText: 'text-yellow-900',
    ring: 'ring-yellow-400/35',
    bar: 'bg-yellow-500',
  },
  homonym: {
    label: 'Homônimo',
    border: 'border-l-rose-500/90',
    badge: 'bg-rose-100/90',
    badgeText: 'text-rose-900',
    ring: 'ring-rose-400/35',
    bar: 'bg-rose-500',
  },
  barcode: {
    label: 'Código de barras',
    border: 'border-l-slate-500/90',
    badge: 'bg-slate-100/90',
    badgeText: 'text-slate-800',
    ring: 'ring-slate-400/35',
    bar: 'bg-slate-500',
  },
  wrong_patient: {
    label: 'Pegadinha',
    border: 'border-l-red-500/90',
    badge: 'bg-red-100/90',
    badgeText: 'text-red-900',
    ring: 'ring-red-400/35',
    bar: 'bg-red-500',
  },
  general: {
    label: 'Identificação segura',
    border: 'border-l-amber-400/80',
    badge: 'bg-amber-50/90',
    badgeText: 'text-amber-800',
    ring: 'ring-amber-300/30',
    bar: 'bg-amber-400',
  },
};

interface SpIdVerifyDeckConceptMapProps {
  concepts: SpIdVerifyConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

export function SpIdVerifyDeckConceptMap({
  concepts,
  theme,
  footerRule,
}: SpIdVerifyDeckConceptMapProps) {
  const [activeSlot, setActiveSlot] = useState<SpIdSlot | null>(null);

  const grouped = useMemo(() => {
    const bySlot = new Map<SpIdSlot, SpIdVerifyConcept>();
    const extras: SpIdVerifyConcept[] = [];
    for (const concept of concepts) {
      const slot = inferSpIdSlot(concept.title, concept.description);
      if (SP_ID_RAIL_SLOTS.includes(slot) || slot === 'wrong_patient') {
        if (!bySlot.has(slot)) bySlot.set(slot, concept);
        else extras.push(concept);
      } else {
        extras.push(concept);
      }
    }
    return { bySlot, extras };
  }, [concepts]);

  const railSlots = SP_ID_RAIL_SLOTS.filter((s) => grouped.bySlot.has(s));
  const activeConcept =
    (activeSlot && grouped.bySlot.get(activeSlot)) ||
    grouped.bySlot.get(railSlots[0] ?? 'two_identifiers') ||
    concepts[0];
  const activeMeta =
    SLOT_META[activeSlot ?? inferSpIdSlot(activeConcept?.title ?? '', activeConcept?.description ?? '')];

  const toggleSlot = useCallback((slot: SpIdSlot) => {
    setActiveSlot((current) => (current === slot ? null : slot));
  }, []);

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-4 md:p-6">
      <motion.div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-40`} />

      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-amber-300/70 bg-amber-50/90 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-amber-900 shadow-sm">
            <UserCheck className="h-3 w-3" aria-hidden />
            NSP — identificação segura
          </span>
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-amber-700/80">
            Toque cada identificador
          </span>
        </div>

        <div className="flex items-stretch justify-between gap-1 rounded-2xl border border-amber-200/80 bg-white/80 p-2 shadow-md shadow-amber-100/40">
          {railSlots.map((slot) => {
            const meta = SLOT_META[slot];
            const isActive = activeSlot === slot || (!activeSlot && slot === railSlots[0]);
            return (
              <button
                key={slot}
                type="button"
                onClick={() => toggleSlot(slot)}
                aria-pressed={isActive}
                className={`flex min-h-[44px] min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 transition-all duration-200 ${
                  isActive
                    ? `bg-amber-100/90 ring-2 ${meta.ring} scale-[1.02]`
                    : 'bg-white/60 opacity-75 hover:opacity-100'
                }`}
              >
                <span className={`h-1.5 w-full max-w-[2.5rem] rounded-full ${meta.bar}`} />
                <span
                  className={`text-center font-mono text-[8px] font-black uppercase leading-tight tracking-wide ${
                    isActive ? meta.badgeText : 'text-slate-500'
                  }`}
                >
                  {spIdSlotLabel(slot)}
                </span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {activeConcept ? (
            <motion.div
              key={activeConcept.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className={`overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-lg border-l-[5px] ${activeMeta.border}`}
            >
              <div className="p-4 md:p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${theme.iconBg} ${theme.iconText}`}
                    >
                      <SlideLucideIcon name={activeConcept.icon ?? 'BadgeCheck'} size={22} />
                    </div>
                    <div>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${activeMeta.badge} ${activeMeta.badgeText}`}
                      >
                        {activeMeta.label}
                      </span>
                      <h4 className={`mt-1 font-body text-base font-bold md:text-lg ${theme.textPrimary}`}>
                        {activeConcept.title}
                      </h4>
                    </div>
                  </div>
                  <BadgeCheck className="h-5 w-5 shrink-0 text-amber-600" aria-hidden />
                </div>
                <p className={`font-body text-sm leading-relaxed ${theme.textSecondary}`}>
                  {activeConcept.description}
                </p>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {grouped.extras.length > 0 ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {grouped.extras.map((concept) => {
              const slot = inferSpIdSlot(concept.title, concept.description);
              const meta = SLOT_META[slot];
              return (
                <div
                  key={concept.title}
                  className={`rounded-xl border border-slate-200/70 bg-white/90 p-3 shadow-sm border-l-[3px] ${meta.border}`}
                >
                  <div className="flex items-center gap-2">
                    <SlideLucideIcon name={concept.icon} />
                    <p className={`font-body text-sm font-bold ${theme.textPrimary}`}>{concept.title}</p>
                  </div>
                  <p className={`mt-1 font-body text-xs leading-relaxed ${theme.textSecondary}`}>
                    {concept.description}
                  </p>
                </div>
              );
            })}
          </div>
        ) : null}

        {footerRule ? (
          <p className="rounded-xl border border-amber-200/60 bg-gradient-to-r from-amber-50/90 to-orange-50/80 px-3 py-2.5 text-center font-body text-xs italic leading-relaxed text-amber-900/80 shadow-sm">
            {footerRule}
          </p>
        ) : null}
      </div>
    </div>
  );
}
