'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Hand } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';
import { SlideLucideIcon } from '../core/SlideLucideIcon';
import {
  criancaDeckSlotLabel,
  criancaRailSlotLabel,
  criancaSpectrumZoneLabel,
  inferCriancaDeckSlot,
  inferCriancaMarker,
  inferCriancaRailSlot,
  inferCriancaSpectrumZone,
  type CriancaDeckSlot,
  type CriancaDomain,
  type CriancaRailSlot,
  type CriancaSpectrumZone,
} from '@/lib/slides/criancaSlideUtils';

export interface CriancaConcept {
  icon: string;
  title: string;
  description: string;
}

interface CriancaConceptMapBaseProps {
  concepts: CriancaConcept[];
  theme: ThemeColors;
  footerRule?: string;
  domain: CriancaDomain;
}

const CYAN_ACCENT = {
  focus: 'border-cyan-400/80 border-l-[3px] bg-gradient-to-br from-white via-cyan-50/50 to-teal-50/80 ring-2 ring-cyan-400/20',
  normal: 'border-slate-200/70 border-l-[3px] border-l-cyan-300/70 bg-white/90',
  marker: 'bg-cyan-200/90 text-cyan-900 ring-2 ring-cyan-400/50',
  line: 'bg-cyan-300/60',
  badge: 'bg-cyan-100 text-cyan-800',
};

const ZONE_STYLES: Record<CriancaSpectrumZone, { bar: string; panel: string; text: string }> = {
  normal: { bar: 'from-cyan-300 to-cyan-100', panel: 'from-cyan-50/95 via-white to-teal-50/90', text: 'text-cyan-900' },
  watch: { bar: 'from-sky-400 to-sky-200', panel: 'from-sky-50/95 via-white to-cyan-50/90', text: 'text-sky-900' },
  alert: { bar: 'from-amber-400 to-amber-200', panel: 'from-amber-50/95 via-white to-orange-50/90', text: 'text-amber-900' },
  trap: { bar: 'from-rose-400 to-rose-200', panel: 'from-rose-50/95 via-white to-red-50/90', text: 'text-rose-900' },
  severe: { bar: 'from-red-500 to-rose-300', panel: 'from-red-50/95 via-white to-rose-50/90', text: 'text-red-900' },
};

const DECK_STYLES: Record<CriancaDeckSlot, { bar: string; panel: string }> = {
  slot_a: { bar: 'from-cyan-400 to-cyan-200', panel: 'from-cyan-50/95 via-white to-teal-50/90' },
  slot_b: { bar: 'from-teal-400 to-teal-200', panel: 'from-teal-50/95 via-white to-cyan-50/90' },
  slot_c: { bar: 'from-sky-400 to-sky-200', panel: 'from-sky-50/95 via-white to-blue-50/90' },
  slot_d: { bar: 'from-indigo-400 to-indigo-200', panel: 'from-indigo-50/95 via-white to-violet-50/90' },
};

const RAIL_STYLES: Record<CriancaRailSlot, string> = {
  early: 'bg-cyan-500',
  mid: 'bg-teal-500',
  late: 'bg-sky-600',
  milestone: 'bg-emerald-500',
  trap: 'bg-rose-500',
  general: 'bg-slate-400',
};

export function CriancaTimelineConceptMap({ concepts, theme, footerRule, domain }: CriancaConceptMapBaseProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const toggle = useCallback((index: number) => {
    setExpandedIndex((c) => (c === index ? null : index));
  }, []);

  if (concepts.length === 0) return null;

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />
      <div className="relative z-10 flex flex-col gap-0">
        {concepts.map((concept, index) => {
          const Icon = resolveLucideIcon(concept.icon);
          const expanded = expandedIndex === index;
          const marker = inferCriancaMarker(concept.title, concept.description, domain);
          const isLast = index === concepts.length - 1;

          return (
            <div key={index} className="flex gap-3 md:gap-4">
              <div className="flex w-10 shrink-0 flex-col items-center">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full px-1 text-center font-mono text-[9px] font-black tabular-nums leading-tight ${
                    marker.focus ? CYAN_ACCENT.marker : `${theme.iconBg} ${theme.iconText}`
                  }`}
                >
                  {marker.label}
                </span>
                {!isLast ? <div className={`my-1 min-h-[1rem] w-0.5 flex-1 rounded-full ${CYAN_ACCENT.line}`} aria-hidden /> : null}
              </div>
              <motion.button
                type="button"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * index }}
                onClick={() => toggle(index)}
                aria-expanded={expanded}
                className={`mb-3 min-w-0 flex-1 overflow-hidden rounded-[1.25rem] border text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                  marker.focus ? CYAN_ACCENT.focus : CYAN_ACCENT.normal
                }`}
              >
                <div className="flex flex-col gap-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${theme.iconBg} ${theme.iconText}`}>
                      <Icon size={18} />
                    </div>
                    {marker.focus ? (
                      <span className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${CYAN_ACCENT.badge}`}>
                        foco prova
                      </span>
                    ) : null}
                  </div>
                  <h4 className={`font-display text-xs font-extrabold uppercase tracking-wide ${theme.textPrimary}`}>{concept.title}</h4>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.p
                      key={expanded ? 'open' : 'closed'}
                      className={`font-body text-sm leading-relaxed ${theme.textSecondary} ${expanded ? '' : 'line-clamp-3'}`}
                    >
                      {concept.description}
                    </motion.p>
                  </AnimatePresence>
                  {!expanded && concept.description.length > 80 ? (
                    <span className="inline-flex items-center gap-1 self-start rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500">
                      <ChevronDown className="h-2.5 w-2.5" aria-hidden />
                      expandir
                    </span>
                  ) : null}
                </div>
              </motion.button>
            </div>
          );
        })}
        {footerRule ? (
          <p className={`mt-3 rounded-xl border px-4 py-3 text-center font-body text-sm italic ${theme.borderColor} ${theme.iconBg} ${theme.textSecondary}`}>
            {footerRule}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function CriancaSpectrumConceptMap({ concepts, theme, footerRule, domain }: CriancaConceptMapBaseProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const enriched = useMemo(
    () =>
      concepts.map((c, i) => ({
        ...c,
        index: i,
        zone: inferCriancaSpectrumZone(c.title, c.description, domain),
      })),
    [concepts, domain],
  );

  if (concepts.length === 0) return null;

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-30`} />
      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col gap-3">
        <div className="flex h-3 overflow-hidden rounded-full bg-slate-100">
          {enriched.map(({ zone, index }) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`flex-1 bg-gradient-to-r transition-opacity ${ZONE_STYLES[zone].bar} ${
                activeIndex === index ? 'opacity-100 ring-2 ring-cyan-400/60' : 'opacity-50'
              }`}
              aria-label={criancaSpectrumZoneLabel(zone)}
            />
          ))}
        </div>
        {enriched.map((item) => {
          const active = activeIndex === item.index;
          if (!active) return null;
          const style = ZONE_STYLES[item.zone];
          return (
            <motion.div
              key={item.index}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl border border-cyan-200/70 bg-gradient-to-br p-4 shadow-sm ${style.panel}`}
            >
              <div className="mb-2 flex items-center gap-2">
                <SlideLucideIcon name={item.icon} className={`h-5 w-5 ${style.text}`} />
                <span className={`font-mono text-[9px] font-bold uppercase tracking-widest ${style.text}`}>
                  {criancaSpectrumZoneLabel(item.zone)}
                </span>
              </div>
              <h4 className={`font-display text-sm font-extrabold uppercase ${style.text}`}>{item.title}</h4>
              <p className="mt-2 font-body text-sm leading-relaxed text-slate-700">{item.description}</p>
            </motion.div>
          );
        })}
        {footerRule ? (
          <p className={`rounded-xl border px-4 py-3 text-center font-body text-sm italic ${theme.borderColor} ${theme.iconBg} ${theme.textSecondary}`}>
            {footerRule}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function CriancaDeckConceptMap({ concepts, theme, footerRule, domain }: CriancaConceptMapBaseProps) {
  const grouped = useMemo(() => {
    const slots: Partial<Record<CriancaDeckSlot, CriancaConcept[]>> = {};
    for (const concept of concepts) {
      const slot = inferCriancaDeckSlot(concept.title, concept.description, domain);
      slots[slot] = [...(slots[slot] ?? []), concept];
    }
    return slots;
  }, [concepts, domain]);

  const slotKeys = (['slot_a', 'slot_b', 'slot_c', 'slot_d'] as const).filter((k) => (grouped[k]?.length ?? 0) > 0);

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-30`} />
      <div className="relative z-10 grid gap-3 sm:grid-cols-2">
        {slotKeys.map((slot) => {
          const items = grouped[slot] ?? [];
          const style = DECK_STYLES[slot];
          return (
            <div key={slot} className={`rounded-2xl border border-cyan-200/70 bg-gradient-to-br p-3 shadow-sm ${style.panel}`}>
              <span className="mb-2 block font-mono text-[10px] font-black uppercase tracking-widest text-cyan-800">
                {criancaDeckSlotLabel(slot, domain)}
              </span>
              {items.map((item, i) => (
                <div key={i} className="mb-2 last:mb-0">
                  <div className="flex items-center gap-2">
                    <SlideLucideIcon name={item.icon} className="h-4 w-4 text-cyan-700" />
                    <h4 className="font-display text-xs font-bold uppercase text-cyan-950">{item.title}</h4>
                  </div>
                  <p className="mt-1 font-body text-xs leading-relaxed text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          );
        })}
      </div>
      {footerRule ? (
        <p className={`relative z-10 mt-3 rounded-xl border px-4 py-3 text-center font-body text-sm italic ${theme.borderColor} ${theme.iconBg} ${theme.textSecondary}`}>
          {footerRule}
        </p>
      ) : null}
    </div>
  );
}

export function CriancaRailConceptMap({ concepts, theme, footerRule, domain }: CriancaConceptMapBaseProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-30`} />
      <div className="relative z-10 flex gap-4">
        <div className="flex w-8 shrink-0 flex-col items-center gap-1 py-2">
          {concepts.map((_, i) => {
            const slot = inferCriancaRailSlot(concepts[i].title, concepts[i].description);
            return (
              <div key={i} className="flex flex-col items-center">
                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[8px] font-black text-white ${RAIL_STYLES[slot]}`}>
                  {criancaRailSlotLabel(slot)}
                </span>
                {i < concepts.length - 1 ? <div className="my-0.5 h-4 w-0.5 bg-cyan-200" /> : null}
              </div>
            );
          })}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          {concepts.map((concept, index) => {
            const expanded = expandedIndex === index;
            const slot = inferCriancaRailSlot(concept.title, concept.description);
            return (
              <button
                key={index}
                type="button"
                onClick={() => setExpandedIndex(expanded ? null : index)}
                className={`w-full rounded-xl border border-cyan-200/70 bg-white/90 p-3 text-left shadow-sm transition-all ${
                  slot === 'trap' ? 'ring-2 ring-rose-300/50' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <SlideLucideIcon name={concept.icon} className="h-4 w-4 text-cyan-700" />
                  <h4 className="font-display text-xs font-bold uppercase text-cyan-950">{concept.title}</h4>
                </div>
                <p className={`mt-1 font-body text-sm text-slate-600 ${expanded ? '' : 'line-clamp-2'}`}>{concept.description}</p>
              </button>
            );
          })}
        </div>
      </div>
      {footerRule ? (
        <p className={`relative z-10 mt-3 rounded-xl border px-4 py-3 text-center font-body text-sm italic ${theme.borderColor} ${theme.iconBg} ${theme.textSecondary}`}>
          {footerRule}
        </p>
      ) : null}
    </div>
  );
}

export function CriancaHubConceptMap({ concepts, theme, footerRule }: Omit<CriancaConceptMapBaseProps, 'domain'>) {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-30`} />
      <div className="relative z-10 flex flex-col gap-3">
        <p className="flex items-center justify-center gap-2 text-center font-body text-xs text-cyan-800/90">
          <Hand className="h-3.5 w-3.5" aria-hidden />
          Toque em cada núcleo pediátrico
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
          {concepts.map((concept, index) => {
            const active = activeIndex === index;
            return (
              <button
                key={index}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`rounded-2xl border p-3 text-left transition-all ${
                  active
                    ? 'border-cyan-400 bg-gradient-to-br from-cyan-50 to-teal-50 shadow-md ring-2 ring-cyan-300/40'
                    : 'border-slate-200/70 bg-white/90 hover:border-cyan-200'
                }`}
              >
                <SlideLucideIcon name={concept.icon} className={`mb-2 h-5 w-5 ${active ? 'text-cyan-700' : 'text-slate-500'}`} />
                <h4 className="font-display text-[10px] font-black uppercase tracking-wide text-cyan-950">{concept.title}</h4>
                {active ? <p className="mt-1 font-body text-xs leading-relaxed text-slate-600">{concept.description}</p> : null}
              </button>
            );
          })}
        </div>
        {footerRule ? (
          <p className={`rounded-xl border px-4 py-3 text-center font-body text-sm italic ${theme.borderColor} ${theme.iconBg} ${theme.textSecondary}`}>
            {footerRule}
          </p>
        ) : null}
      </div>
    </div>
  );
}
