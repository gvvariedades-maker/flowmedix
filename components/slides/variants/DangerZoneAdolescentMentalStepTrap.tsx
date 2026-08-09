'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Lightbulb, Shuffle } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import type { DangerZoneItem } from './DangerZone';
import { BoardChrome } from '../primitives';
import { cn } from '@/lib/utils';

interface DangerZoneAdolescentMentalStepTrapProps {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
}

const STEP_TONES = [
  { left: 'bg-sky-700', mid: 'bg-sky-50', accent: 'text-sky-800' },
  { left: 'bg-emerald-700', mid: 'bg-emerald-50', accent: 'text-emerald-800' },
  { left: 'bg-orange-600', mid: 'bg-orange-50', accent: 'text-orange-800' },
  { left: 'bg-violet-700', mid: 'bg-violet-50', accent: 'text-violet-800' },
  { left: 'bg-teal-700', mid: 'bg-teal-50', accent: 'text-teal-800' },
] as const;

function isTransferItem(label: string): boolean {
  return /transfer|similar/i.test(label);
}

function letterFromLabel(label: string): string | undefined {
  return label.match(/\b([A-E])\b/i)?.[1]?.toUpperCase();
}

function shortLabel(label: string): string {
  return label
    .replace(/^letra\s+/i, '')
    .replace(/^[A-E]\s*[—–\-:.]?\s*/i, '')
    .trim();
}

/**
 * Slide 4 mental — linhas tipo “Regra de Três”:
 * bloco colorido à esquerda + conteúdo + ícone (estático, sem clique).
 */
export function DangerZoneAdolescentMentalStepTrap({
  content,
  items,
  theme,
  footerRule,
}: DangerZoneAdolescentMentalStepTrapProps) {
  const reduceMotion = useReducedMotion();

  const rows = useMemo(
    () =>
      items.map((item, index) => {
        const label = (item.label || item.title || `Pegadinha ${index + 1}`).trim();
        return {
          label,
          detail: (item.detail || item.description || '').trim(),
          correct: typeof item.correct === 'string' ? item.correct.trim() : '',
          transfer: isTransferItem(label),
          letter: letterFromLabel(label),
          short: shortLabel(label),
          tone: STEP_TONES[index % STEP_TONES.length]!,
        };
      }),
    [items],
  );

  if (items.length === 0) return null;

  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.24}
      maxWidth="lg"
      footerLabel="Dica importante"
      footerRule={footerRule}
    >
      <div className="text-center">
        <h2 className="font-display text-xl font-black tracking-tight text-slate-900 md:text-2xl">
          Pegadinhas <span className="text-violet-700">descomplicadas</span>
        </h2>
        <div className="mx-auto mt-2 inline-flex max-w-md items-center gap-2 rounded-xl border-2 border-sky-400 bg-sky-50 px-3 py-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-sky-700" aria-hidden />
          <p className="text-left font-mono text-[10px] font-bold uppercase leading-snug tracking-wide text-sky-900">
            {content || 'Anorexia × bulimia — o que a banca troca'}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {rows.map((row, index) => (
          <motion.div
            key={`${row.label}-${index}`}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduceMotion ? 0 : index * 0.035 }}
            className="grid grid-cols-[5.5rem_1fr_2.5rem] overflow-hidden rounded-2xl border border-slate-200 shadow-md sm:grid-cols-[7rem_1fr_2.75rem]"
          >
            <div
              className={cn(
                'flex flex-col items-center justify-center px-1.5 py-3 text-center text-white',
                row.tone.left,
              )}
            >
              <p className="font-display text-lg font-black tabular-nums">
                {row.letter ?? (row.transfer ? '↔' : String(index + 1))}
              </p>
              <p className="mt-1 font-mono text-[9px] font-bold uppercase leading-tight tracking-wide">
                {row.short || (row.transfer ? 'Transfer' : 'Trap')}
              </p>
            </div>

            <div className={cn('flex flex-col justify-center gap-1.5 px-3 py-2.5', row.tone.mid)}>
              <div>
                <p className={cn('font-mono text-[9px] font-bold uppercase tracking-widest', row.tone.accent)}>
                  Pegadinha
                </p>
                <p className="font-body text-xs font-semibold leading-snug text-slate-800">
                  {row.detail}
                </p>
              </div>
              <div className="rounded-xl bg-white/90 px-2.5 py-2 shadow-sm ring-1 ring-emerald-200">
                <p className="flex items-center gap-1 font-mono text-[9px] font-bold uppercase tracking-widest text-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                  Conduta certa
                </p>
                <p className="mt-0.5 font-body text-sm font-semibold leading-snug text-slate-900">
                  {row.correct}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center bg-white">
              {row.transfer ? (
                <Shuffle className="h-5 w-5 text-violet-600" aria-hidden />
              ) : (
                <Lightbulb className="h-5 w-5 text-amber-500" aria-hidden />
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </BoardChrome>
  );
}
