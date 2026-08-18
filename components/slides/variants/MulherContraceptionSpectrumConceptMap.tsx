'use client';

import { useCallback, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
import {
  BoardChrome,
  CategoryStrip,
  LabelBodyRow,
  boardTone,
  type BoardTone,
} from '../primitives';

export interface ContraceptionConcept {
  icon: string;
  title: string;
  description: string;
}

const ZONE_TONE: Record<PlanejamentoMethodZone, BoardTone> = {
  behavioral: 'command',
  hormonal: 'exception',
  barrier: 'barrier',
  larc: 'keep',
  trap_oral: 'warn',
};

interface MulherContraceptionSpectrumConceptMapProps {
  concepts: ContraceptionConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

/** Espectro de métodos — LabelBodyRow por zona + BoardChrome (Fábrica G2). */
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

  const activeTone = ZONE_TONE[activeZone];

  const selectZone = useCallback((zone: PlanejamentoMethodZone) => {
    setActiveZone(zone);
    setExpandedIndex(null);
  }, []);

  const toggleExpanded = useCallback((index: number) => {
    setExpandedIndex((current) => (current === index ? null : index));
  }, []);

  if (concepts.length === 0) return null;

  return (
    <BoardChrome
      theme={theme}
      eyebrow="Planejamento · métodos"
      footerRule={footerRule}
      footerLabel="Transferência de prova"
      maxWidth="lg"
      washOpacity={0.35}
    >
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-pink-200/80 bg-white/90 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-pink-800 shadow-sm">
        <Heart className="h-3 w-3" aria-hidden />
        Planejamento familiar — categorias
      </span>

      {zonesOnSpectrum.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {zonesOnSpectrum.map((zone) => {
            const t = boardTone(ZONE_TONE[zone]);
            const isActive = activeZone === zone;
            return (
              <button
                key={zone}
                type="button"
                onClick={() => selectZone(zone)}
                className={`min-h-[44px] rounded-xl border-2 px-3 py-2 text-left transition-all ${
                  isActive ? `${t.panel} shadow-md` : 'border-slate-200/90 bg-white/80 shadow-sm'
                }`}
              >
                <span className={`font-mono text-[10px] font-black ${isActive ? t.text : 'text-slate-700'}`}>
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
          className="flex flex-col gap-3"
        >
          {activeConcepts.map((concept, index) => {
            const marker = inferPlanejamentoZoneMarker(concept.title, concept.description);
            const expanded = expandedIndex === index;
            return (
              <button
                key={`${concept.title}-${index}`}
                type="button"
                onClick={() => toggleExpanded(index)}
                aria-expanded={expanded}
                className="w-full text-left"
              >
                <LabelBodyRow
                  chip={concept.title}
                  tone={marker.focus ? 'exception' : activeTone}
                  body={
                    <span className="flex flex-col gap-2">
                      <span className="flex items-start gap-2">
                        <span
                          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${theme.iconBg} ${theme.iconText}`}
                        >
                          <SlideLucideIcon name={concept.icon} size={14} />
                        </span>
                        <span className="min-w-0 flex-1">
                          {marker.zone ? (
                            <CategoryStrip
                              label={marker.label}
                              tone={marker.focus ? 'warn' : activeTone}
                              className="mb-1.5 self-start"
                            />
                          ) : null}
                          <span className={expanded ? '' : 'line-clamp-2'}>{concept.description}</span>
                        </span>
                      </span>
                    </span>
                  }
                />
              </button>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </BoardChrome>
  );
}
