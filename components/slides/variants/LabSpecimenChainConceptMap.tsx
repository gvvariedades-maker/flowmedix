'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, FlaskConical } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';

export interface SpecimenChainConcept {
  icon: string;
  title: string;
  description: string;
}

type ChainSlot = 'id' | 'puncture' | 'temp' | 'waste' | 'phase' | 'trap' | 'answer';

const CHAIN: {
  id: ChainSlot;
  label: string;
  tag: string;
  bar: string;
  barSoft: string;
  panelGradient: string;
  active: string;
  text: string;
  accentBorder: string;
  examTip: string;
}[] = [
  {
    id: 'id',
    label: 'ID',
    tag: 'etiqueta',
    bar: 'bg-sky-500',
    barSoft: 'bg-sky-100/80',
    panelGradient: 'from-sky-50/95 via-white to-white',
    active: 'border-sky-500 bg-sky-50 ring-2 ring-sky-400/50',
    text: 'text-sky-950',
    accentBorder: 'border-l-sky-500',
    examTip: 'Identificação errada invalida toda a amostra — etiqueta antes do envio.',
  },
  {
    id: 'puncture',
    label: 'Punção',
    tag: 'mediana',
    bar: 'bg-teal-500',
    barSoft: 'bg-teal-100/80',
    panelGradient: 'from-teal-50/95 via-white to-white',
    active: 'border-teal-500 bg-teal-50 ring-2 ring-teal-400/50',
    text: 'text-teal-950',
    accentBorder: 'border-l-teal-500',
    examTip: 'I verdadeira: mediana cubital costuma ser preferida à cefálica na coleta venosa.',
  },
  {
    id: 'temp',
    label: '2–8°C',
    tag: 'frio',
    bar: 'bg-cyan-500',
    barSoft: 'bg-cyan-100/80',
    panelGradient: 'from-cyan-50/95 via-white to-white',
    active: 'border-cyan-500 bg-cyan-50 ring-2 ring-cyan-400/50',
    text: 'text-cyan-950',
    accentBorder: 'border-l-cyan-500',
    examTip: 'II verdadeira: transporte refrigerado em geral entre 2°C e 8°C.',
  },
  {
    id: 'waste',
    label: 'Descarte',
    tag: 'segregar',
    bar: 'bg-rose-500',
    barSoft: 'bg-rose-100/80',
    panelGradient: 'from-rose-50/95 via-white to-white',
    active: 'border-rose-500 bg-rose-50 ring-2 ring-rose-400/50',
    text: 'text-rose-950',
    accentBorder: 'border-l-rose-500',
    examTip: 'III falsa: perfurocortante nunca vai no mesmo recipiente que gaze ou luva.',
  },
  {
    id: 'phase',
    label: 'Pré',
    tag: 'analítica',
    bar: 'bg-indigo-500',
    barSoft: 'bg-indigo-100/80',
    panelGradient: 'from-indigo-50/95 via-white to-white',
    active: 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-400/50',
    text: 'text-indigo-950',
    accentBorder: 'border-l-indigo-500',
    examTip: 'A maior parte dos erros ocorre antes da análise: coleta, ID, acondicionamento e transporte.',
  },
];

function inferSlot(title: string, description: string): ChainSlot {
  const text = `${title} ${description}`.toLowerCase();
  if (/gabarito|letra\s*[a-e]|i e ii/.test(text)) return 'answer';
  if (/pegadinha|iii|perfurocortante.*mistur/.test(text)) return 'trap';
  if (/pré-analítica|pre-analitica|antes da análise/.test(text)) return 'phase';
  if (/segrega|descarte|perfurocortante|resíduo/.test(text)) return 'waste';
  if (/refrigera|2\s*°c|8\s*°c|temperatura|frio/.test(text)) return 'temp';
  if (/mediana|cubital|cefálica|punção|veia/.test(text)) return 'puncture';
  if (/identifica|etiqueta|pedido/.test(text)) return 'id';
  return 'phase';
}

interface LabSpecimenChainConceptMapProps {
  concepts: SpecimenChainConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

export function LabSpecimenChainConceptMap({
  concepts,
  theme,
  footerRule,
}: LabSpecimenChainConceptMapProps) {
  const [selected, setSelected] = useState<ChainSlot>('puncture');

  const { bySlot, answer, trap } = useMemo(() => {
    const slots: Record<ChainSlot, SpecimenChainConcept[]> = {
      id: [],
      puncture: [],
      temp: [],
      waste: [],
      phase: [],
      trap: [],
      answer: [],
    };

    for (const concept of concepts) {
      const slot = inferSlot(concept.title, concept.description);
      slots[slot].push(concept);
    }

    return {
      bySlot: slots,
      answer: slots.answer[0] ?? concepts.find((c) => /gabarito|letra/i.test(c.description)),
      trap: slots.trap[0] ?? concepts.find((c) => /pegadinha|iii/i.test(c.title)),
    };
  }, [concepts]);

  const selectSlot = useCallback((slot: ChainSlot) => setSelected(slot), []);

  const activeChain = CHAIN.find((c) => c.id === selected)!;
  const activeConcepts = bySlot[selected];
  const primaryConcept = activeConcepts[0];

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-4 md:p-6">
      <motion.div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-40`} />

      <div className="relative z-10 mx-auto flex w-full min-w-0 max-w-5xl flex-col gap-4">
        <div className="flex items-center gap-3 rounded-2xl border border-sky-200/70 bg-white/90 px-4 py-3 shadow-sm">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
            <FlaskConical className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-sky-700">
              Cadeia pré-analítica
            </p>
            <p className="font-body text-sm text-slate-600">Toque cada elo — da punção ao gabarito</p>
          </div>
        </div>

        <div className="flex items-stretch gap-0.5 overflow-x-auto pb-1">
          {CHAIN.map((slot, index) => {
            const isActive = selected === slot.id;
            const hasConcept = bySlot[slot.id].length > 0;
            return (
              <div key={slot.id} className="flex min-w-0 flex-1 items-center">
                <button
                  type="button"
                  onClick={() => selectSlot(slot.id)}
                  className={`flex min-w-[3.5rem] flex-1 flex-col items-center gap-1 rounded-xl border px-1 py-2 transition-all ${
                    isActive ? slot.active : 'border-slate-200/80 bg-white/70 hover:bg-white'
                  } ${!hasConcept && !isActive ? 'opacity-60' : ''}`}
                >
                  <span
                    className={`h-1.5 w-full max-w-[2.5rem] rounded-full ${isActive ? slot.bar : slot.barSoft}`}
                  />
                  <span className={`font-mono text-[10px] font-black ${isActive ? slot.text : 'text-slate-600'}`}>
                    {slot.label}
                  </span>
                  <span className="font-mono text-[7px] uppercase text-slate-500">{slot.tag}</span>
                </button>
                {index < CHAIN.length - 1 ? (
                  <ChevronRight className="mx-0.5 h-4 w-4 shrink-0 text-slate-300" aria-hidden />
                ) : null}
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selected}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className={`overflow-hidden rounded-2xl border-2 bg-gradient-to-br shadow-md ${activeChain.active} ${activeChain.panelGradient}`}
          >
            <div className={`border-l-[5px] p-4 md:p-5 ${activeChain.accentBorder}`}>
              {primaryConcept ? (
                <>
                  <div className="mb-3 flex items-start gap-3">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${activeChain.barSoft}`}>
                      {(() => {
                        const Icon = resolveLucideIcon(primaryConcept.icon);
                        return <Icon className={`h-5 w-5 ${activeChain.text}`} aria-hidden />;
                      })()}
                    </div>
                    <div className="min-w-0">
                      <p className={`font-mono text-[10px] font-bold uppercase tracking-wider ${activeChain.text}`}>
                        {activeChain.tag}
                      </p>
                      <h3 className="font-display text-base font-extrabold text-slate-900 md:text-lg">
                        {primaryConcept.title}
                      </h3>
                    </div>
                  </div>
                  <p className="font-body text-sm leading-relaxed text-slate-700 md:text-base">
                    {primaryConcept.description}
                  </p>
                  {activeConcepts.length > 1
                    ? activeConcepts.slice(1).map((c) => (
                        <p key={c.title} className="mt-2 font-body text-xs text-slate-600 md:text-sm">
                          <strong className="text-slate-800">{c.title}:</strong> {c.description}
                        </p>
                      ))
                    : null}
                </>
              ) : (
                <p className="font-body text-sm text-slate-600">{activeChain.examTip}</p>
              )}
              <div className={`mt-3 rounded-xl border px-3 py-2 ${activeChain.barSoft}`}>
                <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-600">Dica de prova</p>
                <p className="mt-1 font-body text-sm font-medium text-slate-800">{activeChain.examTip}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {(trap || answer) && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {trap ? (
              <div className="rounded-xl border border-rose-200/80 bg-rose-50/80 p-3 md:p-4">
                <p className="font-mono text-[9px] font-bold uppercase text-rose-700">Pegadinha</p>
                <p className="mt-1 font-body text-sm font-bold text-rose-950">{trap.title}</p>
                <p className="mt-1 font-body text-xs text-rose-800">{trap.description}</p>
              </div>
            ) : null}
            {answer ? (
              <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/80 p-3 md:p-4">
                <p className="font-mono text-[9px] font-bold uppercase text-emerald-700">Gabarito</p>
                <p className="mt-1 font-body text-sm font-bold text-emerald-950">{answer.title}</p>
                <p className="mt-1 font-body text-xs text-emerald-800">{answer.description}</p>
              </div>
            ) : null}
          </div>
        )}

        {footerRule ? (
          <p
            className={`rounded-xl border px-4 py-3 text-center font-body text-sm italic ${theme.borderColor} bg-white/80 ${theme.textSecondary}`}
          >
            {footerRule}
          </p>
        ) : null}
      </div>
    </div>
  );
}
