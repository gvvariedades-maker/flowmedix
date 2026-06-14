'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';

export interface OrbitIvConcept {
  icon: string;
  title: string;
  description: string;
}

type SatelliteSlot = 'antissepsia' | 'barreira' | 'curativo' | 'remocao' | 'gabarito' | 'extra';

const SLOT_STYLES: Record<
  SatelliteSlot,
  { ring: string; node: string; card: string; accent: string; orbit: string }
> = {
  antissepsia: {
    ring: 'border-violet-400/40',
    node: 'bg-gradient-to-br from-violet-400 to-violet-700 shadow-lg shadow-violet-500/40',
    card: 'border-violet-400/30 bg-gradient-to-br from-[#1e1040] to-[#2d1b69]',
    accent: 'text-violet-300',
    orbit: 'from-violet-500/20',
  },
  barreira: {
    ring: 'border-sky-400/40',
    node: 'bg-gradient-to-br from-sky-400 to-blue-700 shadow-lg shadow-blue-500/40',
    card: 'border-sky-400/30 bg-gradient-to-br from-[#0c1f40] to-[#1e3a6e]',
    accent: 'text-sky-300',
    orbit: 'from-sky-500/20',
  },
  curativo: {
    ring: 'border-emerald-400/40',
    node: 'bg-gradient-to-br from-emerald-400 to-teal-700 shadow-lg shadow-emerald-500/40',
    card: 'border-emerald-400/30 bg-gradient-to-br from-[#062818] to-[#064e3b]',
    accent: 'text-emerald-300',
    orbit: 'from-emerald-500/20',
  },
  remocao: {
    ring: 'border-orange-400/40',
    node: 'bg-gradient-to-br from-orange-400 to-amber-700 shadow-lg shadow-orange-500/40',
    card: 'border-orange-400/30 bg-gradient-to-br from-[#1f1208] to-[#431407]',
    accent: 'text-orange-300',
    orbit: 'from-orange-500/20',
  },
  gabarito: {
    ring: 'border-emerald-400/50',
    node: 'bg-gradient-to-br from-emerald-400 to-emerald-700 shadow-lg shadow-emerald-500/50',
    card: 'border-emerald-400/30 bg-gradient-to-br from-[#062818] to-[#064e3b]',
    accent: 'text-emerald-300',
    orbit: 'from-emerald-500/20',
  },
  extra: {
    ring: 'border-indigo-400/40',
    node: 'bg-gradient-to-br from-indigo-400 to-indigo-700 shadow-lg shadow-indigo-500/40',
    card: 'border-indigo-400/30 bg-gradient-to-br from-[#1e1040] to-[#2d1b69]',
    accent: 'text-indigo-300',
    orbit: 'from-indigo-500/20',
  },
};

const ORBIT_POSITIONS = [
  'top-[8%] left-1/2 -translate-x-1/2',
  'top-[28%] right-[6%]',
  'bottom-[22%] right-[10%]',
  'bottom-[22%] left-[10%]',
  'top-[28%] left-[6%]',
];

function inferSatelliteSlot(title: string, description: string): SatelliteSlot {
  const text = `${title} ${description}`.toLowerCase();
  if (/gabarito|letra\s*[a-e]/.test(text)) return 'gabarito';
  if (/antissepsia|clorexidina|álcool|higieniza/.test(text)) return 'antissepsia';
  if (/barreira|asséptica|esteril|máxima/.test(text)) return 'barreira';
  if (/curativo|semipermeável|dressing/.test(text)) return 'curativo';
  if (/remoção|retirar|interrupção|permanência/.test(text)) return 'remocao';
  return 'extra';
}

interface IvCareOrbitConceptMapProps {
  concepts: OrbitIvConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

export function IvCareOrbitConceptMap({ concepts, theme, footerRule }: IvCareOrbitConceptMapProps) {
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const satellites = useMemo(() => {
    const mapped = concepts
      .filter((c) => inferSatelliteSlot(c.title, c.description) !== 'gabarito')
      .slice(0, 4)
      .map((c, i) => ({
        ...c,
        slot: inferSatelliteSlot(c.title, c.description),
        position: ORBIT_POSITIONS[i % ORBIT_POSITIONS.length],
      }));

    if (mapped.length < 4) {
      const gabarito = concepts.find((c) => inferSatelliteSlot(c.title, c.description) === 'gabarito');
      const extras = concepts.filter(
        (c) => c !== gabarito && !mapped.some((m) => m.title === c.title),
      );
      for (const ex of extras) {
        if (mapped.length >= 4) break;
        mapped.push({
          ...ex,
          slot: inferSatelliteSlot(ex.title, ex.description),
          position: ORBIT_POSITIONS[mapped.length % ORBIT_POSITIONS.length],
        });
      }
    }

    return mapped;
  }, [concepts]);

  const active = activeIndex !== null ? satellites[activeIndex] : null;
  const activeStyle = active ? SLOT_STYLES[active.slot] : null;
  const ActiveIcon = active ? resolveLucideIcon(active.icon) : null;

  const close = useCallback(() => setActiveIndex(null), []);

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
      <div className="absolute inset-0 bg-[#02030a]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_60%,#0a0420_0%,#02030a_70%)]" />
        <div className="absolute -left-20 -top-20 h-80 w-96 rounded-full bg-violet-600/20 blur-[100px]" />
        <div className="absolute -right-16 top-1/4 h-64 w-80 rounded-full bg-blue-600/15 blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/6 h-56 w-72 rounded-full bg-fuchsia-600/10 blur-[100px]" />
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
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-white/60">
          ✦ Orbit IPCS
        </span>
        <span
          className={`font-mono text-[10px] font-bold uppercase tracking-wide transition-colors ${
            active ? 'text-violet-300' : 'text-white/25'
          }`}
        >
          {active ? active.title : `${satellites.length} satélites`}
        </span>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center px-4 pb-2">
        {/* Trilhas orbitais */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {[72, 108, 132].map((size) => (
            <div
              key={size}
              className="absolute rounded-full border border-dashed border-white/10"
              style={{ width: size * 2, height: size * 0.7 }}
            />
          ))}
        </div>

        {/* Planeta central */}
        <div className="relative z-10 flex h-24 w-24 flex-col items-center justify-center rounded-full bg-gradient-to-br from-violet-400 via-violet-600 to-violet-950 shadow-[0_0_40px_rgba(139,92,246,0.45)] ring-4 ring-violet-400/20">
          <span className="font-display text-sm font-extrabold text-white">IPCS</span>
          <span className="font-mono text-[8px] font-bold uppercase tracking-widest text-white/50">CVC</span>
        </div>

        {/* Satélites */}
        {satellites.map((sat, index) => {
          const style = SLOT_STYLES[sat.slot];
          const Icon = resolveLucideIcon(sat.icon);
          const isActive = activeIndex === index;
          return (
            <button
              key={`${sat.title}-${index}`}
              type="button"
              onClick={() => setActiveIndex(isActive ? null : index)}
              className={`absolute z-20 flex flex-col items-center gap-1 ${sat.position}`}
            >
              <motion.div
                animate={
                  reduceMotion
                    ? undefined
                    : { y: [0, -6, 0], rotate: [0, 3, 0] }
                }
                transition={{ duration: 4 + index, repeat: Infinity, ease: 'easeInOut' }}
                className={`flex h-11 w-11 items-center justify-center rounded-full ${style.node} ${
                  isActive ? 'ring-4 ring-white/30' : ''
                }`}
              >
                <Icon className="h-5 w-5 text-white" aria-hidden />
              </motion.div>
              <span className="max-w-[72px] truncate font-mono text-[8px] font-semibold text-white/70">
                {sat.title}
              </span>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {active && activeStyle && ActiveIcon ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            className={`absolute left-4 right-4 top-20 z-40 rounded-3xl border p-5 shadow-2xl ${activeStyle.card}`}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ${activeStyle.accent}`}>
                <ActiveIcon className="h-6 w-6" aria-hidden />
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
              Satélite {activeIndex !== null ? activeIndex + 1 : ''}
            </p>
            <h3 className="mb-2 font-display text-lg font-extrabold text-white">{active.title}</h3>
            <p className="font-body text-sm leading-relaxed text-white/70">{active.description}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <p className="relative z-20 pb-3 text-center font-body text-[11px] text-white/30">
        Toque em qualquer satélite para explorar
      </p>

      {footerRule ? (
        <p className="relative z-20 mx-4 mb-4 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center font-body text-xs italic text-white/50">
          {footerRule}
        </p>
      ) : null}
    </div>
  );
}
