'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Baby, Check, HeartPulse, Ruler, X } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { DangerZoneItem } from './DangerZone';
import {
  inferUrgenciasPediatricTrapSlot,
  urgenciasPediatricTrapSlotLabel,
  URGENCIAS_PEDIATRIC_TRAP_SLOTS,
  type UrgenciasPediatricTrapSlot,
} from '@/lib/slides/urgenciasPediatricSlideUtils';

type TrapEntry = {
  slot: UrgenciasPediatricTrapSlot;
  index: number;
  label: string;
  detail: string;
  correct: string;
};

const SLOT_META: Record<
  UrgenciasPediatricTrapSlot,
  { label: string; tag: string; bar: string; ring: string; panel: string; text: string; icon: typeof Baby }
> = {
  proporcao_adulta: {
    label: '30:2',
    tag: 'adulto',
    bar: 'bg-rose-500',
    ring: 'ring-rose-400/60',
    panel: 'from-rose-50/95 via-white to-pink-50/90',
    text: 'text-rose-900',
    icon: HeartPulse,
  },
  profundidade_excesso: {
    label: '½ tórax',
    tag: 'prof.',
    bar: 'bg-pink-600',
    ring: 'ring-pink-400/60',
    panel: 'from-pink-50/95 via-white to-rose-50/90',
    text: 'text-pink-900',
    icon: Ruler,
  },
  proporcao_certa_prof_errada: {
    label: '15:2',
    tag: '½ errado',
    bar: 'bg-fuchsia-600',
    ring: 'ring-fuchsia-400/60',
    panel: 'from-fuchsia-50/95 via-white to-purple-50/90',
    text: 'text-fuchsia-900',
    icon: Baby,
  },
  transferencia_adulto: {
    label: 'Adulto',
    tag: '30:2',
    bar: 'bg-purple-600',
    ring: 'ring-purple-400/60',
    panel: 'from-purple-50/95 via-white to-violet-50/90',
    text: 'text-purple-900',
    icon: HeartPulse,
  },
};

function buildEntries(items: DangerZoneItem[]): TrapEntry[] {
  return items.map((item, index) => {
    const label = item.label || item.title || `Pegadinha ${index + 1}`;
    const detail = item.detail || item.description || '';
    const correct = typeof item.correct === 'string' ? item.correct.trim() : '';
    const slot = inferUrgenciasPediatricTrapSlot(label, detail, correct);
    return { slot, index, label, detail, correct };
  });
}

interface DangerZoneUrgenciasPediatricTrapArenaProps {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  footerRule?: string;
}

export function DangerZoneUrgenciasPediatricTrapArena({
  content,
  items,
  theme,
  footerRule,
}: DangerZoneUrgenciasPediatricTrapArenaProps) {
  const reduceMotion = useReducedMotion();
  const entries = useMemo(() => buildEntries(items), [items]);
  const [activeSlot, setActiveSlot] = useState<UrgenciasPediatricTrapSlot>(
    () => entries[0]?.slot ?? 'proporcao_adulta',
  );
  const [revealed, setRevealed] = useState<Set<number>>(() => new Set());

  const activeEntry = entries.find((e) => e.slot === activeSlot) ?? entries[0];
  const meta = SLOT_META[activeSlot];
  const SlotIcon = meta.icon;

  const slotsWithItems = useMemo(() => {
    const seen = new Set<UrgenciasPediatricTrapSlot>();
    for (const e of entries) seen.add(e.slot);
    return URGENCIAS_PEDIATRIC_TRAP_SLOTS.filter((s) => seen.has(s));
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
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-pink-200/80 bg-white/90 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-pink-900 shadow-sm">
          <Baby className="h-3 w-3" aria-hidden />
          Pediatric Trap Arena
        </span>
        {content ? (
          <p className="font-body text-sm font-semibold leading-snug text-slate-800">{content}</p>
        ) : null}

        <div className="grid grid-cols-2 gap-2">
          {slotsWithItems.map((slot) => {
            const slotMeta = SLOT_META[slot];
            const Icon = slotMeta.icon;
            const isActive = activeSlot === slot;
            return (
              <button
                key={slot}
                type="button"
                onClick={() => setActiveSlot(slot)}
                className={`flex min-h-11 flex-col items-center justify-center gap-1 rounded-2xl border px-1 py-2 transition-all ${
                  isActive
                    ? `border-2 bg-white shadow-lg ${slotMeta.ring} ring-2`
                    : 'border-slate-200/90 bg-white/80 shadow-sm hover:shadow-md'
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-xl ${slotMeta.bar} text-white shadow-inner`}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <span
                  className={`font-mono text-[7px] font-bold uppercase ${isActive ? slotMeta.text : 'text-slate-500'}`}
                >
                  {slotMeta.label}
                </span>
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
              className={`overflow-hidden rounded-2xl border-2 border-white/80 bg-gradient-to-br shadow-xl ${meta.panel} ${meta.ring} ring-1`}
            >
              <div className="border-b border-black/5 px-4 py-3">
                <p className={`font-mono text-[9px] font-extrabold uppercase tracking-widest ${meta.text}`}>
                  {urgenciasPediatricTrapSlotLabel(activeSlot)} · {meta.tag}
                </p>
                <h3 className="font-body text-sm font-semibold leading-snug text-slate-900">
                  {activeEntry.label}
                </h3>
              </div>
              <div className="space-y-3 px-4 py-3">
                <p className="font-body text-sm leading-relaxed text-slate-700">{activeEntry.detail}</p>
                <button
                  type="button"
                  onClick={() => toggleReveal(activeEntry.index)}
                  className={`w-full rounded-xl border px-3 py-3 text-left transition-all ${
                    revealed.has(activeEntry.index)
                      ? 'border-emerald-300/80 bg-emerald-50/90'
                      : 'border-pink-300/80 bg-pink-50/90 hover:shadow-sm active:scale-[0.99]'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        revealed.has(activeEntry.index)
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-pink-100 text-pink-700'
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
                          ? activeEntry.correct
                          : 'O que a banca espera nesta pegadinha?'}
                      </p>
                    </div>
                  </div>
                </button>
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
