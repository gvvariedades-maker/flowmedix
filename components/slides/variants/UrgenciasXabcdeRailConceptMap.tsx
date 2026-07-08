'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';
import {
  inferXabcdeLetter,
  xabcdeLetterLabel,
  XABCDE_LETTERS,
  type XabcdeLetter,
} from '@/lib/slides/urgenciasTraumaSlideUtils';

export interface XabcdeConcept {
  icon: string;
  title: string;
  description: string;
}

const LETTER_META: Record<
  XabcdeLetter,
  { badge: string; badgeText: string; border: string; ring: string; chip: string }
> = {
  x: {
    badge: 'bg-rose-100/90',
    badgeText: 'text-rose-900',
    border: 'border-l-rose-500/90',
    ring: 'ring-rose-400/30',
    chip: 'X',
  },
  a: {
    badge: 'bg-orange-100/90',
    badgeText: 'text-orange-900',
    border: 'border-l-orange-400/80',
    ring: 'ring-orange-300/30',
    chip: 'A',
  },
  b: {
    badge: 'bg-amber-100/90',
    badgeText: 'text-amber-900',
    border: 'border-l-amber-400/80',
    ring: 'ring-amber-300/30',
    chip: 'B',
  },
  c: {
    badge: 'bg-yellow-100/90',
    badgeText: 'text-yellow-900',
    border: 'border-l-yellow-500/80',
    ring: 'ring-yellow-300/30',
    chip: 'C',
  },
  d: {
    badge: 'bg-lime-100/90',
    badgeText: 'text-lime-900',
    border: 'border-l-lime-500/80',
    ring: 'ring-lime-300/30',
    chip: 'D',
  },
  e: {
    badge: 'bg-teal-100/90',
    badgeText: 'text-teal-900',
    border: 'border-l-teal-400/80',
    ring: 'ring-teal-300/30',
    chip: 'E',
  },
  alerta: {
    badge: 'bg-red-100/90',
    badgeText: 'text-red-900',
    border: 'border-l-red-500/80',
    ring: 'ring-red-400/35',
    chip: '!',
  },
  geral: {
    badge: 'bg-slate-100/90',
    badgeText: 'text-slate-800',
    border: 'border-l-slate-400/70',
    ring: 'ring-slate-300/25',
    chip: '•',
  },
};

interface UrgenciasXabcdeRailConceptMapProps {
  concepts: XabcdeConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

export function UrgenciasXabcdeRailConceptMap({
  concepts,
  theme,
  footerRule,
}: UrgenciasXabcdeRailConceptMapProps) {
  const [activeLetter, setActiveLetter] = useState<XabcdeLetter | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const grouped = useMemo(() => {
    const byLetter = new Map<XabcdeLetter, XabcdeConcept[]>();
    for (const concept of concepts) {
      const letter = inferXabcdeLetter(concept.title, concept.description);
      const list = byLetter.get(letter) ?? [];
      list.push(concept);
      byLetter.set(letter, list);
    }
    return byLetter;
  }, [concepts]);

  const lettersOnRail = XABCDE_LETTERS.filter((l) => grouped.has(l));
  const defaultLetter =
    activeLetter ??
    lettersOnRail.find((l) => l === 'x') ??
    lettersOnRail[0] ??
    inferXabcdeLetter(concepts[0]?.title ?? '', concepts[0]?.description ?? '');

  const visibleConcepts = grouped.get(defaultLetter) ?? concepts;
  const letterMeta = LETTER_META[defaultLetter];

  const toggleLetter = useCallback((letter: XabcdeLetter) => {
    setActiveLetter((current) => (current === letter ? null : letter));
    setExpandedIndex(null);
  }, []);

  const toggleExpanded = useCallback((index: number) => {
    setExpandedIndex((current) => (current === index ? null : index));
  }, []);

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-4 md:p-6">
      <motion.div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col gap-4">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-orange-200/80 bg-white/90 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-orange-900 shadow-sm">
          <ShieldAlert className="h-3 w-3" aria-hidden />
          XABCDE Rail
        </span>

        {lettersOnRail.length > 1 ? (
          <div className="flex flex-wrap items-center justify-center gap-1 rounded-xl border border-orange-200/70 bg-orange-50/50 px-2 py-2">
            {lettersOnRail.map((letter, i) => {
              const meta = LETTER_META[letter];
              const isActive = defaultLetter === letter;
              return (
                <div key={letter} className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => toggleLetter(letter)}
                    className={`flex h-11 w-11 items-center justify-center rounded-xl font-mono text-sm font-black transition-all ${
                      isActive
                        ? `${meta.badge} ${meta.badgeText} ring-2 ${meta.ring}`
                        : 'bg-white/80 text-slate-500 hover:bg-white'
                    }`}
                  >
                    {meta.chip}
                  </button>
                  {i < lettersOnRail.length - 1 ? (
                    <span className="font-mono text-[10px] text-orange-400/80" aria-hidden>
                      →
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}

        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-orange-800/90">
          {xabcdeLetterLabel(defaultLetter)}
        </p>

        <div className="flex flex-col gap-3">
          {visibleConcepts.map((concept, index) => {
            const Icon = resolveLucideIcon(concept.icon);
            const expanded = expandedIndex === index;
            const letter = inferXabcdeLetter(concept.title, concept.description);
            const meta = LETTER_META[letter];

            return (
              <motion.button
                key={`${defaultLetter}-${index}`}
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                onClick={() => toggleExpanded(index)}
                aria-expanded={expanded}
                className={`overflow-hidden rounded-[1.25rem] border border-orange-200/70 border-l-[3px] ${meta.border} bg-gradient-to-br from-white via-orange-50/30 to-amber-50/50 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                  expanded ? `ring-2 ${meta.ring}` : ''
                }`}
              >
                <div className="flex flex-col gap-2.5 p-4 md:p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${theme.iconBg} ${theme.iconText}`}
                      >
                        <Icon size={20} />
                      </span>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${meta.badge} ${meta.badgeText}`}
                    >
                      {meta.chip}
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
