'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';
import {
  inferMentalCrisisStep,
  mentalCrisisStepLabel,
  MENTAL_CRISIS_LADDER,
  type MentalCrisisStep,
} from '@/lib/slides/saudeMentalSlideUtils';

interface GoldenRuleMentalCrisisLadderBoardProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

const STEP_COLORS: Record<MentalCrisisStep, string> = {
  acolhimento: 'border-l-emerald-500 bg-emerald-50/40',
  vinculo: 'border-l-teal-500 bg-teal-50/40',
  equipe: 'border-l-sky-500 bg-sky-50/40',
  medicacao: 'border-l-violet-500 bg-violet-50/40',
  contencao: 'border-l-rose-500 bg-rose-50/40',
  internacao: 'border-l-amber-500 bg-amber-50/40',
  geral: 'border-l-slate-400 bg-white/95',
};

export function GoldenRuleMentalCrisisLadderBoard({
  content,
  rows,
  theme,
  footerRule,
}: GoldenRuleMentalCrisisLadderBoardProps) {
  const reduceMotion = useReducedMotion();
  const [selectedStep, setSelectedStep] = useState<MentalCrisisStep | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const activeSteps = useMemo(() => {
    const steps = new Set<MentalCrisisStep>();
    rows.forEach((row) => {
      const step = inferMentalCrisisStep(row.label, row.value);
      if (step !== 'geral') steps.add(step);
    });
    return steps;
  }, [rows]);

  const toggleExpanded = useCallback((index: number) => {
    setExpandedIndex((current) => (current === index ? null : index));
  }, []);

  if (rows.length === 0) return null;

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 flex flex-col gap-3">
        {content ? (
          <p className="text-center font-display text-base font-bold text-violet-950">{content}</p>
        ) : null}

        <div className="flex items-center justify-between gap-0.5 rounded-xl border border-violet-200/80 bg-violet-50/50 px-2 py-2">
          {MENTAL_CRISIS_LADDER.map((step) => {
            const active = activeSteps.has(step);
            const selected = selectedStep === step;
            return (
              <button
                key={step}
                type="button"
                onClick={() => setSelectedStep(selected ? null : step)}
                className={`flex min-w-0 flex-1 flex-col items-center rounded-lg px-0.5 py-1 transition-all ${
                  selected
                    ? 'bg-violet-500 text-white ring-2 ring-violet-300/60'
                    : active
                      ? 'bg-white/90 text-violet-900 ring-1 ring-violet-300/50'
                      : 'bg-white/40 text-slate-400 opacity-60'
                }`}
              >
                <span className="text-center font-mono text-[8px] font-black leading-tight sm:text-[9px]">
                  {mentalCrisisStepLabel(step)}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-2">
          {rows.map((row, index) => {
            const step = inferMentalCrisisStep(row.label, row.value);
            const expanded = expandedIndex === index;
            const dimmed = selectedStep !== null && step !== 'geral' && step !== selectedStep;
            const hot = /acolh|escuta|n[aã]o coercitiv|conten[cç][aã]o.*[uú]ltim/i.test(`${row.label} ${row.value}`);

            return (
              <motion.button
                key={index}
                type="button"
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: dimmed ? 0.45 : 1, y: 0 }}
                transition={{ delay: reduceMotion ? 0 : index * 0.05 }}
                onClick={() => toggleExpanded(index)}
                aria-expanded={expanded}
                className={`w-full overflow-hidden rounded-[1.25rem] border border-l-[4px] text-left shadow-sm ${
                  STEP_COLORS[step]
                } ${hot ? 'ring-2 ring-violet-300/30' : ''}`}
              >
                <div className="flex items-start justify-between gap-2 p-4">
                  <div className="min-w-0 flex-1">
                    <span className="mb-1 inline-block rounded-full bg-violet-100 px-2 py-0.5 font-mono text-[9px] font-bold text-violet-800">
                      {mentalCrisisStepLabel(step)}
                    </span>
                    <p className="font-display text-sm font-bold text-slate-900">{row.label}</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-700">{row.value}</p>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
                  />
                </div>
              </motion.button>
            );
          })}
        </div>

        {footerRule ? (
          <p className="text-center text-xs font-medium text-violet-800/80">{footerRule}</p>
        ) : null}
      </div>
    </div>
  );
}
