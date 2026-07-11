'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { SlideLucideIcon } from '../core/SlideLucideIcon';
import {
  inferPlanejamentoZoneMarker,
  planejamentoZoneLabel,
  planejamentoZoneShort,
  PLANEJAMENTO_METHOD_ZONES,
  type PlanejamentoMethodZone,
} from '@/lib/slides/mulherPlanejamentoSlideUtils';

export interface ContraceptionConcept {
  icon: string;
  title: string;
  description: string;
}

const ZONE_META: Record<
  PlanejamentoMethodZone,
  { bar: string; ring: string; panel: string; text: string }
> = {
  behavioral: {
    bar: 'from-sky-400 to-sky-200',
    ring: 'ring-sky-300/60',
    panel: 'from-sky-50/95 via-white to-blue-50/90',
    text: 'text-sky-900',
  },
  hormonal: {
    bar: 'from-pink-500 to-rose-300',
    ring: 'ring-pink-400/70',
    panel: 'from-pink-50/95 via-white to-rose-50/90',
    text: 'text-pink-900',
  },
  barrier: {
    bar: 'from-violet-400 to-violet-200',
    ring: 'ring-violet-300/60',
    panel: 'from-violet-50/95 via-white to-purple-50/90',
    text: 'text-violet-900',
  },
  larc: {
    bar: 'from-emerald-400 to-emerald-200',
    ring: 'ring-emerald-300/60',
    panel: 'from-emerald-50/95 via-white to-teal-50/90',
    text: 'text-emerald-900',
  },
  trap_oral: {
    bar: 'from-amber-400 to-orange-200',
    ring: 'ring-amber-400/60',
    panel: 'from-amber-50/95 via-white to-orange-50/90',
    text: 'text-amber-900',
  },
};

interface MulherContraceptionSpectrumConceptMapProps {
  concepts: ContraceptionConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

export function MulherContraceptionSpectrumConceptMap({
  concepts,
  theme,
  footerRule,
}: MulherContraceptionSpectrumConceptMapProps) {
  const grouped = useMemo(() => {
    const zones: Partial<Record<PlanejamentoMethodZone, ContraceptionConcept[]>> = {};
    const extras: ContraceptionConcept[] = [];

    for (const concept of concepts) {
      const inferred = inferPlanejamentoZoneMarker(concept.title, concept.description);
      const zone = inferred.zone;
      if (zone) {
        zones[zone] = [...(zones[zone] ?? []), concept];
      } else {
        extras.push(concept);
      }
    }
    return { zones, extras };
  }, [concepts]);

  const zonesOnSpectrum = PLANEJAMENTO_METHOD_ZONES.filter(
    (z) => (grouped.zones[z]?.length ?? 0) > 0,
  );
  const defaultZone = zonesOnSpectrum.includes('behavioral')
    ? 'behavioral'
    : zonesOnSpectrum[0] ?? 'behavioral';

  const [activeZone, setActiveZone] = useState<PlanejamentoMethodZone>(defaultZone);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const activeConcepts =
    (grouped.zones[activeZone]?.length ?? 0) > 0
      ? grouped.zones[activeZone]!
      : grouped.extras.length > 0
        ? grouped.extras
        : concepts;

  const activeMeta = ZONE_META[activeZone];

  const selectZone = useCallback((zone: PlanejamentoMethodZone) => {
    setActiveZone(zone);
    setExpandedIndex(null);
  }, []);

  const toggleExpanded = useCallback((index: number) => {
    setExpandedIndex((current) => (current === index ? null : index));
  }, []);

  if (concepts.length === 0) return null;

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-5">
      <motion.div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col gap-3">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-pink-200/80 bg-white/90 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-pink-800 shadow-sm">
          <Heart className="h-3 w-3" aria-hidden />
          Planejamento familiar — categorias
        </span>

        {zonesOnSpectrum.length > 1 ? (
          <div className="flex flex-wrap gap-2">
            {zonesOnSpectrum.map((zone) => {
              const meta = ZONE_META[zone];
              const isActive = activeZone === zone;
              return (
                <button
                  key={zone}
                  type="button"
                  onClick={() => selectZone(zone)}
                  className={`min-h-[44px] rounded-xl border px-3 py-2 transition-all ${
                    isActive
                      ? `border-2 bg-white shadow-md ${meta.ring} ring-2`
                      : 'border-slate-200/90 bg-white/80 shadow-sm'
                  }`}
                >
                  <span className={`font-mono text-[10px] font-black ${meta.text}`}>
                    {planejamentoZoneShort(zone)}
                  </span>
                  <span className="mt-0.5 block text-[8px] font-bold uppercase text-slate-500">
                    {planejamentoZoneLabel(zone)}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}

        <AnimatePresence mode="wait">
          <motion.div
            key={activeZone}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className={`overflow-hidden rounded-[1.5rem] border border-pink-200/70 bg-gradient-to-br ${activeMeta.panel} p-3 shadow-md`}
          >
            <div className="flex flex-col gap-2">
              {activeConcepts.map((concept, index) => {
                const marker = inferPlanejamentoZoneMarker(concept.title, concept.description);
                const expanded = expandedIndex === index;
                return (
                  <button
                    key={`${concept.title}-${index}`}
                    type="button"
                    onClick={() => toggleExpanded(index)}
                    aria-expanded={expanded}
                    className={`w-full rounded-xl border text-left transition-all ${
                      marker.focus
                        ? 'border-pink-400/80 bg-white ring-2 ring-pink-300/30'
                        : 'border-white/80 bg-white/90'
                    }`}
                  >
                    <div className="flex gap-2 p-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${theme.iconBg} ${theme.iconText}`}
                      >
                        <SlideLucideIcon name={concept.icon} size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h4
                            className={`font-display text-xs font-extrabold uppercase ${theme.textPrimary}`}
                          >
                            {concept.title}
                          </h4>
                          {marker.zone ? (
                            <span
                              className={`rounded-full px-2 py-0.5 font-mono text-[8px] font-bold ${
                                marker.focus
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-pink-100 text-pink-800'
                              }`}
                            >
                              {marker.label}
                            </span>
                          ) : null}
                        </div>
                        <p
                          className={`mt-1 font-body text-sm leading-relaxed ${theme.textSecondary} ${
                            expanded ? '' : 'line-clamp-2'
                          }`}
                        >
                          {concept.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {footerRule ? (
          <p
            className={`rounded-xl border px-4 py-3 text-center font-body text-sm italic ${theme.borderColor} ${theme.iconBg} ${theme.textSecondary}`}
          >
            {footerRule}
          </p>
        ) : null}
      </div>
    </div>
  );
}
