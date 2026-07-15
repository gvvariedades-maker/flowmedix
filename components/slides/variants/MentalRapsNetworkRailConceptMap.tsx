'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';
import {
  inferMentalRapsNode,
  mentalRapsNodeLabel,
  MENTAL_RAPS_NODES,
  type MentalRapsNode,
} from '@/lib/slides/saudeMentalSlideUtils';

export interface MentalRapsConcept {
  icon: string;
  title: string;
  description: string;
}

const NODE_META: Record<
  MentalRapsNode,
  { label: string; border: string; badge: string; badgeText: string; ring: string; bar: string }
> = {
  raps: {
    label: 'RAPS',
    border: 'border-l-violet-500/90',
    badge: 'bg-violet-100/90',
    badgeText: 'text-violet-900',
    ring: 'ring-violet-400/35',
    bar: 'bg-violet-500',
  },
  caps: {
    label: 'CAPS',
    border: 'border-l-fuchsia-500/90',
    badge: 'bg-fuchsia-100/90',
    badgeText: 'text-fuchsia-900',
    ring: 'ring-fuchsia-400/35',
    bar: 'bg-fuchsia-500',
  },
  hospital_dia: {
    label: 'H-dia',
    border: 'border-l-indigo-500/90',
    badge: 'bg-indigo-100/90',
    badgeText: 'text-indigo-900',
    ring: 'ring-indigo-400/35',
    bar: 'bg-indigo-500',
  },
  srt: {
    label: 'SRT',
    border: 'border-l-purple-500/90',
    badge: 'bg-purple-100/90',
    badgeText: 'text-purple-900',
    ring: 'ring-purple-400/35',
    bar: 'bg-purple-500',
  },
  ab: {
    label: 'AB/ESF',
    border: 'border-l-sky-500/90',
    badge: 'bg-sky-100/90',
    badgeText: 'text-sky-900',
    ring: 'ring-sky-400/35',
    bar: 'bg-sky-500',
  },
  urgencia: {
    label: 'Urgência',
    border: 'border-l-rose-500/90',
    badge: 'bg-rose-100/90',
    badgeText: 'text-rose-900',
    ring: 'ring-rose-400/35',
    bar: 'bg-rose-500',
  },
  hospital: {
    label: 'Hospital',
    border: 'border-l-amber-500/90',
    badge: 'bg-amber-100/90',
    badgeText: 'text-amber-900',
    ring: 'ring-amber-400/35',
    bar: 'bg-amber-500',
  },
  legado: {
    label: 'Asilo',
    border: 'border-l-slate-500/90',
    badge: 'bg-slate-200/90',
    badgeText: 'text-slate-800',
    ring: 'ring-slate-400/35',
    bar: 'bg-slate-500',
  },
  geral: {
    label: 'Rede',
    border: 'border-l-slate-400/80',
    badge: 'bg-slate-100/90',
    badgeText: 'text-slate-800',
    ring: 'ring-slate-300/30',
    bar: 'bg-slate-400',
  },
};

interface MentalRapsNetworkRailConceptMapProps {
  concepts: MentalRapsConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

export function MentalRapsNetworkRailConceptMap({
  concepts,
  theme,
  footerRule,
}: MentalRapsNetworkRailConceptMapProps) {
  const [activeNodes, setActiveNodes] = useState<Set<MentalRapsNode>>(() => new Set(['raps']));
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const mapped = useMemo(
    () =>
      concepts.map((concept) => ({
        concept,
        node: inferMentalRapsNode(concept.title, concept.description),
      })),
    [concepts],
  );

  const toggleNode = useCallback((node: MentalRapsNode) => {
    setActiveNodes((prev) => {
      const next = new Set(prev);
      if (next.has(node)) next.delete(node);
      else next.add(node);
      return next;
    });
  }, []);

  if (concepts.length === 0) return null;

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 mb-3 flex flex-wrap items-center justify-center gap-1.5">
        {MENTAL_RAPS_NODES.map((node) => {
          const meta = NODE_META[node];
          const active = activeNodes.has(node);
          return (
            <button
              key={node}
              type="button"
              onClick={() => toggleNode(node)}
              className={`rounded-full px-2.5 py-1 font-mono text-[10px] font-black transition-all ${
                active
                  ? `${meta.badge} ${meta.badgeText} ring-2 ${meta.ring}`
                  : 'bg-white/50 text-slate-500 opacity-60'
              }`}
            >
              {mentalRapsNodeLabel(node)}
            </button>
          );
        })}
      </div>

      <div className="relative z-10 flex flex-col gap-2">
        {mapped.map(({ concept, node }, index) => {
          const Icon = resolveLucideIcon(concept.icon);
          const meta = NODE_META[node];
          const expanded = expandedIndex === index;
          const dimmed = node !== 'raps' && node !== 'geral' && !activeNodes.has(node);

          return (
            <motion.button
              key={index}
              type="button"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: dimmed ? 0.4 : 1, x: 0 }}
              transition={{ delay: 0.04 * index }}
              onClick={() => setExpandedIndex(expanded ? null : index)}
              aria-expanded={expanded}
              className={`w-full overflow-hidden rounded-[1.25rem] border text-left shadow-sm transition-all ${meta.border} border-l-[4px] ${
                expanded ? `ring-2 ${meta.ring}` : ''
              } ${dimmed ? 'bg-white/60' : 'bg-white/95 hover:-translate-y-0.5 hover:shadow-md'}`}
            >
              <div className="flex flex-col gap-2 p-4">
                <div className="flex items-start gap-3">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.badge}`}>
                    <Icon className={`h-5 w-5 ${meta.badgeText}`} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${meta.badge} ${meta.badgeText}`}>
                        {mentalRapsNodeLabel(node)}
                      </span>
                    </div>
                    <p className={`font-display text-sm font-bold leading-snug ${meta.badgeText}`}>{concept.title}</p>
                  </div>
                </div>
                <AnimatePresence initial={false}>
                  {expanded ? (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-left text-sm leading-relaxed text-slate-700"
                    >
                      {concept.description}
                    </motion.p>
                  ) : null}
                </AnimatePresence>
              </div>
            </motion.button>
          );
        })}
      </div>

      {footerRule ? (
        <p className="relative z-10 mt-3 text-center text-xs font-medium text-violet-800/80">{footerRule}</p>
      ) : null}

      <div className="pointer-events-none absolute right-3 top-3 opacity-20" aria-hidden>
        <Network className="h-16 w-16 text-violet-500" />
      </div>
    </div>
  );
}
