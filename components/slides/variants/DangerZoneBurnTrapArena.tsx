'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Check,
  Droplets,
  Flame,
  Hand,
  Percent,
  Snowflake,
  Syringe,
  X,
} from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { DangerZoneItem } from './DangerZone';

type BurnSlot = 'resfriamento' | 'gelo' | 'bolha' | 'cobertura' | 'tetano' | 'scq';

type BurnEntry = {
  slot: BurnSlot;
  index: number;
  label: string;
  detail: string;
  correct: string;
  fixation: string;
  critical: boolean;
};

const SLOT_META: Record<
  BurnSlot,
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
  resfriamento: {
    label: 'Resfriar',
    tag: 'água morna',
    bar: 'bg-sky-500',
    glow: 'shadow-sky-300/50',
    ring: 'ring-sky-400/60',
    panel: 'from-sky-50/95 via-white to-cyan-50/90',
    text: 'text-sky-900',
    icon: Droplets,
  },
  gelo: {
    label: 'Gelo',
    tag: 'crítico',
    bar: 'bg-rose-500',
    glow: 'shadow-rose-400/60',
    ring: 'ring-rose-500/70',
    panel: 'from-rose-50/95 via-white to-pink-50/90',
    text: 'text-rose-900',
    icon: Snowflake,
  },
  bolha: {
    label: 'Bolha',
    tag: 'integridade',
    bar: 'bg-amber-500',
    glow: 'shadow-amber-300/50',
    ring: 'ring-amber-400/60',
    panel: 'from-amber-50/95 via-white to-orange-50/90',
    text: 'text-amber-900',
    icon: Hand,
  },
  cobertura: {
    label: 'Cobertura',
    tag: 'curativo',
    bar: 'bg-orange-500',
    glow: 'shadow-orange-300/50',
    ring: 'ring-orange-400/60',
    panel: 'from-orange-50/95 via-white to-amber-50/90',
    text: 'text-orange-900',
    icon: Flame,
  },
  tetano: {
    label: 'Tétano',
    tag: 'profilaxia',
    bar: 'bg-teal-500',
    glow: 'shadow-teal-300/50',
    ring: 'ring-teal-400/60',
    panel: 'from-teal-50/95 via-white to-emerald-50/90',
    text: 'text-teal-900',
    icon: Syringe,
  },
  scq: {
    label: 'SCQ',
    tag: 'regra 9',
    bar: 'bg-violet-500',
    glow: 'shadow-violet-300/50',
    ring: 'ring-violet-400/60',
    panel: 'from-violet-50/95 via-white to-purple-50/90',
    text: 'text-violet-900',
    icon: Percent,
  },
};

function inferSlot(label: string, detail: string): BurnSlot {
  const text = `${label} ${detail}`.toLowerCase();
  if (/gelo|geleira|manteiga|pasta de dente|pomada caseira|óleo|oleo|manteiga/.test(text)) return 'gelo';
  if (/bolha|romper|estourar|drenar|punção|puncao/.test(text)) return 'bolha';
  if (/tétano|tetano|vacina|soro antitet|dt|dpt/.test(text)) return 'tetano';
  if (/scq|regra dos 9|regra de 9|9%|18%|36%|superfície|superficie|extensão|extensao/.test(text)) {
    return 'scq';
  }
  if (/resfriar|água corrente|agua corrente|morna|15 min|20 min|resfriamento/.test(text)) {
    return 'resfriamento';
  }
  if (/cobrir|curativo|filme|gaze|oclusiv|pomada antibiótica|pomada antibiotica/.test(text)) {
    return 'cobertura';
  }
  return 'cobertura';
}

function inferFixation(slot: BurnSlot, correct: string): string {
  if (slot === 'gelo') {
    return 'Gelo direto agrava a lesão — água corrente morna por 15–20 min é o padrão.';
  }
  if (slot === 'resfriamento') {
    return correct.trim() || 'Resfriamento imediato com água corrente morna — não adie para avaliar extensão.';
  }
  if (slot === 'bolha') {
    return 'Bolha íntegra protege — romper só em serviço especializado, se indicado.';
  }
  if (slot === 'tetano') {
    return correct.trim() || 'Queimadura = ferida contaminada — revise esquema vacinal e indicação de soro.';
  }
  if (slot === 'scq') {
    return correct.trim() || 'Some os segmentos pela regra dos 9 — adulto ≠ criança na cabeça e pernas.';
  }
  return correct.trim() || 'Relacione a pegadinha ao slot correto do atendimento à queimadura.';
}

function buildEntries(items: DangerZoneItem[]): BurnEntry[] {
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
      critical: slot === 'gelo' || slot === 'bolha',
    };
  });
}

interface DangerZoneBurnTrapArenaProps {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  footerRule?: string;
}

export function DangerZoneBurnTrapArena({
  content,
  items,
  theme,
  footerRule,
}: DangerZoneBurnTrapArenaProps) {
  const reduceMotion = useReducedMotion();
  const entries = useMemo(() => buildEntries(items), [items]);
  const [activeSlot, setActiveSlot] = useState<BurnSlot>(() => entries[0]?.slot ?? 'resfriamento');
  const [revealed, setRevealed] = useState<Set<number>>(() => new Set());

  const slotEntries = useMemo(
    () => entries.filter((e) => e.slot === activeSlot),
    [entries, activeSlot],
  );
  const activeEntry = slotEntries[0] ?? entries.find((e) => e.slot === activeSlot);
  const meta = SLOT_META[activeSlot];
  const SlotIcon = meta.icon;

  const slotsWithItems = useMemo(() => {
    const seen = new Set<BurnSlot>();
    for (const e of entries) seen.add(e.slot);
    return (Object.keys(SLOT_META) as BurnSlot[]).filter((s) => seen.has(s));
  }, [entries]);

  const toggleReveal = useCallback((index: number) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-4 md:p-6">
      <motion.div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col gap-3.5">
        <div className="flex flex-col gap-1.5">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-orange-200/80 bg-white/90 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-orange-700 shadow-sm">
            <Flame className="h-3 w-3" aria-hidden />
            Burn Arena
          </span>
          {content ? (
            <p className="font-body text-sm font-semibold leading-snug text-slate-800">{content}</p>
          ) : null}
          <p className="flex items-center gap-1.5 font-body text-xs font-medium text-slate-600">
            <Hand className="h-3.5 w-3.5 shrink-0 text-orange-600" aria-hidden />
            Escolha o slot e toque para revelar a conduta correta
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {slotsWithItems.map((slot) => {
            const slotMeta = SLOT_META[slot];
            const Icon = slotMeta.icon;
            const isActive = activeSlot === slot;
            const count = entries.filter((e) => e.slot === slot).length;
            return (
              <button
                key={slot}
                type="button"
                onClick={() => setActiveSlot(slot)}
                className={`flex cursor-pointer flex-col items-center gap-1 rounded-2xl border px-1 py-2 transition-all ${
                  isActive
                    ? `border-2 bg-white shadow-lg ${slotMeta.ring} ring-2`
                    : 'border-slate-200/90 bg-white/80 shadow-sm hover:shadow-md hover:ring-1 hover:ring-orange-200/80 active:scale-[0.98]'
                }`}
              >
                <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${slotMeta.bar} text-white shadow-inner`}>
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <span className={`font-mono text-[7px] font-bold uppercase ${isActive ? slotMeta.text : 'text-slate-500'}`}>
                  {slotMeta.label}
                </span>
                {count > 1 ? (
                  <span className="font-mono text-[6px] text-slate-400">{count}×</span>
                ) : null}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {activeEntry ? (
            <motion.div
              key={`${activeSlot}-${activeEntry.index}`}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
              className={`overflow-hidden rounded-2xl border-2 border-white/80 bg-gradient-to-br shadow-xl ${meta.panel} ${meta.ring} ring-1`}
            >
              <div className="border-b border-black/5 px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.bar} text-white shadow-inner`}>
                    <SlotIcon className="h-5 w-5" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <p className={`font-mono text-[9px] font-extrabold uppercase tracking-widest ${meta.text}`}>
                      {meta.label} · {meta.tag}
                    </p>
                    <h3 className="font-body text-sm font-semibold leading-snug text-slate-900">{activeEntry.label}</h3>
                  </div>
                </div>
              </div>

              <div className="space-y-3 px-4 py-3">
                <p className="font-body text-sm leading-relaxed text-slate-700">{activeEntry.detail}</p>

                <button
                  type="button"
                  onClick={() => toggleReveal(activeEntry.index)}
                  className={`w-full rounded-xl border px-3 py-3 text-left transition-all ${
                    revealed.has(activeEntry.index)
                      ? 'border-emerald-300/80 bg-emerald-50/90'
                      : 'border-rose-300/80 bg-rose-50/90 hover:shadow-sm active:scale-[0.99]'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        revealed.has(activeEntry.index)
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {revealed.has(activeEntry.index) ? (
                        <Check className="h-4 w-4" strokeWidth={3} aria-hidden />
                      ) : (
                        <X className="h-4 w-4" strokeWidth={3} aria-hidden />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500">
                        {revealed.has(activeEntry.index) ? 'Conduta correta' : 'Toque para revelar'}
                      </p>
                      <p className="font-body text-sm font-semibold leading-snug text-slate-900">
                        {revealed.has(activeEntry.index)
                          ? activeEntry.correct || activeEntry.fixation
                          : 'O que a banca espera neste slot?'}
                      </p>
                    </div>
                  </div>
                </button>

                {revealed.has(activeEntry.index) ? (
                  <p className="rounded-lg border border-orange-200/70 bg-white/80 px-3 py-2 font-body text-xs text-orange-900/90">
                    {activeEntry.fixation}
                  </p>
                ) : null}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {slotEntries.length > 1 ? (
          <div className="flex flex-wrap gap-2">
            {slotEntries.map((entry) => (
              <button
                key={entry.index}
                type="button"
                onClick={() => toggleReveal(entry.index)}
                className={`rounded-full border px-2.5 py-1 font-mono text-[9px] font-bold uppercase ${
                  revealed.has(entry.index)
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 bg-white/90 text-slate-600'
                }`}
              >
                #{entry.index + 1}
              </button>
            ))}
          </div>
        ) : null}

        {footerRule ? (
          <p className="rounded-xl border border-orange-200/70 bg-white/90 px-3 py-2.5 text-center font-body text-xs italic text-orange-900/90 shadow-sm">
            {footerRule}
          </p>
        ) : null}
      </div>
    </div>
  );
}
