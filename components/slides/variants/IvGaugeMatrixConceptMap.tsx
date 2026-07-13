'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Syringe } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { SlideLucideIcon } from '../core/SlideLucideIcon';
import {
  extractGaugeFromText,
  inferIvGaugeSlot,
  IV_GAUGE_VALUES,
  type IvGaugeSlot,
} from '@/lib/slides/puncaoBranchSlideUtils';

export interface IvGaugeConcept {
  icon: string;
  title: string;
  description: string;
}

const ROWS: { id: string; label: string }[] = [
  { id: 'volume', label: 'Volume' },
  { id: 'geral', label: 'Geral' },
  { id: 'ped', label: 'Pediátrico' },
];

const SLOT_CELL: Record<IvGaugeSlot, string> = {
  dispositivo: 'bg-indigo-100/80',
  calibre: 'bg-sky-200/90 ring-2 ring-sky-400/50',
  indicacao: 'bg-emerald-100/80',
  pediatrico: 'bg-violet-100/80',
  pegadinha: 'bg-amber-100/80',
  geral: 'bg-slate-50/80',
};

interface IvGaugeMatrixConceptMapProps {
  concepts: IvGaugeConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

export function IvGaugeMatrixConceptMap({ concepts, footerRule }: IvGaugeMatrixConceptMapProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const cells = useMemo(() => {
    return concepts
      .filter((c) => !/gabarito|letra\s*[a-e]/i.test(`${c.title} ${c.description}`))
      .slice(0, 8)
      .map((c, i) => ({
        ...c,
        slot: inferIvGaugeSlot(c.title, c.description),
        gauge: extractGaugeFromText(`${c.title} ${c.description}`),
        row: ROWS[i % ROWS.length].id,
        col: IV_GAUGE_VALUES[i % IV_GAUGE_VALUES.length],
      }));
  }, [concepts]);

  const active = activeIndex !== null ? cells[activeIndex] : null;

  const toggle = useCallback((index: number) => {
    setActiveIndex((cur) => (cur === index ? null : index));
  }, []);

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-4">
      <div className="absolute inset-0 bg-[#0a0f1e]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_50%_40%,#1e1b4b_0%,#0a0f1e_70%)]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col gap-3">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-indigo-300/40 bg-indigo-950/60 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-indigo-200">
          <Syringe className="h-3 w-3" aria-hidden />
          IV Gauge Matrix
        </span>

        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur-sm">
          <div className="min-w-[280px]">
            <div className="mb-1 grid grid-cols-[52px_repeat(6,1fr)] gap-1">
              <div />
              {IV_GAUGE_VALUES.map((g) => (
                <div
                  key={g}
                  className="text-center font-mono text-[9px] font-black text-indigo-200/90"
                >
                  {g}G
                </div>
              ))}
            </div>
            {ROWS.map((row) => (
              <div key={row.id} className="mb-1 grid grid-cols-[52px_repeat(6,1fr)] gap-1">
                <div className="flex items-center font-mono text-[8px] font-bold uppercase text-slate-400">
                  {row.label}
                </div>
                {IV_GAUGE_VALUES.map((g) => {
                  const cellIndex = cells.findIndex((c) => c.col === g && c.row === row.id);
                  const cell = cellIndex >= 0 ? cells[cellIndex] : null;
                  const isActive = cellIndex === activeIndex;
                  return (
                    <button
                      key={`${row.id}-${g}`}
                      type="button"
                      disabled={!cell}
                      onClick={() => cell && toggle(cellIndex)}
                      className={`flex min-h-[44px] items-center justify-center rounded-lg border border-white/10 transition-all ${
                        cell
                          ? `${SLOT_CELL[cell.slot]} ${isActive ? 'scale-105 ring-2 ring-cyan-400/60' : 'hover:scale-[1.02]'}`
                          : 'bg-white/5 opacity-30'
                      }`}
                      aria-pressed={isActive}
                    >
                      {cell ? (
                        <SlideLucideIcon name={cell.icon} className="h-4 w-4 text-indigo-900" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {active ? (
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="rounded-2xl border border-indigo-300/30 bg-indigo-950/80 p-4 backdrop-blur-md"
            >
              <p className="font-body text-sm font-bold text-white">{active.title}</p>
              <p className="mt-1 font-body text-sm leading-relaxed text-indigo-100/90">
                {active.description}
              </p>
            </motion.div>
          ) : (
            <p className="text-center font-mono text-[9px] font-bold uppercase tracking-widest text-indigo-300/60">
              Toque na célula → indicação do calibre
            </p>
          )}
        </AnimatePresence>

        {footerRule ? (
          <p className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center font-body text-xs italic text-slate-300">
            {footerRule}
          </p>
        ) : null}
      </div>
    </div>
  );
}
