'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Droplets, X } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { SlideLucideIcon } from '../core/SlideLucideIcon';
import {
  inferIvComplicationSlot,
  ivComplicationSlotLabel,
  type IvComplicationSlot,
} from '@/lib/slides/puncaoFlebiteSlideUtils';

export interface IvComplicationConcept {
  icon: string;
  title: string;
  description: string;
}

const SLOT_STYLES: Record<
  IvComplicationSlot,
  { ring: string; node: string; card: string; accent: string }
> = {
  contexto: {
    ring: 'border-indigo-400/40',
    node: 'bg-gradient-to-br from-indigo-400 to-indigo-700 shadow-lg shadow-indigo-500/40',
    card: 'border-indigo-400/30 bg-gradient-to-br from-[#1e1040] to-[#2d1b69]',
    accent: 'text-indigo-300',
  },
  infiltracao: {
    ring: 'border-sky-400/40',
    node: 'bg-gradient-to-br from-sky-400 to-blue-700 shadow-lg shadow-blue-500/40',
    card: 'border-sky-400/30 bg-gradient-to-br from-[#0c1f40] to-[#1e3a6e]',
    accent: 'text-sky-300',
  },
  flebite: {
    ring: 'border-rose-400/40',
    node: 'bg-gradient-to-br from-rose-400 to-rose-700 shadow-lg shadow-rose-500/40',
    card: 'border-rose-400/30 bg-gradient-to-br from-[#2a0a14] to-[#4c0519]',
    accent: 'text-rose-300',
  },
  hematoma: {
    ring: 'border-orange-400/40',
    node: 'bg-gradient-to-br from-orange-400 to-amber-700 shadow-lg shadow-orange-500/40',
    card: 'border-orange-400/30 bg-gradient-to-br from-[#1f1208] to-[#431407]',
    accent: 'text-orange-300',
  },
  extravasamento: {
    ring: 'border-fuchsia-400/40',
    node: 'bg-gradient-to-br from-fuchsia-400 to-purple-700 shadow-lg shadow-fuchsia-500/40',
    card: 'border-fuchsia-400/30 bg-gradient-to-br from-[#1a0a2e] to-[#3b0764]',
    accent: 'text-fuchsia-300',
  },
  esclerose: {
    ring: 'border-violet-400/40',
    node: 'bg-gradient-to-br from-violet-400 to-violet-800 shadow-lg shadow-violet-500/40',
    card: 'border-violet-400/30 bg-gradient-to-br from-[#1e1040] to-[#2d1b69]',
    accent: 'text-violet-300',
  },
  pegadinha: {
    ring: 'border-amber-400/50',
    node: 'bg-gradient-to-br from-amber-400 to-amber-700 shadow-lg shadow-amber-500/40',
    card: 'border-amber-400/30 bg-gradient-to-br from-[#1f1508] to-[#422006]',
    accent: 'text-amber-300',
  },
  geral: {
    ring: 'border-slate-400/40',
    node: 'bg-gradient-to-br from-slate-400 to-slate-700 shadow-lg shadow-slate-500/40',
    card: 'border-slate-400/30 bg-gradient-to-br from-[#0f172a] to-[#1e293b]',
    accent: 'text-slate-300',
  },
};

const ORBIT_POSITIONS = [
  'top-[6%] left-1/2 -translate-x-1/2',
  'top-[26%] right-[4%]',
  'bottom-[24%] right-[8%]',
  'bottom-[24%] left-[8%]',
  'top-[26%] left-[4%]',
];

interface IvComplicationOrbitConceptMapProps {
  concepts: IvComplicationConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

export function IvComplicationOrbitConceptMap({
  concepts,
  footerRule,
}: IvComplicationOrbitConceptMapProps) {
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const satellites = useMemo(() => {
    return concepts
      .filter((c) => {
        const slot = inferIvComplicationSlot(c.title, c.description);
        return slot !== 'geral' && !/gabarito|letra\s*[a-e]/i.test(`${c.title} ${c.description}`);
      })
      .slice(0, 5)
      .map((c, i) => ({
        ...c,
        slot: inferIvComplicationSlot(c.title, c.description),
        position: ORBIT_POSITIONS[i % ORBIT_POSITIONS.length],
      }));
  }, [concepts]);

  const active = activeIndex !== null ? satellites[activeIndex] : null;
  const activeStyle = active ? SLOT_STYLES[active.slot] : null;

  const close = useCallback(() => setActiveIndex(null), []);

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
      <div className="absolute inset-0 bg-[#02030a]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_60%,#0a0420_0%,#02030a_70%)]" />
        <div className="absolute -left-20 -top-20 h-80 w-96 rounded-full bg-indigo-600/20 blur-[100px]" />
        <div className="absolute -right-16 top-1/4 h-64 w-80 rounded-full bg-rose-600/15 blur-[100px]" />
      </div>

      <AnimatePresence>
        {active && activeStyle ? (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 bg-[#02030a]/75 backdrop-blur-sm"
            onClick={close}
            aria-label="Fechar painel"
          />
        ) : null}
      </AnimatePresence>

      <div className="relative z-20 flex items-center justify-between px-5 pt-4">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-white/60">
          <Droplets className="h-3 w-3" aria-hidden />
          Complicações IV
        </span>
        <span
          className={`font-mono text-[10px] font-bold uppercase tracking-wide transition-colors ${
            active ? 'text-indigo-300' : 'text-white/25'
          }`}
        >
          {active ? active.title : `${satellites.length} nós`}
        </span>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center px-4 pb-2">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {[72, 108, 132].map((size) => (
            <div
              key={size}
              className="absolute rounded-full border border-dashed border-white/10"
              style={{ width: size * 2, height: size * 0.7 }}
            />
          ))}
        </div>

        <div className="relative z-10 flex h-24 w-24 flex-col items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 via-indigo-600 to-indigo-950 shadow-[0_0_40px_rgba(99,102,241,0.45)] ring-4 ring-indigo-400/20">
          <span className="font-display text-sm font-extrabold text-white">IV</span>
          <span className="font-mono text-[8px] font-bold uppercase tracking-widest text-white/50">
            acesso
          </span>
        </div>

        {satellites.map((sat, index) => {
          const style = SLOT_STYLES[sat.slot];
          const isActive = activeIndex === index;
          return (
            <button
              key={`${sat.title}-${index}`}
              type="button"
              onClick={() => setActiveIndex(isActive ? null : index)}
              className={`absolute z-20 flex min-h-[44px] min-w-[44px] flex-col items-center gap-1 ${sat.position}`}
              aria-expanded={isActive}
            >
              <motion.div
                animate={reduceMotion ? undefined : { y: [0, -6, 0], rotate: [0, 3, 0] }}
                transition={{ duration: 4 + index, repeat: Infinity, ease: 'easeInOut' }}
                className={`flex h-11 w-11 items-center justify-center rounded-full ${style.node} ${
                  isActive ? 'ring-4 ring-white/30' : ''
                }`}
              >
                <SlideLucideIcon name={sat.icon} className="h-5 w-5 text-white" />
              </motion.div>
              <span className="max-w-[80px] truncate text-center font-mono text-[8px] font-semibold text-white/70">
                {ivComplicationSlotLabel(sat.slot)}
              </span>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {active && activeStyle ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            className={`absolute left-4 right-4 top-20 z-40 rounded-3xl border p-5 shadow-2xl ${activeStyle.card}`}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ${activeStyle.accent}`}
              >
                <SlideLucideIcon name={active.icon} className="h-6 w-6" />
              </div>
              <button
                type="button"
                onClick={close}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/70"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className={`mb-1 font-mono text-[10px] font-bold uppercase tracking-widest ${activeStyle.accent}`}>
              {ivComplicationSlotLabel(active.slot)}
            </p>
            <h3 className="mb-2 font-display text-lg font-extrabold text-white">{active.title}</h3>
            <p className="font-body text-sm leading-relaxed text-white/70">{active.description}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <p className="relative z-20 pb-3 text-center font-body text-[11px] text-white/30">
        Toque em um nó para ver mecanismo e sinal
      </p>

      {footerRule ? (
        <p className="relative z-20 mx-4 mb-4 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center font-body text-xs italic text-white/50">
          {footerRule}
        </p>
      ) : null}
    </div>
  );
}
