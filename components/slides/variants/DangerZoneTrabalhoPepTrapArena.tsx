'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Check,
  ClipboardList,
  Droplets,
  FileWarning,
  Hand,
  HardHat,
  Syringe,
  X,
} from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { DangerZoneItem } from './DangerZone';
import {
  inferPepSlot,
  pepSlotLabel,
  PEP_CHAIN_SLOTS,
  type PepSlot,
} from '@/lib/slides/trabalhoSlideUtils';

type PepEntry = {
  slot: PepSlot;
  index: number;
  label: string;
  detail: string;
  correct: string;
  fixation: string;
  critical: boolean;
};

const SLOT_META: Record<
  PepSlot,
  {
    label: string;
    tag: string;
    bar: string;
    ring: string;
    panel: string;
    text: string;
    icon: typeof Droplets;
  }
> = {
  lavar: {
    label: 'Lavar',
    tag: 'primeiro passo',
    bar: 'bg-sky-500',
    ring: 'ring-sky-400/60',
    panel: 'from-sky-50/95 via-white to-cyan-50/90',
    text: 'text-sky-900',
    icon: Droplets,
  },
  notificar: {
    label: 'Notificar',
    tag: 'obrigatório',
    bar: 'bg-amber-500',
    ring: 'ring-amber-400/60',
    panel: 'from-amber-50/95 via-white to-orange-50/90',
    text: 'text-amber-900',
    icon: ClipboardList,
  },
  exames: {
    label: 'Exames',
    tag: 'fonte + exposto',
    bar: 'bg-violet-500',
    ring: 'ring-violet-400/60',
    panel: 'from-violet-50/95 via-white to-purple-50/90',
    text: 'text-violet-900',
    icon: FileWarning,
  },
  profilaxia: {
    label: 'Profilaxia',
    tag: 'PEP',
    bar: 'bg-teal-500',
    ring: 'ring-teal-400/60',
    panel: 'from-teal-50/95 via-white to-emerald-50/90',
    text: 'text-teal-900',
    icon: Syringe,
  },
  cat: {
    label: 'CAT',
    tag: 'INSS',
    bar: 'bg-orange-500',
    ring: 'ring-orange-400/60',
    panel: 'from-orange-50/95 via-white to-amber-50/90',
    text: 'text-orange-900',
    icon: HardHat,
  },
  retorno: {
    label: 'Retorno',
    tag: 'afastamento',
    bar: 'bg-rose-500',
    ring: 'ring-rose-400/60',
    panel: 'from-rose-50/95 via-white to-pink-50/90',
    text: 'text-rose-900',
    icon: Hand,
  },
};

function inferFixation(slot: PepSlot, correct: string): string {
  if (slot === 'lavar') {
    return 'Lavar é o primeiro passo — mas nunca substitui notificação e seguimento institucional.';
  }
  if (slot === 'notificar') {
    return correct.trim() || 'Acidente ocupacional exige notificação e fluxo do serviço de saúde.';
  }
  if (slot === 'exames') {
    return correct.trim() || 'Avaliar fonte do paciente e sorologia do exposto conforme protocolo.';
  }
  if (slot === 'profilaxia') {
    return correct.trim() || 'PEP com vacina e/ou imunoglobulina — ideal nas primeiras 48–72 h.';
  }
  if (slot === 'cat') {
    return 'CAT em até 1 dia útil — acidente com material biológico é acidente de trabalho.';
  }
  return correct.trim() || 'Relacione a pegadinha ao passo correto do fluxo pós-exposição.';
}

function buildEntries(items: DangerZoneItem[]): PepEntry[] {
  return items.map((item, index) => {
    const label = item.label || item.title || `Pegadinha ${index + 1}`;
    const detail = item.detail || item.description || '';
    const correct = typeof item.correct === 'string' ? item.correct.trim() : '';
    const slot = inferPepSlot(label, detail, correct);
    return {
      slot,
      index,
      label,
      detail,
      correct,
      fixation: inferFixation(slot, correct),
      critical: slot === 'lavar' || slot === 'notificar',
    };
  });
}

interface DangerZoneTrabalhoPepTrapArenaProps {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  footerRule?: string;
}

export function DangerZoneTrabalhoPepTrapArena({
  content,
  items,
  theme,
  footerRule,
}: DangerZoneTrabalhoPepTrapArenaProps) {
  const reduceMotion = useReducedMotion();
  const entries = useMemo(() => buildEntries(items), [items]);
  const [activeSlot, setActiveSlot] = useState<PepSlot>(() => entries[0]?.slot ?? 'lavar');
  const [revealed, setRevealed] = useState<Set<number>>(() => new Set());

  const slotEntries = useMemo(
    () => entries.filter((e) => e.slot === activeSlot),
    [entries, activeSlot],
  );
  const activeEntry = slotEntries[0] ?? entries.find((e) => e.slot === activeSlot);
  const meta = SLOT_META[activeSlot];
  const SlotIcon = meta.icon;

  const slotsWithItems = useMemo(() => {
    const seen = new Set<PepSlot>();
    for (const e of entries) seen.add(e.slot);
    const ordered = [...PEP_CHAIN_SLOTS, 'cat' as PepSlot, 'retorno' as PepSlot];
    return ordered.filter((s) => seen.has(s));
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
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-amber-200/80 bg-white/90 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-amber-800 shadow-sm">
            <HardHat className="h-3 w-3" aria-hidden />
            PEP Arena
          </span>
          {content ? (
            <p className="font-body text-sm font-semibold leading-snug text-slate-800">{content}</p>
          ) : null}
          <p className="flex items-center gap-1.5 font-body text-xs font-medium text-slate-600">
            <Hand className="h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden />
            Escolha o passo do fluxo e toque para revelar a conduta correta
          </p>
        </div>

        <div className="flex items-center justify-between gap-1 rounded-xl border border-amber-200/70 bg-amber-50/50 px-2 py-2">
          {PEP_CHAIN_SLOTS.map((slot, i) => {
            const hasItem = slotsWithItems.includes(slot);
            const isActive = activeSlot === slot;
            return (
              <div key={slot} className="flex min-w-0 flex-1 items-center gap-1">
                <button
                  type="button"
                  disabled={!hasItem}
                  onClick={() => hasItem && setActiveSlot(slot)}
                  className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-0.5 py-1 transition-all ${
                    isActive
                      ? 'bg-amber-200/90 ring-2 ring-amber-400/60'
                      : hasItem
                        ? 'bg-white/70 opacity-90 hover:opacity-100'
                        : 'opacity-40'
                  }`}
                >
                  <span className={`font-mono text-[8px] font-black uppercase ${isActive ? 'text-amber-900' : 'text-slate-500'}`}>
                    {pepSlotLabel(slot)}
                  </span>
                </button>
                {i < PEP_CHAIN_SLOTS.length - 1 ? (
                  <span className="font-mono text-[10px] text-amber-400/80" aria-hidden>
                    →
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
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
                    : 'border-slate-200/90 bg-white/80 shadow-sm hover:shadow-md hover:ring-1 hover:ring-amber-200/80 active:scale-[0.98]'
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
                          : 'O que a banca espera neste passo?'}
                      </p>
                    </div>
                  </div>
                </button>

                {revealed.has(activeEntry.index) ? (
                  <p className="rounded-lg border border-amber-200/70 bg-white/80 px-3 py-2 font-body text-xs text-amber-900/90">
                    {activeEntry.fixation}
                  </p>
                ) : null}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

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
