'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Check, Hospital, Tags, X } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { DangerZoneItem } from './DangerZone';
import {
  inferUrgenciasManchesterTrapSlot,
  urgenciasManchesterTrapSlotLabel,
  URGENCIAS_MANCHESTER_TRAP_SLOTS,
  type UrgenciasManchesterTrapSlot,
} from '@/lib/slides/urgenciasManchesterSlideUtils';

type TrapEntry = {
  slot: UrgenciasManchesterTrapSlot;
  index: number;
  label: string;
  detail: string;
  correct: string;
};

const SLOT_META: Record<
  UrgenciasManchesterTrapSlot,
  { label: string; tag: string; bar: string; ring: string; panel: string; text: string; icon: typeof Tags }
> = {
  amarelo_monitor: {
    label: 'Amarelo',
    tag: 'SSVV',
    bar: 'bg-yellow-400',
    ring: 'ring-yellow-400/60',
    panel: 'from-yellow-50/95 via-white to-amber-50/90',
    text: 'text-yellow-900',
    icon: Tags,
  },
  azul_instabilidade: {
    label: 'Azul',
    tag: 'crítico',
    bar: 'bg-sky-500',
    ring: 'ring-sky-400/60',
    panel: 'from-sky-50/95 via-white to-blue-50/90',
    text: 'text-sky-900',
    icon: Tags,
  },
  verde_transporte: {
    label: 'Verde',
    tag: 'leve',
    bar: 'bg-emerald-500',
    ring: 'ring-emerald-400/60',
    panel: 'from-emerald-50/95 via-white to-green-50/90',
    text: 'text-emerald-900',
    icon: Tags,
  },
  transferencia_ps: {
    label: 'PS',
    tag: 'cores',
    bar: 'bg-red-500',
    ring: 'ring-red-400/60',
    panel: 'from-red-50/95 via-white to-rose-50/90',
    text: 'text-red-900',
    icon: Hospital,
  },
};

function buildEntries(items: DangerZoneItem[]): TrapEntry[] {
  return items.map((item, index) => {
    const label = item.label || item.title || `Pegadinha ${index + 1}`;
    const detail = item.detail || item.description || '';
    const correct = typeof item.correct === 'string' ? item.correct.trim() : '';
    const slot = inferUrgenciasManchesterTrapSlot(label, detail, correct);
    return { slot, index, label, detail, correct };
  });
}

interface DangerZoneUrgenciasManchesterTrapProps {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  footerRule?: string;
}

export function DangerZoneUrgenciasManchesterTrap({
  content,
  items,
  theme,
  footerRule,
}: DangerZoneUrgenciasManchesterTrapProps) {
  const reduceMotion = useReducedMotion();
  const entries = useMemo(() => buildEntries(items), [items]);
  const [activeSlot, setActiveSlot] = useState<UrgenciasManchesterTrapSlot>(
    () => entries[0]?.slot ?? 'amarelo_monitor',
  );
  const [revealed, setRevealed] = useState<Set<number>>(() => new Set());

  const activeEntry = entries.find((e) => e.slot === activeSlot) ?? entries[0];
  const meta = SLOT_META[activeSlot];
  const SlotIcon = meta.icon;

  const slotsWithItems = useMemo(() => {
    const seen = new Set<UrgenciasManchesterTrapSlot>();
    for (const e of entries) seen.add(e.slot);
    return URGENCIAS_MANCHESTER_TRAP_SLOTS.filter((s) => seen.has(s));
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
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-red-200/80 bg-white/90 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-red-900 shadow-sm">
          <Tags className="h-3 w-3" aria-hidden />
          Manchester Trap
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
                  {urgenciasManchesterTrapSlotLabel(activeSlot)} · {meta.tag}
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
                      : 'border-red-300/80 bg-red-50/90 hover:shadow-sm active:scale-[0.99]'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        revealed.has(activeEntry.index)
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
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
