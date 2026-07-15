'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, FileWarning } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { SlideLucideIcon } from '../core/SlideLucideIcon';
import {
  inferSpIncidentSlot,
  spIncidentSlotLabel,
  SP_INCIDENT_DECK_SLOTS,
  type SpIncidentSlot,
} from '@/lib/slides/segurancaPacienteSlideUtils';

export interface SpIncidentTaxonomyConcept {
  icon: string;
  title: string;
  description: string;
}

const SLOT_META: Record<
  SpIncidentSlot,
  { label: string; border: string; badge: string; badgeText: string; ring: string; bar: string }
> = {
  adverse_event: {
    label: 'Evento adverso',
    border: 'border-l-rose-500/90',
    badge: 'bg-rose-100/90',
    badgeText: 'text-rose-900',
    ring: 'ring-rose-400/35',
    bar: 'bg-rose-500',
  },
  incident: {
    label: 'Incidente',
    border: 'border-l-amber-500/90',
    badge: 'bg-amber-100/90',
    badgeText: 'text-amber-900',
    ring: 'ring-amber-400/35',
    bar: 'bg-amber-500',
  },
  near_miss: {
    label: 'Quase erro',
    border: 'border-l-orange-500/90',
    badge: 'bg-orange-100/90',
    badgeText: 'text-orange-900',
    ring: 'ring-orange-400/35',
    bar: 'bg-orange-500',
  },
  no_harm: {
    label: 'Sem dano',
    border: 'border-l-yellow-500/90',
    badge: 'bg-yellow-100/90',
    badgeText: 'text-yellow-900',
    ring: 'ring-yellow-400/35',
    bar: 'bg-yellow-500',
  },
  notification: {
    label: 'Notificação',
    border: 'border-l-slate-500/90',
    badge: 'bg-slate-100/90',
    badgeText: 'text-slate-800',
    ring: 'ring-slate-400/35',
    bar: 'bg-slate-500',
  },
  culture: {
    label: 'Cultura NSP',
    border: 'border-l-emerald-500/90',
    badge: 'bg-emerald-100/90',
    badgeText: 'text-emerald-900',
    ring: 'ring-emerald-400/35',
    bar: 'bg-emerald-500',
  },
  general: {
    label: 'PNSP',
    border: 'border-l-amber-400/80',
    badge: 'bg-amber-50/90',
    badgeText: 'text-amber-800',
    ring: 'ring-amber-300/30',
    bar: 'bg-amber-400',
  },
};

interface SpIncidentTaxonomyDeckConceptMapProps {
  concepts: SpIncidentTaxonomyConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

export function SpIncidentTaxonomyDeckConceptMap({
  concepts,
  theme,
  footerRule,
}: SpIncidentTaxonomyDeckConceptMapProps) {
  const [activeSlot, setActiveSlot] = useState<SpIncidentSlot | null>(null);

  const grouped = useMemo(() => {
    const bySlot = new Map<SpIncidentSlot, SpIncidentTaxonomyConcept>();
    const extras: SpIncidentTaxonomyConcept[] = [];
    for (const concept of concepts) {
      const slot = inferSpIncidentSlot(concept.title, concept.description);
      if (SP_INCIDENT_DECK_SLOTS.includes(slot)) {
        if (!bySlot.has(slot)) bySlot.set(slot, concept);
        else extras.push(concept);
      } else {
        extras.push(concept);
      }
    }
    return { bySlot, extras };
  }, [concepts]);

  const deckSlots = SP_INCIDENT_DECK_SLOTS.filter((s) => grouped.bySlot.has(s));
  const activeConcept =
    (activeSlot && grouped.bySlot.get(activeSlot)) ||
    grouped.bySlot.get(deckSlots[0] ?? 'adverse_event') ||
    concepts[0];
  const activeMeta =
    SLOT_META[
      activeSlot ?? inferSpIncidentSlot(activeConcept?.title ?? '', activeConcept?.description ?? '')
    ];

  const toggleSlot = useCallback((slot: SpIncidentSlot) => {
    setActiveSlot((current) => (current === slot ? null : slot));
  }, []);

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-4 md:p-6">
      <motion.div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-40`} />

      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-amber-300/70 bg-amber-50/90 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-amber-900 shadow-sm">
            <FileWarning className="h-3 w-3" aria-hidden />
            PNSP — 4 grupos de incidente
          </span>
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-amber-700/80">
            Toque cada grupo
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {deckSlots.map((slot) => {
            const meta = SLOT_META[slot];
            const isActive = activeSlot === slot || (!activeSlot && slot === deckSlots[0]);
            return (
              <button
                key={slot}
                type="button"
                onClick={() => toggleSlot(slot)}
                aria-pressed={isActive}
                className={`flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-xl border px-2 py-2 transition-all ${
                  isActive
                    ? `border-2 bg-white shadow-lg ${meta.ring} ring-2`
                    : 'border-slate-200/90 bg-white/80 shadow-sm hover:shadow-md'
                }`}
              >
                <span className={`h-1.5 w-full max-w-[3rem] rounded-full ${meta.bar}`} />
                <span
                  className={`text-center font-mono text-[8px] font-black uppercase leading-tight ${meta.badgeText}`}
                >
                  {spIncidentSlotLabel(slot)}
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
                      <SlideLucideIcon name={activeConcept.icon ?? 'AlertTriangle'} size={22} />
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
                  <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" aria-hidden />
                </div>
                <p className={`font-body text-sm leading-relaxed ${theme.textSecondary}`}>
                  {activeConcept.description}
                </p>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {grouped.extras.length > 0 ? (
          <div className="grid grid-cols-1 gap-2">
            {grouped.extras.map((concept) => {
              const slot = inferSpIncidentSlot(concept.title, concept.description);
              const meta = SLOT_META[slot];
              return (
                <div
                  key={concept.title}
                  className={`rounded-xl border border-slate-200/70 bg-white/90 p-3 shadow-sm border-l-[3px] ${meta.border}`}
                >
                  <p className={`font-body text-sm font-bold ${theme.textPrimary}`}>{concept.title}</p>
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
