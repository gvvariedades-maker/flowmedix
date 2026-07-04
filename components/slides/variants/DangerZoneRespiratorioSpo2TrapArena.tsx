'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Activity,
  Check,
  Cigarette,
  Droplets,
  Gauge,
  Pill,
  Wind,
  X,
} from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { DangerZoneItem } from './DangerZone';
import {
  inferRespiratorioTrapSlot,
  respiratorioTrapSlotLabel,
  RESPIRATORIO_TRAP_SLOTS,
  type RespiratorioTrapSlot,
} from '@/lib/slides/respiratorioCronicoSlideUtils';

type TrapEntry = {
  slot: RespiratorioTrapSlot;
  index: number;
  label: string;
  detail: string;
  correct: string;
  fixation: string;
  critical: boolean;
};

const SLOT_META: Record<
  RespiratorioTrapSlot,
  {
    label: string;
    tag: string;
    bar: string;
    ring: string;
    panel: string;
    text: string;
    icon: typeof Wind;
  }
> = {
  spo2_alvo: {
    label: 'SpO₂ alvo',
    tag: '88–92% DPOC',
    bar: 'bg-sky-500',
    ring: 'ring-sky-400/60',
    panel: 'from-sky-50/95 via-white to-cyan-50/90',
    text: 'text-sky-900',
    icon: Gauge,
  },
  oxigenio: {
    label: 'O₂ titulado',
    tag: 'baixo fluxo',
    bar: 'bg-cyan-500',
    ring: 'ring-cyan-400/60',
    panel: 'from-cyan-50/95 via-white to-teal-50/90',
    text: 'text-cyan-900',
    icon: Droplets,
  },
  asma_resgate: {
    label: 'Resgate',
    tag: 'beta-2',
    bar: 'bg-violet-500',
    ring: 'ring-violet-400/60',
    panel: 'from-violet-50/95 via-white to-purple-50/90',
    text: 'text-violet-900',
    icon: Pill,
  },
  tabagismo: {
    label: 'Tabagismo',
    tag: 'cessação',
    bar: 'bg-amber-500',
    ring: 'ring-amber-400/60',
    panel: 'from-amber-50/95 via-white to-orange-50/90',
    text: 'text-amber-900',
    icon: Cigarette,
  },
  exacerbacao: {
    label: 'Exacerbação',
    tag: 'sinais de alarme',
    bar: 'bg-rose-500',
    ring: 'ring-rose-400/60',
    panel: 'from-rose-50/95 via-white to-pink-50/90',
    text: 'text-rose-900',
    icon: Activity,
  },
  dispositivo: {
    label: 'Dispositivo',
    tag: 'inalação',
    bar: 'bg-teal-500',
    ring: 'ring-teal-400/60',
    panel: 'from-teal-50/95 via-white to-emerald-50/90',
    text: 'text-teal-900',
    icon: Wind,
  },
};

function inferFixation(_slot: RespiratorioTrapSlot, correct: string): string {
  return correct.trim();
}

function buildEntries(items: DangerZoneItem[]): TrapEntry[] {
  return items.map((item, index) => {
    const label = item.label || item.title || `Pegadinha ${index + 1}`;
    const detail = item.detail || item.description || '';
    const correct = typeof item.correct === 'string' ? item.correct.trim() : '';
    const slot = inferRespiratorioTrapSlot(label, detail, correct);
    return {
      slot,
      index,
      label,
      detail,
      correct,
      fixation: inferFixation(slot, correct),
      critical: slot === 'spo2_alvo' || slot === 'oxigenio',
    };
  });
}

interface DangerZoneRespiratorioSpo2TrapArenaProps {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  footerRule?: string;
}

export function DangerZoneRespiratorioSpo2TrapArena({
  content,
  items,
  theme,
  footerRule,
}: DangerZoneRespiratorioSpo2TrapArenaProps) {
  const reduceMotion = useReducedMotion();
  const entries = useMemo(() => buildEntries(items), [items]);
  const [activeSlot, setActiveSlot] = useState<RespiratorioTrapSlot>(
    () => entries[0]?.slot ?? 'spo2_alvo',
  );
  const [revealed, setRevealed] = useState<Set<number>>(() => new Set());

  const slotEntries = useMemo(
    () => entries.filter((e) => e.slot === activeSlot),
    [entries, activeSlot],
  );
  const activeEntry = slotEntries[0] ?? entries.find((e) => e.slot === activeSlot);
  const meta = SLOT_META[activeSlot];
  const SlotIcon = meta.icon;

  const slotsWithItems = useMemo(() => {
    const seen = new Set<RespiratorioTrapSlot>();
    for (const e of entries) seen.add(e.slot);
    return RESPIRATORIO_TRAP_SLOTS.filter((s) => seen.has(s));
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
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-cyan-200/80 bg-white/90 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-cyan-800 shadow-sm">
            <Wind className="h-3 w-3" aria-hidden />
            SpO₂ Trap Arena
          </span>
          {content ? (
            <p className="font-body text-sm font-semibold leading-snug text-slate-800">{content}</p>
          ) : null}
          <p className="flex items-center gap-1.5 font-body text-xs font-medium text-slate-600">
            <Gauge className="h-3.5 w-3.5 shrink-0 text-cyan-600" aria-hidden />
            Escolha o eixo da pegadinha e toque para revelar a conduta correta
          </p>
        </div>

        {slotsWithItems.length > 1 ? (
          <div className="flex flex-wrap items-center justify-center gap-1 rounded-xl border border-cyan-200/70 bg-cyan-50/50 px-2 py-2">
            {slotsWithItems.map((slot, i) => {
              const isActive = activeSlot === slot;
              return (
                <div key={slot} className="flex min-w-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveSlot(slot)}
                    className={`flex min-h-11 min-w-[4.5rem] flex-col items-center justify-center gap-0.5 rounded-lg px-1.5 py-1 transition-all ${
                      isActive
                        ? 'bg-cyan-200/90 ring-2 ring-cyan-400/60'
                        : 'bg-white/70 opacity-90 hover:opacity-100'
                    }`}
                  >
                    <span
                      className={`font-mono text-[8px] font-black uppercase leading-tight ${isActive ? 'text-cyan-900' : 'text-slate-500'}`}
                    >
                      {respiratorioTrapSlotLabel(slot)}
                    </span>
                  </button>
                  {i < slotsWithItems.length - 1 ? (
                    <span className="font-mono text-[10px] text-cyan-400/80" aria-hidden>
                      →
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-3">
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
                className={`flex min-h-11 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border px-1 py-2 transition-all ${
                  isActive
                    ? `border-2 bg-white shadow-lg ${slotMeta.ring} ring-2`
                    : 'border-slate-200/90 bg-white/80 shadow-sm hover:shadow-md hover:ring-1 hover:ring-cyan-200/80 active:scale-[0.98]'
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
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.bar} text-white shadow-inner`}
                  >
                    <SlotIcon className="h-5 w-5" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <p className={`font-mono text-[9px] font-extrabold uppercase tracking-widest ${meta.text}`}>
                      {meta.label} · {meta.tag}
                    </p>
                    <h3 className="font-body text-sm font-semibold leading-snug text-slate-900">
                      {activeEntry.label}
                    </h3>
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
                          : 'O que a banca espera nesta pegadinha?'}
                      </p>
                    </div>
                  </div>
                </button>

                {revealed.has(activeEntry.index) && activeEntry.fixation ? (
                  <p className="rounded-lg border border-cyan-200/70 bg-white/80 px-3 py-2 font-body text-xs text-cyan-900/90">
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
