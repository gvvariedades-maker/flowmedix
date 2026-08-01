'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';
import {
  adolescentCarePillarLabel,
  inferAdolescentCarePillar,
  type AdolescentCarePillar,
} from '@/lib/slides/adolescentSlideUtils';

export interface CarePillarConcept {
  icon: string;
  title: string;
  description: string;
}

const PILLAR_META: Record<
  AdolescentCarePillar,
  { border: string; badge: string; badgeText: string; accent: string }
> = {
  vinculo: {
    border: 'border-sky-300/90',
    badge: 'bg-sky-100',
    badgeText: 'text-sky-900',
    accent: 'bg-sky-500',
  },
  rede: {
    border: 'border-teal-300/90',
    badge: 'bg-teal-100',
    badgeText: 'text-teal-900',
    accent: 'bg-teal-500',
  },
  sigilo: {
    border: 'border-indigo-300/90',
    badge: 'bg-indigo-100',
    badgeText: 'text-indigo-900',
    accent: 'bg-indigo-500',
  },
  linguagem: {
    border: 'border-emerald-300/90',
    badge: 'bg-emerald-100',
    badgeText: 'text-emerald-900',
    accent: 'bg-emerald-500',
  },
  geral: {
    border: 'border-slate-300/90',
    badge: 'bg-slate-100',
    badgeText: 'text-slate-800',
    accent: 'bg-slate-500',
  },
};

interface ConceptMapAdolescentCarePillarsDeckProps {
  concepts: CarePillarConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

/** Terreno do encontro — 4 pilares visíveis (scan). Tap só destaca. */
export function ConceptMapAdolescentCarePillarsDeck({
  concepts,
  theme,
  footerRule,
}: ConceptMapAdolescentCarePillarsDeckProps) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState<number | null>(null);

  const enriched = useMemo(
    () =>
      concepts.map((c, index) => ({
        ...c,
        index,
        pillar: inferAdolescentCarePillar(`${c.title} ${c.description}`),
      })),
    [concepts],
  );

  const select = useCallback((index: number) => {
    setActive((cur) => (cur === index ? null : index));
  }, []);

  if (concepts.length === 0) return null;

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-5">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 mx-auto flex w-full max-w-xl flex-col gap-3">
        <p className="text-center font-mono text-[10px] font-bold uppercase tracking-widest text-sky-700/90">
          Espaço do adolescente — quatro pilares
        </p>

        <div className="grid grid-cols-1 gap-2.5 min-[380px]:grid-cols-2">
          {enriched.map((item) => {
            const meta = PILLAR_META[item.pillar];
            const Icon = resolveLucideIcon(item.icon) ?? resolveLucideIcon('HeartHandshake');
            const isActive = active === item.index;
            return (
              <motion.button
                key={item.index}
                type="button"
                onClick={() => select(item.index)}
                aria-pressed={isActive}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduceMotion ? 0 : item.index * 0.04 }}
                className={`min-h-[44px] rounded-2xl border-2 bg-white/95 p-3 text-left shadow-sm transition-shadow ${meta.border} ${
                  isActive ? 'ring-2 ring-sky-400/50 shadow-md' : 'hover:shadow-md'
                }`}
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${meta.accent}`} aria-hidden />
                  <span
                    className={`rounded-md px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${meta.badge} ${meta.badgeText}`}
                  >
                    {adolescentCarePillarLabel(item.pillar)}
                  </span>
                </div>
                <div className="flex gap-2">
                  {Icon ? (
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-sky-700" aria-hidden />
                  ) : null}
                  <div className="min-w-0">
                    <p className="font-body text-sm font-bold leading-snug text-slate-900">
                      {item.title}
                    </p>
                    <p className="mt-1 font-body text-xs leading-relaxed text-slate-600">
                      {item.description}
                    </p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {footerRule ? (
          <p className="rounded-xl border border-sky-200/70 bg-sky-50/80 px-3 py-2.5 text-center font-body text-sm italic text-sky-900/85">
            {footerRule}
          </p>
        ) : null}
      </div>
    </div>
  );
}
