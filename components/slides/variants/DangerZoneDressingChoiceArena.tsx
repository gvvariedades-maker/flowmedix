'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Bandage,
  Bed,
  Check,
  Droplets,
  FlaskConical,
  Hand,
  Scissors,
  X,
  Zap,
} from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { DangerZoneItem } from './DangerZone';

type DressingSlot = 'umidade' | 'limpeza' | 'ph' | 'pressao' | 'massagem' | 'cobertura';

type DressingEntry = {
  slot: DressingSlot;
  index: number;
  label: string;
  detail: string;
  correct: string;
  fixation: string;
  critical: boolean;
};

const SLOT_META: Record<
  DressingSlot,
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
  umidade: {
    label: 'Umidade',
    tag: 'pele · exsudato',
    bar: 'bg-sky-500',
    glow: 'shadow-sky-300/50',
    ring: 'ring-sky-400/60',
    panel: 'from-sky-50/95 via-white to-cyan-50/90',
    text: 'text-sky-900',
    icon: Droplets,
  },
  limpeza: {
    label: 'Limpeza',
    tag: 'crítico',
    bar: 'bg-rose-500',
    glow: 'shadow-rose-400/60',
    ring: 'ring-rose-500/70',
    panel: 'from-rose-50/95 via-white to-pink-50/90',
    text: 'text-rose-900',
    icon: Scissors,
  },
  ph: {
    label: 'pH',
    tag: 'sabonete',
    bar: 'bg-amber-500',
    glow: 'shadow-amber-300/50',
    ring: 'ring-amber-400/60',
    panel: 'from-amber-50/95 via-white to-orange-50/90',
    text: 'text-amber-900',
    icon: FlaskConical,
  },
  pressao: {
    label: 'Pressão',
    tag: 'LPP',
    bar: 'bg-orange-500',
    glow: 'shadow-orange-300/50',
    ring: 'ring-orange-400/60',
    panel: 'from-orange-50/95 via-white to-amber-50/90',
    text: 'text-orange-900',
    icon: Bed,
  },
  massagem: {
    label: 'Massagem',
    tag: 'crítico',
    bar: 'bg-rose-500',
    glow: 'shadow-rose-400/60',
    ring: 'ring-rose-500/70',
    panel: 'from-rose-50/95 via-white to-pink-50/90',
    text: 'text-rose-900',
    icon: Hand,
  },
  cobertura: {
    label: 'Cobertura',
    tag: 'curativo',
    bar: 'bg-teal-500',
    glow: 'shadow-teal-300/50',
    ring: 'ring-teal-400/60',
    panel: 'from-teal-50/95 via-white to-emerald-50/90',
    text: 'text-teal-900',
    icon: Bandage,
  },
};

function inferSlot(label: string, detail: string): DressingSlot {
  const text = `${label} ${detail}`.toLowerCase();
  if (/massage|proeminência|proeminencia|hiperemia|hiperemiad/.test(text)) return 'massagem';
  if (/úmid|umid|seca|maceração|maceracao|exsudato/.test(text)) return 'umidade';
  if (/álcool|alcool|iodo|sf\s*0|soro fisiológico|limpeza|antisséptico|antisseptico/.test(text)) {
    return 'limpeza';
  }
  if (/ph|alcalino|sabonete/.test(text)) return 'ph';
  if (/pressão|pressao|calcanhar|lpp|alívio|alivio|reposicion/.test(text)) return 'pressao';
  if (/hidrocoloide|alginato|gaze|oclusiv|filme|cobertura|curativo/.test(text)) return 'cobertura';
  return 'cobertura';
}

function inferFixation(slot: DressingSlot, correct: string): string {
  if (slot === 'umidade') {
    return 'Pegadinha clássica: pele úmida no acamado ou gaze seca aderente — o padrão é seco perilesional e cobertura não aderente.';
  }
  if (slot === 'limpeza') {
    return 'SF 0,9% limpa sem citotoxicidade; álcool e iodo concentrado no leito são armadilhas de prova.';
  }
  if (slot === 'ph') return 'Evite sabonetes e produtos com pH alcalino — preservam a barreira cutânea.';
  if (slot === 'pressao') {
    return 'Prevenção de LPP exige alívio/redistribuição de pressão; calcanhar livre é conduta válida.';
  }
  if (slot === 'massagem') {
    return 'Nunca massagear proeminência óssea ou área hiperemiada — aumenta microtrauma local.';
  }
  if (/ambiente úmido|oclusiv|alginato|hidrocoloide/.test(correct.toLowerCase())) {
    return 'Escolha a cobertura pelo exsudato e pela fase da ferida — não por hábito de gaze seca.';
  }
  return 'Relacione a pegadinha ao slot correto do manejo de feridas.';
}

function buildEntries(items: DangerZoneItem[]): DressingEntry[] {
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
      critical: slot === 'limpeza' || slot === 'massagem' || slot === 'umidade',
    };
  });
}

interface DangerZoneDressingChoiceArenaProps {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  footerRule?: string;
}

export function DangerZoneDressingChoiceArena({
  content,
  items,
  theme,
  footerRule,
}: DangerZoneDressingChoiceArenaProps) {
  const reduceMotion = useReducedMotion();
  const entries = useMemo(() => buildEntries(items), [items]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [revealed, setRevealed] = useState<Set<number>>(() => new Set());

  const active = activeIndex !== null ? entries[activeIndex] : null;
  const activeMeta = active ? SLOT_META[active.slot] : null;
  const revealedCount = revealed.size;
  const criticalRevealed = entries.filter((e) => e.critical && revealed.has(e.index)).length;
  const allRevealed = revealedCount >= entries.length;

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
      <div className="absolute inset-0 overflow-hidden bg-[#fff7ed]">
        <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-orange-200/45 blur-[100px]" />
        <div className="absolute -right-16 top-1/4 h-80 w-80 rounded-full bg-amber-200/40 blur-[90px]" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-rose-200/30 blur-[80px]" />
      </div>
      <motion.div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-25`} />

      <div className="relative z-10 mx-auto flex w-full min-w-0 max-w-lg flex-1 flex-col overflow-y-auto p-4 md:p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200/80 bg-white/90 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-orange-700 shadow-sm">
              <Bandage className="h-3 w-3" aria-hidden />
              Dressing Arena
            </span>
            {content ? (
              <p className="mt-2 font-body text-[10px] font-semibold uppercase leading-snug tracking-wide text-slate-800 md:text-[11px]">
                {content}
              </p>
            ) : null}
          </div>
          <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl border border-orange-200/80 bg-white/90 shadow-md shadow-orange-200/30">
            <p className="font-mono text-lg font-black tabular-nums text-orange-700">
              {revealedCount}
              <span className="text-xs text-slate-400">/{entries.length}</span>
            </p>
            <p className="font-mono text-[7px] font-bold uppercase text-slate-500">reveladas</p>
          </div>
        </div>

        <div className="mb-3 grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-rose-200/80 bg-white/90 px-2 py-2 text-center shadow-sm">
            <p className="font-mono text-xl font-black text-rose-500">{entries.filter((e) => e.critical).length}</p>
            <p className="font-mono text-[6px] font-semibold uppercase text-slate-500">Críticas</p>
          </div>
          <div className="rounded-xl border border-orange-200/80 bg-white/90 px-2 py-2 text-center shadow-sm">
            <p className="font-mono text-xl font-black text-orange-600">{revealedCount}</p>
            <p className="font-mono text-[6px] font-semibold uppercase text-slate-500">Examinadas</p>
          </div>
          <div className="rounded-xl border border-emerald-200/80 bg-white/90 px-2 py-2 text-center shadow-sm">
            <p className="font-mono text-xl font-black text-emerald-600">{criticalRevealed}</p>
            <p className="font-mono text-[6px] font-semibold uppercase text-slate-500">OK</p>
          </div>
        </div>

        <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {entries.map((entry) => {
            const meta = SLOT_META[entry.slot];
            const Icon = meta.icon;
            const isActive = activeIndex === entry.index;
            const isRevealed = revealed.has(entry.index);

            return (
              <button
                key={entry.index}
                type="button"
                onClick={() => examine(entry.index)}
                className={`relative flex flex-col items-center gap-1 rounded-2xl border px-1 py-3 transition-all active:scale-[0.97] ${
                  isActive
                    ? `border-2 bg-white shadow-lg ${meta.glow} ${meta.ring} ring-2`
                    : isRevealed
                      ? 'border-emerald-200/80 bg-emerald-50/60 shadow-sm'
                      : 'border-slate-200/90 bg-white/80 shadow-sm hover:shadow-md'
                } ${entry.critical && !isRevealed ? 'animate-pulse' : ''}`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border-2 border-white shadow-inner ${
                    isRevealed ? 'bg-gradient-to-br from-emerald-200/80 to-emerald-100/60' : `bg-gradient-to-br ${meta.bar} to-white/50`
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isRevealed ? 'text-emerald-700' : 'text-white'}`} aria-hidden />
                </div>
                <span className="font-body text-[9px] font-semibold leading-tight text-slate-600">{meta.label}</span>
                {entry.critical ? (
                  <span className="absolute -right-1 -top-1 rounded-full bg-rose-500 px-1 py-0.5 font-mono text-[6px] font-bold text-white">
                    !
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
                  <Zap className={`h-4 w-4 ${active.critical ? 'text-rose-500' : 'text-orange-600'}`} aria-hidden />
                  <span className={`font-mono text-[9px] font-extrabold uppercase tracking-widest ${activeMeta.text}`}>
                    {active.critical ? 'Pegadinha crítica' : `Slot ${activeMeta.tag}`}
                  </span>
                </div>
                <h3 className="mt-1.5 font-body text-sm font-semibold leading-snug text-slate-900">{active.label}</h3>
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
                      Conduta correta
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
              Toque um card para examinar a pegadinha
            </motion.p>
          )}
        </AnimatePresence>

        {footerRule && allRevealed ? (
          <p className="mt-3 rounded-xl border border-orange-200/70 bg-white/90 px-3 py-2.5 text-center font-body text-xs italic text-orange-900/90 shadow-sm">
            {footerRule}
          </p>
        ) : null}

        {revealedCount > 0 ? (
          <button
            type="button"
            onClick={reiniciar}
            className="mt-3 self-center font-mono text-[10px] font-bold uppercase tracking-wide text-orange-600"
          >
            ↺ Refazer arena
          </button>
        ) : null}
      </div>
    </div>
  );
}
