'use client';

import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Syringe } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';
import {
  inferIvPunctureRailSlot,
  ivPunctureRailSlotLabel,
  type IvPunctureRailSlot,
} from '@/lib/slides/puncaoBranchSlideUtils';

export interface IvPunctureConcept {
  icon: string;
  title: string;
  description: string;
}

const SLOT_BORDER: Record<IvPunctureRailSlot, string> = {
  higiene: 'border-l-sky-500',
  antissepsia: 'border-l-teal-500',
  secar: 'border-l-cyan-500',
  selecao_veia: 'border-l-indigo-500',
  bisel: 'border-l-violet-500',
  puncionar: 'border-l-rose-500',
  fixar: 'border-l-amber-500',
  identificar: 'border-l-emerald-500',
  geral: 'border-l-slate-400',
};

interface IvPunctureRailConceptMapProps {
  concepts: IvPunctureConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

export function IvPunctureRailConceptMap({ concepts, theme, footerRule }: IvPunctureRailConceptMapProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const toggle = useCallback((i: number) => setExpandedIndex((c) => (c === i ? null : i)), []);

  if (concepts.length === 0) return null;

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-4">
      <motion.div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />
      <div className="relative z-10 mb-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/80 bg-white/90 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-indigo-900 shadow-sm">
          <Syringe className="h-3 w-3" aria-hidden />
          IV Puncture Rail
        </span>
      </div>
      <div className="relative z-10 flex snap-y snap-mandatory flex-col gap-2">
        {concepts.map((concept, index) => {
          const slot = inferIvPunctureRailSlot(concept.title, concept.description);
          const Icon = resolveLucideIcon(concept.icon);
          const expanded = expandedIndex === index;
          return (
            <button
              key={index}
              type="button"
              onClick={() => toggle(index)}
              className={`snap-start rounded-xl border border-slate-200/80 border-l-4 bg-white/90 p-3 text-left shadow-sm transition-all ${SLOT_BORDER[slot]} ${
                expanded ? 'ring-2 ring-indigo-300/50' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {Icon ? <Icon className="h-4 w-4 text-indigo-700" aria-hidden /> : null}
                  <span className="font-mono text-[9px] font-bold uppercase text-indigo-700">
                    {ivPunctureRailSlotLabel(slot)}
                  </span>
                  <span className="font-body text-sm font-bold text-slate-900">{concept.title}</span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
                />
              </div>
              <AnimatePresence>
                {expanded ? (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-2 overflow-hidden font-body text-sm leading-relaxed text-slate-600"
                  >
                    {concept.description}
                  </motion.p>
                ) : null}
              </AnimatePresence>
            </button>
          );
        })}
      </div>
      {footerRule ? (
        <p className={`relative z-10 mt-3 rounded-xl border px-3 py-2 text-center text-sm italic ${theme.borderColor}`}>
          {footerRule}
        </p>
      ) : null}
    </div>
  );
}
