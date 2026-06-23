'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Hand, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';
import {
  inferSigiloSpectrumZone,
  sigiloSpectrumLabel,
  type SigiloSpectrumZone,
} from '@/lib/slides/adolescentSlideUtils';

const ZONE_META: Record<
  SigiloSpectrumZone,
  {
    icon: typeof Shield;
    color: string;
    bg: string;
    border: string;
    hint: string;
    position: string;
  }
> = {
  protegido: {
    icon: ShieldCheck,
    color: 'text-emerald-800',
    bg: 'bg-emerald-100/90',
    border: 'border-emerald-400/80',
    hint: 'Tema protegido por sigilo — contracepção, orientação sexual, IST.',
    position: 'left-[8%]',
  },
  ponderar: {
    icon: Shield,
    color: 'text-amber-900',
    bg: 'bg-amber-100/90',
    border: 'border-amber-400/80',
    hint: 'Avaliar risco grave, violência ou notificação compulsória antes de quebrar.',
    position: 'left-1/2 -translate-x-1/2',
  },
  quebrar: {
    icon: ShieldAlert,
    color: 'text-rose-900',
    bg: 'bg-rose-100/90',
    border: 'border-rose-400/80',
    hint: 'Pegadinha: sigilo não é zero absoluto nem quebra sem critério.',
    position: 'right-[8%]',
  },
};

interface GoldenRuleAdolescentSigiloSpectrumProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

export function GoldenRuleAdolescentSigiloSpectrum({
  content,
  rows,
  theme,
  footerRule,
}: GoldenRuleAdolescentSigiloSpectrumProps) {
  const reduceMotion = useReducedMotion();
  const [selected, setSelected] = useState(() => {
    const alertIdx = rows.findIndex((r) => r.emphasis === 'alert');
    if (alertIdx >= 0) return alertIdx;
    const successIdx = rows.findIndex((r) => r.emphasis === 'success');
    return successIdx >= 0 ? successIdx : 0;
  });

  const rowZones = useMemo(
    () =>
      rows.map((row) =>
        inferSigiloSpectrumZone(`${row.label} ${row.value} ${row.emphasis ?? ''}`),
      ),
    [rows],
  );

  const activeRow = rows[selected];
  const activeZone = rowZones[selected] ?? 'ponderar';
  const activeMeta = ZONE_META[activeZone];
  const ActiveIcon = activeMeta.icon;

  const selectRow = useCallback((index: number) => setSelected(index), []);

  if (!activeRow) return null;

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-4 md:p-6">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-40`} />

      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col gap-4">
        {content ? (
          <p className="text-center font-display text-lg font-black uppercase tracking-wide text-sky-900 md:text-xl">
            {content.length <= 36 ? content : 'Espectro do sigilo'}
          </p>
        ) : null}

        <div
          role="status"
          className="flex flex-col items-center gap-1.5 rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-center"
        >
          <p className="flex items-center justify-center gap-2 font-body text-sm font-semibold text-amber-950">
            <Hand className="h-4 w-4 shrink-0 text-amber-700" aria-hidden />
            Toque em cada linha abaixo do espectro
          </p>
          <p className="font-body text-xs leading-relaxed text-amber-900/85">
            O marcador sobe na barra (Protegido · Ponderar · Quebrar) e o painel explica a pegadinha.
          </p>
        </div>

        <p className="text-center font-mono text-[10px] font-bold uppercase tracking-widest text-sky-700/80">
          Onde cada afirmativa cai no espectro ético?
        </p>

        <div className="relative rounded-2xl border border-sky-200/80 bg-white/90 p-4 pt-8 shadow-lg shadow-sky-100/50">
          <div className="relative h-3 overflow-hidden rounded-full bg-gradient-to-r from-emerald-300 via-amber-300 to-rose-300">
            <div className="absolute inset-0 flex">
              <div className="flex-1 border-r border-white/40" />
              <div className="flex-1 border-r border-white/40" />
              <div className="flex-1" />
            </div>
          </div>

          <div className="mt-1 flex justify-between px-1">
            {(['protegido', 'ponderar', 'quebrar'] as SigiloSpectrumZone[]).map((zone) => (
              <span
                key={zone}
                className={`font-mono text-[8px] font-bold uppercase tracking-wide ${
                  activeZone === zone ? ZONE_META[zone].color : 'text-slate-400'
                }`}
              >
                {sigiloSpectrumLabel(zone)}
              </span>
            ))}
          </div>

          <motion.div
            layout
            className={`absolute top-2 ${activeMeta.position} flex flex-col items-center`}
            transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 320, damping: 28 }}
          >
            <div className={`rounded-full border-2 p-2 shadow-md ${activeMeta.bg} ${activeMeta.border}`}>
              <ActiveIcon className={`h-5 w-5 ${activeMeta.color}`} aria-hidden />
            </div>
            <div className="mt-1 h-4 w-0.5 rounded-full bg-slate-400/80" aria-hidden />
          </motion.div>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {rows.map((row, index) => {
            const zone = rowZones[index];
            const meta = ZONE_META[zone];
            const isActive = selected === index;
            return (
              <button
                key={index}
                type="button"
                onClick={() => selectRow(index)}
                aria-pressed={isActive}
                aria-label={`Linha ${row.label}: ${row.value}. Toque para ver no espectro.`}
                className={`min-h-[44px] min-w-[44px] cursor-pointer rounded-xl border px-3 py-2 text-left transition-all ${
                  isActive
                    ? `${meta.bg} ${meta.border} ring-2 ring-offset-1 ${meta.border.replace('border-', 'ring-')}`
                    : 'border-dashed border-slate-300/90 bg-white/80 hover:border-sky-300 hover:bg-sky-50/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500">
                    {row.label || `Linha ${index + 1}`}
                  </p>
                  {!isActive ? (
                    <span className="flex items-center gap-0.5 font-mono text-[8px] font-bold uppercase text-sky-600">
                      <Hand className="h-3 w-3" aria-hidden />
                      Toque
                    </span>
                  ) : (
                    <span className="font-mono text-[8px] font-bold uppercase text-slate-600">Ativa</span>
                  )}
                </div>
                <p className="mt-0.5 max-w-[148px] truncate font-body text-xs font-semibold text-slate-800">
                  {row.value}
                </p>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selected}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            className={`rounded-2xl border border-l-[5px] p-4 md:p-5 ${activeMeta.bg} ${activeMeta.border}`}
          >
            <p className={`font-mono text-[10px] font-bold uppercase tracking-widest ${activeMeta.color}`}>
              {sigiloSpectrumLabel(activeZone)} — {activeRow.label}
            </p>
            <p className="mt-2 font-body text-base font-bold leading-snug text-slate-900 md:text-lg">
              {activeRow.value}
            </p>
            <p className="mt-3 rounded-xl border border-white/60 bg-white/50 px-3 py-2 font-body text-sm leading-relaxed text-slate-700">
              {activeMeta.hint}
            </p>
          </motion.div>
        </AnimatePresence>

        {footerRule ? (
          <p className="rounded-xl border border-sky-200/70 bg-sky-50/80 px-4 py-3 text-center font-body text-sm italic text-sky-900/80">
            {footerRule}
          </p>
        ) : null}
      </div>
    </div>
  );
}
