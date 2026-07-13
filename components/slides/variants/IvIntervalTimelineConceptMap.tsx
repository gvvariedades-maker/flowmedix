'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import {
  inferIvIntervalSlot,
  IV_INTERVAL_MARKERS,
  type IvIntervalSlot,
} from '@/lib/slides/puncaoBranchSlideUtils';

export interface IvIntervalConcept {
  icon: string;
  title: string;
  description: string;
}

const SLOT_COLOR: Record<IvIntervalSlot, string> = {
  'punção': 'bg-indigo-500',
  equipo: 'bg-sky-500',
  curativo: 'bg-emerald-500',
  cateter: 'bg-violet-500',
  observacao: 'bg-amber-500',
  geral: 'bg-slate-400',
};

interface IvIntervalTimelineConceptMapProps {
  concepts: IvIntervalConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

export function IvIntervalTimelineConceptMap({ concepts, footerRule }: IvIntervalTimelineConceptMapProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const markers = useMemo(() => {
    const mapped = concepts
      .filter((c) => !/gabarito|letra\s*[a-e]/i.test(`${c.title} ${c.description}`))
      .map((c) => ({
        ...c,
        slot: inferIvIntervalSlot(c.title, c.description),
      }));

    if (mapped.length === 0) {
      return IV_INTERVAL_MARKERS.map((m, i) => ({
        icon: 'Clock',
        title: m.label,
        description: '',
        slot: m.id,
        index: i,
      }));
    }
    return mapped.slice(0, 5).map((c, i) => ({ ...c, index: i }));
  }, [concepts]);

  const active = activeIndex !== null ? markers[activeIndex] : null;
  const toggle = useCallback((i: number) => setActiveIndex((c) => (c === i ? null : i)), []);

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 to-indigo-950" />
      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col gap-4">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-sky-300/40 bg-sky-950/50 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-sky-200">
          <Clock className="h-3 w-3" aria-hidden />
          IV Interval Timeline
        </span>

        <div className="overflow-x-auto pb-2">
          <div className="relative flex min-w-[320px] items-center justify-between px-2 pt-8">
            <div className="absolute left-4 right-4 top-[calc(50%+8px)] h-0.5 bg-white/20" />
            {markers.map((m, i) => {
              const color = SLOT_COLOR[m.slot];
              const isActive = activeIndex === i;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggle(i)}
                  className="relative z-10 flex min-h-[44px] min-w-[44px] flex-col items-center gap-1"
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full font-mono text-[10px] font-black text-white shadow-lg transition-transform ${color} ${
                      isActive ? 'scale-110 ring-2 ring-cyan-400' : ''
                    }`}
                  >
                    {IV_INTERVAL_MARKERS.find((x) => x.id === m.slot)?.label ?? m.title.slice(0, 4)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {active ? (
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl border border-white/15 bg-white/10 p-4"
            >
              <p className="text-sm font-bold text-white">{active.title}</p>
              {active.description ? (
                <p className="mt-1 text-sm text-slate-200">{active.description}</p>
              ) : null}
            </motion.div>
          ) : (
            <p className="text-center font-mono text-[9px] uppercase text-slate-400">
              Toque no marco → evento / prazo
            </p>
          )}
        </AnimatePresence>

        {footerRule ? (
          <p className="rounded-xl border border-white/10 px-3 py-2 text-center text-xs italic text-slate-300">
            {footerRule}
          </p>
        ) : null}
      </div>
    </div>
  );
}
