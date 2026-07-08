'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tags } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';
import {
  inferTriageColor,
  triageColorLabel,
  TRIAGE_COLORS,
  type TriageColor,
} from '@/lib/slides/urgenciasManchesterSlideUtils';

export interface ManchesterConcept {
  icon: string;
  title: string;
  description: string;
}

const COLOR_META: Record<
  TriageColor,
  { badge: string; badgeText: string; border: string; ring: string; chip: string; bar: string }
> = {
  vermelho: {
    badge: 'bg-red-100/90',
    badgeText: 'text-red-900',
    border: 'border-l-red-500/90',
    ring: 'ring-red-400/30',
    chip: '●',
    bar: 'bg-red-500',
  },
  amarelo: {
    badge: 'bg-yellow-100/90',
    badgeText: 'text-yellow-900',
    border: 'border-l-yellow-500/80',
    ring: 'ring-yellow-300/30',
    chip: '●',
    bar: 'bg-yellow-400',
  },
  verde: {
    badge: 'bg-emerald-100/90',
    badgeText: 'text-emerald-900',
    border: 'border-l-emerald-400/80',
    ring: 'ring-emerald-300/30',
    chip: '●',
    bar: 'bg-emerald-500',
  },
  azul: {
    badge: 'bg-sky-100/90',
    badgeText: 'text-sky-900',
    border: 'border-l-sky-400/80',
    ring: 'ring-sky-300/30',
    chip: '●',
    bar: 'bg-sky-500',
  },
  preto: {
    badge: 'bg-slate-200/90',
    badgeText: 'text-slate-900',
    border: 'border-l-slate-600/80',
    ring: 'ring-slate-400/30',
    chip: '●',
    bar: 'bg-slate-700',
  },
  alerta: {
    badge: 'bg-amber-100/90',
    badgeText: 'text-amber-900',
    border: 'border-l-amber-500/80',
    ring: 'ring-amber-400/35',
    chip: '!',
    bar: 'bg-amber-500',
  },
  geral: {
    badge: 'bg-slate-100/90',
    badgeText: 'text-slate-800',
    border: 'border-l-slate-400/70',
    ring: 'ring-slate-300/25',
    chip: '•',
    bar: 'bg-slate-400',
  },
};

interface UrgenciasManchesterSpectrumConceptMapProps {
  concepts: ManchesterConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

export function UrgenciasManchesterSpectrumConceptMap({
  concepts,
  theme,
  footerRule,
}: UrgenciasManchesterSpectrumConceptMapProps) {
  const [activeColor, setActiveColor] = useState<TriageColor | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const grouped = useMemo(() => {
    const byColor = new Map<TriageColor, ManchesterConcept[]>();
    for (const concept of concepts) {
      const color = inferTriageColor(concept.title, concept.description);
      const list = byColor.get(color) ?? [];
      list.push(concept);
      byColor.set(color, list);
    }
    return byColor;
  }, [concepts]);

  const colorsOnSpectrum = TRIAGE_COLORS.filter((c) => grouped.has(c));
  const defaultColor =
    activeColor ??
    colorsOnSpectrum.find((c) => c === 'vermelho') ??
    colorsOnSpectrum[0] ??
    inferTriageColor(concepts[0]?.title ?? '', concepts[0]?.description ?? '');

  const visibleConcepts = grouped.get(defaultColor) ?? concepts;

  const toggleColor = useCallback((color: TriageColor) => {
    setActiveColor((current) => (current === color ? null : color));
    setExpandedIndex(null);
  }, []);

  const toggleExpanded = useCallback((index: number) => {
    setExpandedIndex((current) => (current === index ? null : index));
  }, []);

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-4 md:p-6">
      <motion.div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col gap-4">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-red-200/80 bg-white/90 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-red-900 shadow-sm">
          <Tags className="h-3 w-3" aria-hidden />
          Manchester Spectrum
        </span>

        <div className="relative rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-sm">
          <div className="flex h-4 overflow-hidden rounded-full">
            {TRIAGE_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => grouped.has(color) && toggleColor(color)}
                className={`flex-1 transition-opacity ${COLOR_META[color].bar} ${
                  grouped.has(color) ? 'opacity-100' : 'opacity-25'
                } ${defaultColor === color ? 'ring-2 ring-inset ring-white/80' : ''}`}
                aria-label={triageColorLabel(color)}
              />
            ))}
          </div>
          <div className="mt-1 flex justify-between px-0.5">
            {TRIAGE_COLORS.map((color) => (
              <span
                key={color}
                className={`font-mono text-[7px] font-bold uppercase ${
                  defaultColor === color ? COLOR_META[color].badgeText : 'text-slate-400'
                }`}
              >
                {triageColorLabel(color).slice(0, 3)}
              </span>
            ))}
          </div>
        </div>

        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-700">
          {triageColorLabel(defaultColor)}
        </p>

        <div className="flex flex-col gap-3">
          {visibleConcepts.map((concept, index) => {
            const Icon = resolveLucideIcon(concept.icon);
            const color = inferTriageColor(concept.title, concept.description);
            const meta = COLOR_META[color];
            const expanded = expandedIndex === index;

            return (
              <motion.button
                key={`${defaultColor}-${index}`}
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => toggleExpanded(index)}
                aria-expanded={expanded}
                className={`overflow-hidden rounded-[1.25rem] border border-slate-200/70 border-l-[3px] ${meta.border} bg-gradient-to-br from-white to-slate-50/80 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                  expanded ? `ring-2 ${meta.ring}` : ''
                }`}
              >
                <div className="flex flex-col gap-2.5 p-4 md:p-5">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${theme.iconBg} ${theme.iconText}`}
                    >
                      <Icon size={20} />
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${meta.badge} ${meta.badgeText}`}
                    >
                      {triageColorLabel(color)}
                    </span>
                  </div>
                  <h4 className={`font-display text-sm font-extrabold uppercase tracking-wide ${theme.textPrimary}`}>
                    {concept.title}
                  </h4>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.p
                      key={expanded ? 'open' : 'closed'}
                      animate={{ opacity: 1 }}
                      className={`font-body text-sm leading-relaxed ${theme.textSecondary} ${
                        expanded ? '' : 'line-clamp-3'
                      }`}
                    >
                      {concept.description}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </motion.button>
            );
          })}
        </div>

        {footerRule ? (
          <p
            className={`rounded-xl border px-4 py-3 text-center font-body text-sm font-medium italic leading-relaxed ${theme.borderColor} bg-white/80 ${theme.textSecondary}`}
          >
            {footerRule}
          </p>
        ) : null}
      </div>
    </div>
  );
}
