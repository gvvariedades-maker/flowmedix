'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';
import { BoardChrome } from '../primitives';
import { cn } from '@/lib/utils';

export interface DevConcept {
  icon: string;
  title: string;
  description: string;
}

interface ConceptMapAdolescentDevPairRailProps {
  concepts: DevConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

const ROW_TONES = [
  { dark: 'bg-[#6AA84F]', soft: 'bg-emerald-50', icon: 'text-[#6AA84F]', ring: 'ring-emerald-200' },
  { dark: 'bg-[#3D85C6]', soft: 'bg-sky-50', icon: 'text-[#3D85C6]', ring: 'ring-sky-200' },
  { dark: 'bg-[#674EA7]', soft: 'bg-violet-50', icon: 'text-[#674EA7]', ring: 'ring-violet-200' },
  { dark: 'bg-[#E69138]', soft: 'bg-amber-50', icon: 'text-[#E69138]', ring: 'ring-amber-200' },
] as const;

/**
 * Slide 1 desenvolvimento — pares estilo “Campo de atuação SUS”:
 * ícone + caixa saturada (label) ↔ caixa pastel (detail). Estático.
 */
export function ConceptMapAdolescentDevPairRail({
  concepts,
  theme,
  footerRule,
}: ConceptMapAdolescentDevPairRailProps) {
  const reduceMotion = useReducedMotion();

  const rows = useMemo(
    () =>
      concepts.slice(0, 4).map((c, index) => ({
        key: `${c.title}-${index}`,
        title: c.title,
        detail: c.description,
        icon: resolveLucideIcon(c.icon) ?? resolveLucideIcon('Activity'),
        tone: ROW_TONES[index % ROW_TONES.length]!,
      })),
    [concepts],
  );

  if (concepts.length === 0) return null;

  return (
    <BoardChrome theme={theme} washOpacity={0.14} maxWidth="lg">
      <header className="text-center">
        <h2 className="font-display text-lg font-black uppercase tracking-tight text-slate-900 md:text-xl">
          Marcos da <span className="text-[#3D85C6]">puberdade</span>
        </h2>
        <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Campo de avaliação clínica
        </p>
      </header>

      <div className="flex flex-col gap-4">
        {rows.map((row, index) => {
          const Icon = row.icon;
          return (
            <motion.article
              key={row.key}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduceMotion ? 0 : index * 0.04 }}
              className="flex flex-col items-center gap-2"
            >
              <span
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-md ring-2',
                  row.tone.ring,
                )}
              >
                {Icon ? <Icon className={cn('h-6 w-6', row.tone.icon)} aria-hidden /> : null}
              </span>

              <div className="grid w-full grid-cols-1 items-center gap-0 sm:grid-cols-[minmax(9rem,11rem)_1.25rem_1fr]">
                <div
                  className={cn(
                    'rounded-2xl px-3 py-3 text-center shadow-sm',
                    row.tone.dark,
                  )}
                >
                  <p className="font-display text-sm font-black leading-snug text-white">
                    {row.title}
                  </p>
                </div>
                <div className="hidden items-center justify-center sm:flex" aria-hidden>
                  <span className="h-px w-full bg-slate-800" />
                </div>
                <div className={cn('rounded-2xl px-3 py-3 shadow-sm ring-1 ring-black/5', row.tone.soft)}>
                  <p className="font-body text-sm font-semibold leading-snug text-slate-900">
                    {row.detail}
                  </p>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>

      {footerRule ? (
        <div className="rounded-2xl border border-slate-200 bg-white/90 px-3 py-2.5 text-center shadow-sm">
          <p className="font-body text-xs font-semibold leading-snug text-slate-800 md:text-sm">
            {footerRule}
          </p>
        </div>
      ) : null}
    </BoardChrome>
  );
}
