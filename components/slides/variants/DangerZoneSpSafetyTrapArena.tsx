'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  AlertTriangle,
  BadgeCheck,
  Check,
  FileWarning,
  ShieldAlert,
  X,
} from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { DangerZoneItem } from './DangerZone';
import {
  inferSpBranchFromText,
  inferSpTrapFixation,
  inferSpTrapSlot,
  spTrapSlotLabel,
  type SpBranchHint,
  type SpTrapSlot,
} from '@/lib/slides/segurancaPacienteSlideUtils';

type TrapEntry = {
  slot: SpTrapSlot;
  index: number;
  label: string;
  detail: string;
  correct: string;
  fixation: string;
  branch: SpBranchHint;
};

const SLOT_META: Record<
  SpTrapSlot,
  {
    label: string;
    tag: string;
    bar: string;
    ring: string;
    panel: string;
    text: string;
    icon: typeof ShieldAlert;
  }
> = {
  two_identifiers: {
    label: '2 IDs',
    tag: 'NSP',
    bar: 'bg-amber-500',
    ring: 'ring-amber-400/60',
    panel: 'from-amber-50/95 via-white to-orange-50/90',
    text: 'text-amber-900',
    icon: BadgeCheck,
  },
  wristband: {
    label: 'Pulseira',
    tag: 'identificação',
    bar: 'bg-orange-500',
    ring: 'ring-orange-400/60',
    panel: 'from-orange-50/95 via-white to-amber-50/90',
    text: 'text-orange-900',
    icon: BadgeCheck,
  },
  bedside: {
    label: 'Leito',
    tag: 'checagem',
    bar: 'bg-yellow-500',
    ring: 'ring-yellow-400/60',
    panel: 'from-yellow-50/95 via-white to-amber-50/90',
    text: 'text-yellow-900',
    icon: BadgeCheck,
  },
  homonym: {
    label: 'Homônimo',
    tag: 'pegadinha',
    bar: 'bg-rose-500',
    ring: 'ring-rose-400/60',
    panel: 'from-rose-50/95 via-white to-pink-50/90',
    text: 'text-rose-900',
    icon: AlertTriangle,
  },
  barcode: {
    label: 'Código',
    tag: 'ID',
    bar: 'bg-slate-500',
    ring: 'ring-slate-400/60',
    panel: 'from-slate-50/95 via-white to-gray-50/90',
    text: 'text-slate-900',
    icon: BadgeCheck,
  },
  wrong_patient: {
    label: 'Paciente errado',
    tag: 'erro clássico',
    bar: 'bg-red-500',
    ring: 'ring-red-400/60',
    panel: 'from-red-50/95 via-white to-rose-50/90',
    text: 'text-red-900',
    icon: AlertTriangle,
  },
  morse: {
    label: 'Morse',
    tag: 'escala',
    bar: 'bg-amber-600',
    ring: 'ring-amber-500/60',
    panel: 'from-amber-50/95 via-white to-yellow-50/90',
    text: 'text-amber-950',
    icon: ShieldAlert,
  },
  risk_factor: {
    label: 'Risco',
    tag: 'fator',
    bar: 'bg-orange-600',
    ring: 'ring-orange-500/60',
    panel: 'from-orange-50/95 via-white to-amber-50/90',
    text: 'text-orange-950',
    icon: ShieldAlert,
  },
  environment: {
    label: 'Ambiente',
    tag: 'grades',
    bar: 'bg-yellow-600',
    ring: 'ring-yellow-500/60',
    panel: 'from-yellow-50/95 via-white to-amber-50/90',
    text: 'text-yellow-950',
    icon: ShieldAlert,
  },
  intervention: {
    label: 'Intervenção',
    tag: 'protocolo',
    bar: 'bg-amber-500',
    ring: 'ring-amber-400/60',
    panel: 'from-amber-50/95 via-white to-orange-50/90',
    text: 'text-amber-900',
    icon: ShieldAlert,
  },
  bracelet: {
    label: 'Pulseira',
    tag: 'queda',
    bar: 'bg-rose-500',
    ring: 'ring-rose-400/60',
    panel: 'from-rose-50/95 via-white to-pink-50/90',
    text: 'text-rose-900',
    icon: ShieldAlert,
  },
  mobility: {
    label: 'Mobilidade',
    tag: 'transferência',
    bar: 'bg-slate-600',
    ring: 'ring-slate-500/60',
    panel: 'from-slate-50/95 via-white to-gray-50/90',
    text: 'text-slate-900',
    icon: ShieldAlert,
  },
  adverse_event: {
    label: 'Evento adverso',
    tag: 'PNSP',
    bar: 'bg-rose-600',
    ring: 'ring-rose-500/60',
    panel: 'from-rose-50/95 via-white to-pink-50/90',
    text: 'text-rose-950',
    icon: FileWarning,
  },
  incident: {
    label: 'Incidente',
    tag: 'sem dano',
    bar: 'bg-amber-500',
    ring: 'ring-amber-400/60',
    panel: 'from-amber-50/95 via-white to-orange-50/90',
    text: 'text-amber-900',
    icon: FileWarning,
  },
  near_miss: {
    label: 'Quase erro',
    tag: 'near miss',
    bar: 'bg-orange-500',
    ring: 'ring-orange-400/60',
    panel: 'from-orange-50/95 via-white to-amber-50/90',
    text: 'text-orange-900',
    icon: FileWarning,
  },
  no_harm: {
    label: 'Sem dano',
    tag: 'classificação',
    bar: 'bg-yellow-500',
    ring: 'ring-yellow-400/60',
    panel: 'from-yellow-50/95 via-white to-amber-50/90',
    text: 'text-yellow-900',
    icon: FileWarning,
  },
  notification: {
    label: 'Notificação',
    tag: 'obrigatória',
    bar: 'bg-slate-600',
    ring: 'ring-slate-500/60',
    panel: 'from-slate-50/95 via-white to-gray-50/90',
    text: 'text-slate-900',
    icon: FileWarning,
  },
  culture: {
    label: 'Cultura',
    tag: 'NSP',
    bar: 'bg-emerald-500',
    ring: 'ring-emerald-400/60',
    panel: 'from-emerald-50/95 via-white to-teal-50/90',
    text: 'text-emerald-900',
    icon: FileWarning,
  },
  general: {
    label: 'Segurança',
    tag: 'NSP',
    bar: 'bg-amber-400',
    ring: 'ring-amber-300/60',
    panel: 'from-amber-50/95 via-white to-orange-50/90',
    text: 'text-amber-900',
    icon: ShieldAlert,
  },
};

function defaultMeta(slot: SpTrapSlot) {
  return SLOT_META[slot] ?? SLOT_META.general;
}

function buildEntries(items: DangerZoneItem[], branchHint?: SpBranchHint): TrapEntry[] {
  return items.map((item, index) => {
    const label = item.label || item.title || `Pegadinha ${index + 1}`;
    const detail = item.detail || item.description || '';
    const correct = typeof item.correct === 'string' ? item.correct.trim() : '';
    const branch =
      branchHint ??
      inferSpBranchFromText(`${label} ${detail} ${correct} ${items.map((i) => i.label).join(' ')}`);
    const slot = inferSpTrapSlot(label, detail, correct, branch);
    return {
      slot,
      index,
      label,
      detail,
      correct,
      branch,
      fixation: inferSpTrapFixation(slot, correct),
    };
  });
}

interface DangerZoneSpSafetyTrapArenaProps {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  footerRule?: string;
  pedagogicalBranch?: string;
}

export function DangerZoneSpSafetyTrapArena({
  content,
  items,
  theme,
  footerRule,
  pedagogicalBranch,
}: DangerZoneSpSafetyTrapArenaProps) {
  const reduceMotion = useReducedMotion();
  const branchHint = pedagogicalBranch?.startsWith('sp_')
    ? (pedagogicalBranch as SpBranchHint)
    : undefined;
  const entries = useMemo(() => buildEntries(items, branchHint), [items, branchHint]);
  const [activeSlot, setActiveSlot] = useState<SpTrapSlot>(() => entries[0]?.slot ?? 'general');
  const [revealed, setRevealed] = useState<Set<number>>(() => new Set());

  const slotsWithItems = useMemo(() => {
    const seen = new Set<SpTrapSlot>();
    for (const e of entries) seen.add(e.slot);
    return [...seen];
  }, [entries]);

  const slotEntries = useMemo(
    () => entries.filter((e) => e.slot === activeSlot),
    [entries, activeSlot],
  );
  const activeEntry = slotEntries[0] ?? entries.find((e) => e.slot === activeSlot);
  const meta = defaultMeta(activeSlot);
  const SlotIcon = meta.icon;

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
          <span className="inline-flex w-fit min-h-[44px] items-center gap-1.5 rounded-full border border-amber-200/80 bg-white/90 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-amber-800 shadow-sm">
            <ShieldAlert className="h-3 w-3" aria-hidden />
            NSP Trap Arena
          </span>
          {content ? (
            <p className="font-body text-sm font-semibold leading-snug text-slate-800">{content}</p>
          ) : null}
          <p className="font-body text-xs font-medium text-slate-600">
            Escolha o slot temático e toque para revelar a conduta correta
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {slotsWithItems.map((slot) => {
            const slotMeta = defaultMeta(slot);
            const Icon = slotMeta.icon;
            const isActive = activeSlot === slot;
            const count = entries.filter((e) => e.slot === slot).length;
            return (
              <button
                key={slot}
                type="button"
                onClick={() => setActiveSlot(slot)}
                className={`flex min-h-[44px] cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border px-1 py-2 transition-all ${
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
                  className={`text-center font-mono text-[7px] font-bold uppercase leading-tight ${
                    isActive ? slotMeta.text : 'text-slate-500'
                  }`}
                >
                  {spTrapSlotLabel(slot)}
                </span>
                {count > 1 ? <span className="font-mono text-[6px] text-slate-400">{count}×</span> : null}
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
                      {activeEntry.label.replace(/^Letra\s+[A-E]\s*[—–-]\s*/i, '')}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="space-y-3 px-4 py-3">
                {activeEntry.detail ? (
                  <p className="font-body text-sm leading-relaxed text-slate-700">{activeEntry.detail}</p>
                ) : null}

                <button
                  type="button"
                  onClick={() => toggleReveal(activeEntry.index)}
                  className={`min-h-[44px] w-full rounded-xl border px-3 py-3 text-left transition-all ${
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
                          : 'O que a banca espera neste tema NSP?'}
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
