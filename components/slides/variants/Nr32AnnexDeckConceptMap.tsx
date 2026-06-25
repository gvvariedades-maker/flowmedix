'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HardHat } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';
import {
  inferNr32Annex,
  nr32AnnexLabel,
  NR32_ANNEX_SLOTS,
  type Nr32Annex,
} from '@/lib/slides/trabalhoSlideUtils';

export interface Nr32AnnexConcept {
  icon: string;
  title: string;
  description: string;
}

const ANNEX_META: Record<
  Nr32Annex,
  { label: string; border: string; badge: string; badgeText: string; ring: string; bar: string }
> = {
  biologico: {
    label: 'Risco biológico',
    border: 'border-l-rose-500/90',
    badge: 'bg-rose-100/90',
    badgeText: 'text-rose-900',
    ring: 'ring-rose-400/35',
    bar: 'bg-rose-500',
  },
  quimico: {
    label: 'Risco químico',
    border: 'border-l-amber-500/90',
    badge: 'bg-amber-100/90',
    badgeText: 'text-amber-900',
    ring: 'ring-amber-400/35',
    bar: 'bg-amber-500',
  },
  fisico: {
    label: 'Risco físico',
    border: 'border-l-sky-500/90',
    badge: 'bg-sky-100/90',
    badgeText: 'text-sky-900',
    ring: 'ring-sky-400/35',
    bar: 'bg-sky-500',
  },
  ergonomico: {
    label: 'Risco ergonômico',
    border: 'border-l-violet-500/90',
    badge: 'bg-violet-100/90',
    badgeText: 'text-violet-900',
    ring: 'ring-violet-400/35',
    bar: 'bg-violet-500',
  },
  acidente: {
    label: 'Acidentes',
    border: 'border-l-orange-500/90',
    badge: 'bg-orange-100/90',
    badgeText: 'text-orange-900',
    ring: 'ring-orange-400/35',
    bar: 'bg-orange-500',
  },
  nr32: {
    label: 'NR-32',
    border: 'border-l-amber-600/90',
    badge: 'bg-amber-200/90',
    badgeText: 'text-amber-950',
    ring: 'ring-amber-500/35',
    bar: 'bg-amber-600',
  },
  vacina: {
    label: 'Prevenção',
    border: 'border-l-teal-500/90',
    badge: 'bg-teal-100/90',
    badgeText: 'text-teal-900',
    ring: 'ring-teal-400/35',
    bar: 'bg-teal-500',
  },
  epi: {
    label: 'EPI',
    border: 'border-l-slate-500/90',
    badge: 'bg-slate-100/90',
    badgeText: 'text-slate-800',
    ring: 'ring-slate-400/35',
    bar: 'bg-slate-500',
  },
  gabarito: {
    label: 'Gabarito',
    border: 'border-l-emerald-500/90',
    badge: 'bg-emerald-100/90',
    badgeText: 'text-emerald-900',
    ring: 'ring-emerald-400/40',
    bar: 'bg-emerald-500',
  },
  geral: {
    label: 'Saúde ocupacional',
    border: 'border-l-amber-400/80',
    badge: 'bg-amber-50/90',
    badgeText: 'text-amber-800',
    ring: 'ring-amber-300/30',
    bar: 'bg-amber-400',
  },
};

interface Nr32AnnexDeckConceptMapProps {
  concepts: Nr32AnnexConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

export function Nr32AnnexDeckConceptMap({
  concepts,
  theme,
  footerRule,
}: Nr32AnnexDeckConceptMapProps) {
  const [activeAnnex, setActiveAnnex] = useState<Nr32Annex | null>(null);

  const grouped = useMemo(() => {
    const byAnnex = new Map<Nr32Annex, Nr32AnnexConcept>();
    const extras: Nr32AnnexConcept[] = [];
    for (const concept of concepts) {
      const annex = inferNr32Annex(concept.title, concept.description);
      if (annex === 'gabarito' || annex === 'nr32' || annex === 'vacina' || annex === 'epi') {
        if (!byAnnex.has(annex)) byAnnex.set(annex, concept);
        else extras.push(concept);
        continue;
      }
      if (NR32_ANNEX_SLOTS.includes(annex as (typeof NR32_ANNEX_SLOTS)[number])) {
        if (!byAnnex.has(annex)) byAnnex.set(annex, concept);
        else extras.push(concept);
      } else {
        extras.push(concept);
      }
    }
    return { byAnnex, extras };
  }, [concepts]);

  const activeConcept =
    (activeAnnex && grouped.byAnnex.get(activeAnnex)) ||
    grouped.byAnnex.get('nr32') ||
    concepts[0];
  const activeMeta = ANNEX_META[activeAnnex ?? inferNr32Annex(activeConcept?.title ?? '', activeConcept?.description ?? '')];
  const ActiveIcon = resolveLucideIcon(activeConcept?.icon ?? 'Shield');

  const toggleAnnex = useCallback((annex: Nr32Annex) => {
    setActiveAnnex((current) => (current === annex ? null : annex));
  }, []);

  const annexesOnRail = NR32_ANNEX_SLOTS.filter((a) => grouped.byAnnex.has(a));

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-4 md:p-6">
      <motion.div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-40`} />

      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/70 bg-amber-50/90 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-amber-900 shadow-sm">
            <HardHat className="h-3 w-3" aria-hidden />
            NR-32 — anexos de risco
          </span>
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-amber-700/80">
            Toque cada anexo
          </span>
        </div>

        <div className="flex items-stretch justify-between gap-1 rounded-2xl border border-amber-200/80 bg-white/80 p-2 shadow-md shadow-amber-100/40">
          {annexesOnRail.map((annex) => {
            const meta = ANNEX_META[annex];
            const isActive = activeAnnex === annex || (!activeAnnex && annex === annexesOnRail[0]);
            const concept = grouped.byAnnex.get(annex);
            if (!concept) return null;
            return (
              <button
                key={annex}
                type="button"
                onClick={() => toggleAnnex(annex)}
                aria-pressed={isActive}
                className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-2 transition-all duration-200 ${
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
                  {nr32AnnexLabel(annex)}
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
                      <ActiveIcon size={22} aria-hidden />
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
              const annex = inferNr32Annex(concept.title, concept.description);
              const meta = ANNEX_META[annex];
              const Icon = resolveLucideIcon(concept.icon);
              return (
                <div
                  key={concept.title}
                  className={`rounded-xl border border-slate-200/70 bg-white/90 p-3 shadow-sm border-l-[3px] ${meta.border}`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${theme.iconText}`} aria-hidden />
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
