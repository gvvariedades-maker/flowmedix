'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ribbon } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { SlideLucideIcon } from '../core/SlideLucideIcon';
import {
  inferMamaZoneMarker,
  MAMA_AGE_MARKERS,
  mamaZoneLabel,
  mamaZoneShort,
  type MamaSpectrumZone,
} from '@/lib/slides/mulherMamaSlideUtils';

export interface MammographyConcept {
  icon: string;
  title: string;
  description: string;
}

const ZONE_META: Record<
  MamaSpectrumZone,
  { bar: string; ring: string; panel: string; text: string }
> = {
  autoexame_awareness: {
    bar: 'from-sky-400 to-sky-200',
    ring: 'ring-sky-300/60',
    panel: 'from-sky-50/95 via-white to-blue-50/90',
    text: 'text-sky-900',
  },
  pre_screening: {
    bar: 'from-slate-300 to-slate-200',
    ring: 'ring-slate-300/60',
    panel: 'from-slate-50/95 via-white to-slate-50/90',
    text: 'text-slate-700',
  },
  active_screening: {
    bar: 'from-pink-500 to-rose-300',
    ring: 'ring-pink-400/70',
    panel: 'from-pink-50/95 via-white to-rose-50/90',
    text: 'text-pink-900',
  },
  trap_40: {
    bar: 'from-amber-400 to-amber-200',
    ring: 'ring-amber-400/60',
    panel: 'from-amber-50/95 via-white to-orange-50/90',
    text: 'text-amber-900',
  },
  trap_annual: {
    bar: 'from-orange-400 to-orange-200',
    ring: 'ring-orange-300/60',
    panel: 'from-orange-50/95 via-white to-amber-50/90',
    text: 'text-orange-900',
  },
  autoexame_substitute: {
    bar: 'from-rose-400 to-rose-200',
    ring: 'ring-rose-300/60',
    panel: 'from-rose-50/95 via-white to-red-50/90',
    text: 'text-rose-900',
  },
};

const SPECTRUM_ZONES: MamaSpectrumZone[] = [
  'autoexame_awareness',
  'pre_screening',
  'active_screening',
  'trap_40',
  'trap_annual',
  'autoexame_substitute',
];

interface MulherMammographySpectrumConceptMapProps {
  concepts: MammographyConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

function AgeRuler({ highlightAge }: { highlightAge: number | null }) {
  return (
    <div className="relative rounded-xl border border-pink-200/80 bg-white/90 px-3 py-3">
      <div className="relative h-2 rounded-full bg-gradient-to-r from-slate-200 via-pink-300 to-slate-300">
        {highlightAge !== null ? (
          <span
            className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-500 ring-2 ring-white"
            style={{ left: `${((highlightAge - 40) / (69 - 40)) * 100}%` }}
            aria-hidden
          />
        ) : null}
        <span
          className="absolute top-1/2 h-full w-0.5 -translate-y-1/2 bg-pink-600/40"
          style={{ left: `${((50 - 40) / (69 - 40)) * 100}%` }}
        />
        <span
          className="absolute top-1/2 h-full w-0.5 -translate-y-1/2 bg-pink-600/40"
          style={{ left: '100%' }}
        />
      </div>
      <div className="mt-2 flex justify-between">
        {MAMA_AGE_MARKERS.map((age) => (
          <span key={age} className="font-mono text-[9px] font-bold text-slate-500">
            {age}
          </span>
        ))}
      </div>
      <p className="mt-1 text-center font-mono text-[8px] font-bold uppercase tracking-widest text-pink-800">
        Rastreio 50–69 · bienal
      </p>
    </div>
  );
}

export function MulherMammographySpectrumConceptMap({
  concepts,
  theme,
  footerRule,
}: MulherMammographySpectrumConceptMapProps) {
  const grouped = useMemo(() => {
    const zones: Partial<Record<MamaSpectrumZone, MammographyConcept[]>> = {};
    const extras: MammographyConcept[] = [];

    for (const concept of concepts) {
      const inferred = inferMamaZoneMarker(concept.title, concept.description);
      const zone = inferred.zone;
      if (zone) {
        zones[zone] = [...(zones[zone] ?? []), concept];
      } else {
        extras.push(concept);
      }
    }
    return { zones, extras };
  }, [concepts]);

  const zonesOnSpectrum = SPECTRUM_ZONES.filter((z) => (grouped.zones[z]?.length ?? 0) > 0);
  const defaultZone = zonesOnSpectrum.includes('active_screening')
    ? 'active_screening'
    : zonesOnSpectrum[0] ?? 'active_screening';

  const [activeZone, setActiveZone] = useState<MamaSpectrumZone>(defaultZone);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const activeConcepts =
    (grouped.zones[activeZone]?.length ?? 0) > 0
      ? grouped.zones[activeZone]!
      : grouped.extras.length > 0
        ? grouped.extras
        : concepts;

  const activeMeta = ZONE_META[activeZone];
  const focusAge =
    activeZone === 'trap_40' ? 40 : activeZone === 'active_screening' ? 50 : null;

  const selectZone = useCallback((zone: MamaSpectrumZone) => {
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
          <Ribbon className="h-3 w-3" aria-hidden />
          Rastreio mama — espectro etário
        </span>

        <AgeRuler highlightAge={focusAge} />

        {zonesOnSpectrum.length > 0 ? (
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
                    {mamaZoneShort(zone)}
                  </span>
                  <span className="mt-0.5 block text-[8px] font-bold uppercase text-slate-500">
                    {mamaZoneLabel(zone)}
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
                const marker = inferMamaZoneMarker(concept.title, concept.description);
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
                        <h4 className={`font-display text-xs font-extrabold uppercase ${theme.textPrimary}`}>
                          {concept.title}
                        </h4>
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
