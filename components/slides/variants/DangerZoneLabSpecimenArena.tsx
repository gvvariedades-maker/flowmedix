'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Check,
  ClipboardList,
  Droplets,
  FlaskConical,
  ShieldAlert,
  Thermometer,
  X,
  Zap,
} from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { DangerZoneItem } from './DangerZone';

type SpecimenSlot = 'site' | 'temp' | 'waste' | 'phase';

type SpecimenEntry = {
  slot: SpecimenSlot;
  index: number;
  label: string;
  detail: string;
  correct: string;
  fixation: string;
  critical: boolean;
};

const SLOT_META: Record<
  SpecimenSlot,
  {
    label: string;
    tag: string;
    bar: string;
    glow: string;
    ring: string;
    panel: string;
    text: string;
    icon: typeof Droplets;
  }
> = {
  site: {
    label: 'Punção',
    tag: 'I · acesso',
    bar: 'bg-teal-500',
    glow: 'shadow-teal-300/50',
    ring: 'ring-teal-400/60',
    panel: 'from-teal-50/95 via-white to-cyan-50/90',
    text: 'text-teal-900',
    icon: Droplets,
  },
  temp: {
    label: '2–8°C',
    tag: 'II · frio',
    bar: 'bg-sky-500',
    glow: 'shadow-sky-300/50',
    ring: 'ring-sky-400/60',
    panel: 'from-sky-50/95 via-white to-cyan-50/90',
    text: 'text-sky-900',
    icon: Thermometer,
  },
  waste: {
    label: 'Descarte',
    tag: 'III · crítico',
    bar: 'bg-rose-500',
    glow: 'shadow-rose-400/60',
    ring: 'ring-rose-500/70',
    panel: 'from-rose-50/95 via-white to-pink-50/90',
    text: 'text-rose-900',
    icon: ShieldAlert,
  },
  phase: {
    label: 'Pré',
    tag: 'fase',
    bar: 'bg-indigo-500',
    glow: 'shadow-indigo-300/50',
    ring: 'ring-indigo-400/60',
    panel: 'from-indigo-50/95 via-white to-violet-50/90',
    text: 'text-indigo-900',
    icon: ClipboardList,
  },
};

function inferSlot(label: string, detail: string): SpecimenSlot {
  const text = `${label} ${detail}`.toLowerCase();
  if (/juntar resíduo|perfurocortante|gaze|luva|descarte|segrega|incompatíve/.test(text)) return 'waste';
  if (/2\s*°c|8\s*°c|refrigera|temperatura|manter frio/.test(text)) return 'temp';
  if (/pré-analítica|analítica|equipamento|coleta e envio/.test(text)) return 'phase';
  if (/mediana|cubital|cefálica|punção|acesso/.test(text)) return 'site';
  return 'phase';
}

function inferFixation(slot: SpecimenSlot, correct: string): string {
  if (slot === 'waste') {
    return 'Pegadinha clássica da III: perfurocortante sempre em recipiente próprio — nunca mistura geral.';
  }
  if (slot === 'temp') return 'Memorize a faixa 2°C a 8°C quando o exame pedir refrigeração.';
  if (slot === 'site') return 'Mediana cubital costuma ser a via preferida na coleta venosa periférica.';
  if (/pré-analítico|punção/.test(correct.toLowerCase())) {
    return 'Erros de coleta e transporte ocorrem antes da análise laboratorial.';
  }
  return 'Relacione a pegadinha ao elo correto da cadeia pré-analítica.';
}

function buildSpecimens(items: DangerZoneItem[]): SpecimenEntry[] {
  return items.map((item, index) => {
    const label = item.label || item.title || `Pegadinha ${index + 1}`;
    const detail = item.detail || item.description || '';
    const correct = typeof item.correct === 'string' ? item.correct.trim() : '';
    const slot = inferSlot(label, detail);
    return {
      slot,
      index,
      label,
      detail,
      correct,
      fixation: inferFixation(slot, correct),
      critical: slot === 'waste',
    };
  });
}

interface DangerZoneLabSpecimenArenaProps {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  footerRule?: string;
}

export function DangerZoneLabSpecimenArena({
  content,
  items,
  theme,
  footerRule,
}: DangerZoneLabSpecimenArenaProps) {
  const reduceMotion = useReducedMotion();
  const specimens = useMemo(() => buildSpecimens(items), [items]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [revealed, setRevealed] = useState<Set<number>>(() => new Set());

  const active = activeIndex !== null ? specimens[activeIndex] : null;
  const activeMeta = active ? SLOT_META[active.slot] : null;
  const revealedCount = revealed.size;
  const criticalRevealed = specimens.filter((s) => s.critical && revealed.has(s.index)).length;
  const allRevealed = revealedCount >= specimens.length;

  const examine = useCallback((index: number) => {
    setActiveIndex(index);
    setRevealed((prev) => new Set(prev).add(index));
  }, []);

  const reiniciar = useCallback(() => {
    setActiveIndex(null);
    setRevealed(new Set());
  }, []);

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
      <div className="absolute inset-0 overflow-hidden bg-[#f0f9ff]">
        <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-sky-200/45 blur-[100px]" />
        <div className="absolute -right-16 top-1/4 h-80 w-80 rounded-full bg-teal-200/40 blur-[90px]" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-cyan-200/35 blur-[80px]" />
      </div>
      <motion.div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-25`} />

      <div className="relative z-10 mx-auto flex w-full min-w-0 max-w-lg flex-1 flex-col overflow-y-auto p-4 md:p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200/80 bg-white/90 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-sky-700 shadow-sm">
              <FlaskConical className="h-3 w-3" aria-hidden />
              Specimen Arena
            </span>
            {content ? (
              <p className="mt-2 font-body text-[10px] font-semibold uppercase leading-snug tracking-wide text-slate-800 md:text-[11px]">
                {content}
              </p>
            ) : null}
          </div>
          <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl border border-sky-200/80 bg-white/90 shadow-md shadow-sky-200/30">
            <p className="font-mono text-lg font-black tabular-nums text-sky-700">
              {revealedCount}
              <span className="text-xs text-slate-400">/{specimens.length}</span>
            </p>
            <p className="font-mono text-[7px] font-bold uppercase text-slate-500">reveladas</p>
          </div>
        </div>

        <div className="mb-3 grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-rose-200/80 bg-white/90 px-2 py-2 text-center shadow-sm">
            <p className="font-mono text-xl font-black text-rose-500">{specimens.filter((s) => s.critical).length}</p>
            <p className="font-mono text-[6px] font-semibold uppercase text-slate-500">Críticas</p>
          </div>
          <div className="rounded-xl border border-sky-200/80 bg-white/90 px-2 py-2 text-center shadow-sm">
            <p className="font-mono text-xl font-black text-sky-600">{revealedCount}</p>
            <p className="font-mono text-[6px] font-semibold uppercase text-slate-500">Examinadas</p>
          </div>
          <div className="rounded-xl border border-emerald-200/80 bg-white/90 px-2 py-2 text-center shadow-sm">
            <p className="font-mono text-xl font-black text-emerald-600">{criticalRevealed}</p>
            <p className="font-mono text-[6px] font-semibold uppercase text-slate-500">III ok</p>
          </div>
        </div>

        <div className="mb-3 grid grid-cols-4 gap-2">
          {specimens.map((specimen) => {
            const meta = SLOT_META[specimen.slot];
            const Icon = meta.icon;
            const isActive = activeIndex === specimen.index;
            const isRevealed = revealed.has(specimen.index);

            return (
              <button
                key={specimen.index}
                type="button"
                onClick={() => examine(specimen.index)}
                className={`relative flex flex-col items-center gap-1 rounded-2xl border px-1 py-3 transition-all active:scale-[0.97] ${
                  isActive
                    ? `border-2 bg-white shadow-lg ${meta.glow} ${meta.ring} ring-2`
                    : isRevealed
                      ? 'border-emerald-200/80 bg-emerald-50/60 shadow-sm'
                      : 'border-slate-200/90 bg-white/80 shadow-sm hover:shadow-md'
                } ${specimen.critical && !isRevealed ? 'animate-pulse' : ''}`}
              >
                <div
                  className={`flex h-10 w-8 items-end justify-center overflow-hidden rounded-b-full border-2 border-white shadow-inner ${
                    isRevealed ? 'bg-gradient-to-t from-emerald-400/80 to-emerald-200/60' : `bg-gradient-to-t ${meta.bar} to-white/40`
                  }`}
                >
                  <div className={`mb-1 h-3 w-full ${isRevealed ? 'bg-emerald-300/50' : 'bg-white/30'}`} />
                </div>
                <Icon className={`h-3.5 w-3.5 ${isRevealed ? 'text-emerald-600' : meta.text}`} aria-hidden />
                <span className="font-body text-[9px] font-semibold leading-tight text-slate-600">{meta.label}</span>
                {specimen.critical ? (
                  <span className="absolute -right-1 -top-1 rounded-full bg-rose-500 px-1 py-0.5 font-mono text-[6px] font-bold text-white">
                    III
                  </span>
                ) : null}
                {isRevealed ? (
                  <Check className="absolute bottom-1 right-1 h-3 w-3 text-emerald-600" aria-hidden />
                ) : null}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {active && activeMeta ? (
            <motion.div
              key={active.index}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
              className={`overflow-hidden rounded-2xl border-2 border-white/80 bg-gradient-to-br shadow-xl ${activeMeta.panel} ${activeMeta.glow}`}
            >
              <div className="border-b border-black/5 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Zap className={`h-4 w-4 ${active.critical ? 'text-rose-500' : 'text-sky-600'}`} aria-hidden />
                  <span className={`font-mono text-[9px] font-extrabold uppercase tracking-widest ${activeMeta.text}`}>
                    {active.critical ? 'Pegadinha crítica — afirmativa III' : `Elo ${activeMeta.tag}`}
                  </span>
                </div>
                <h3 className="mt-1.5 font-body text-sm font-semibold leading-snug text-slate-900">
                  {active.label}
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
                <div className="border-b border-rose-100/80 bg-gradient-to-br from-rose-50/90 to-white p-4 md:border-b-0 md:border-r">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                      <X className="h-4 w-4" strokeWidth={3} aria-hidden />
                    </span>
                    <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-rose-700">
                      O que a banca induz
                    </p>
                  </div>
                  <p className="font-body text-sm leading-relaxed text-slate-700">{active.detail}</p>
                </div>

                <div className="bg-gradient-to-br from-emerald-50/90 to-white p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <Check className="h-4 w-4" strokeWidth={3} aria-hidden />
                    </span>
                    <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-emerald-700">
                      Protocolo correto
                    </p>
                  </div>
                  <p className="font-body text-sm font-semibold leading-relaxed text-emerald-950">
                    {active.correct || '—'}
                  </p>
                </div>
              </div>

              <div className={`mx-4 mb-4 mt-3 rounded-xl border px-3 py-2.5 ${activeMeta.ring} bg-white/70 ring-1`}>
                <p className="font-mono text-[8px] font-bold uppercase tracking-widest text-slate-500">Fixação rápida</p>
                <p className="mt-1 font-body text-sm font-medium text-slate-800">{active.fixation}</p>
              </div>
            </motion.div>
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-8 text-center font-body text-sm text-slate-500"
            >
              Toque um tubo na bancada para examinar a pegadinha
            </motion.p>
          )}
        </AnimatePresence>

        {footerRule && allRevealed ? (
          <p className="mt-3 rounded-xl border border-sky-200/70 bg-white/90 px-3 py-2.5 text-center font-body text-xs italic text-sky-900/90 shadow-sm">
            {footerRule}
          </p>
        ) : null}

        {revealedCount > 0 ? (
          <button
            type="button"
            onClick={reiniciar}
            className="mt-3 self-center font-mono text-[10px] font-bold uppercase tracking-wide text-sky-600"
          >
            ↺ Refazer exame
          </button>
        ) : null}
      </div>
    </div>
  );
}
