'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';
import { BoardChrome } from '../primitives';
import { cn } from '@/lib/utils';

export interface MentalConcept {
  icon: string;
  title: string;
  description: string;
}

interface ConceptMapAdolescentMentalRouteListProps {
  concepts: MentalConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

const ROW_TONES = [
  {
    accent: 'text-emerald-700',
    chip: 'bg-emerald-600',
    bar: 'bg-emerald-500',
    panel: 'bg-emerald-50',
    ring: 'ring-emerald-200',
  },
  {
    accent: 'text-sky-700',
    chip: 'bg-sky-600',
    bar: 'bg-sky-500',
    panel: 'bg-sky-50',
    ring: 'ring-sky-200',
  },
  {
    accent: 'text-amber-800',
    chip: 'bg-amber-500',
    bar: 'bg-amber-500',
    panel: 'bg-amber-50',
    ring: 'ring-amber-200',
  },
  {
    accent: 'text-rose-800',
    chip: 'bg-rose-600',
    bar: 'bg-rose-500',
    panel: 'bg-rose-50',
    ring: 'ring-rose-300',
  },
  {
    accent: 'text-teal-800',
    chip: 'bg-teal-600',
    bar: 'bg-teal-500',
    panel: 'bg-teal-50',
    ring: 'ring-teal-200',
  },
] as const;

function isPegadinha(title: string): boolean {
  return /^(pegadinha|armadilha)\b/i.test(title.trim());
}

/**
 * Slide 1 mental — lista “Vias de Administração” reforçada:
 * header tipográfico + card branco (ícone | nº+título | detalhe).
 */
export function ConceptMapAdolescentMentalRouteList({
  concepts,
  theme,
  footerRule,
}: ConceptMapAdolescentMentalRouteListProps) {
  const reduceMotion = useReducedMotion();

  const rows = useMemo(() => {
    const mapped = concepts.map((c, index) => {
      const trap = isPegadinha(c.title);
      return {
        key: `${c.title}-${index}`,
        title: c.title,
        detail: c.description,
        icon: resolveLucideIcon(c.icon) ?? resolveLucideIcon('HeartPulse'),
        tone: trap ? ROW_TONES[3]! : ROW_TONES[index % 3]!,
        n: index + 1,
        trap,
      };
    });
    const traps = mapped.filter((r) => r.trap);
    const rest = mapped.filter((r) => !r.trap);
    return [...rest, ...traps.slice(0, 1)];
  }, [concepts]);

  if (concepts.length === 0) return null;

  return (
    <BoardChrome theme={theme} washOpacity={0.22} maxWidth="lg">
      {/* Header estilo Vias */}
      <div className="text-center">
        <p className="font-display text-sm font-bold tracking-wide text-slate-700">
          Quadro clínico do
        </p>
        <h2 className="mt-0.5 font-display text-2xl font-black tracking-tight text-slate-900 md:text-[1.7rem]">
          Adolescente
        </h2>
        <div className="mt-2 flex justify-center">
          <span className="rounded-2xl bg-teal-600 px-4 py-1.5 font-display text-sm font-black uppercase tracking-wide text-white shadow-md">
            Transtornos alimentares
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {rows.map((row, index) => {
          const Icon = row.icon;
          return (
            <motion.article
              key={row.key}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduceMotion ? 0 : index * 0.04 }}
              className={cn(
                'grid grid-cols-[3.5rem_1fr] items-stretch gap-0 overflow-hidden rounded-2xl border-2 border-slate-200/90 bg-white shadow-lg shadow-slate-900/8 sm:grid-cols-[3.75rem_minmax(7.5rem,9.5rem)_1fr]',
                row.trap && 'ring-2 ring-rose-300/70',
              )}
            >
              {/* Ícone — círculo branco como no print Vias */}
              <div
                className={cn(
                  'flex items-center justify-center border-r border-slate-100',
                  row.tone.panel,
                )}
              >
                <span
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md ring-2',
                    row.tone.ring,
                  )}
                >
                  {Icon ? <Icon className={cn('h-6 w-6', row.tone.accent)} aria-hidden /> : null}
                </span>
              </div>

              {/* Número + título */}
              <div
                className={cn(
                  'flex items-center gap-2 px-2.5 py-3 sm:flex-col sm:items-start sm:justify-center sm:gap-1.5 sm:border-r sm:border-slate-100',
                  row.tone.panel,
                )}
              >
                <span
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-display text-xs font-black text-white shadow-sm',
                    row.tone.chip,
                  )}
                >
                  {row.n}
                </span>
                <p
                  className={cn(
                    'min-w-0 font-display text-[13px] font-black leading-tight md:text-sm',
                    row.tone.accent,
                  )}
                >
                  {row.title}
                </p>
              </div>

              {/* Detalhe */}
              <div className="col-span-2 flex items-start gap-2.5 px-3 py-3 sm:col-span-1 sm:items-center">
                <span
                  className={cn('mt-1 hidden h-10 w-1 shrink-0 rounded-full sm:mt-0 sm:block', row.tone.bar)}
                  aria-hidden
                />
                <div className="min-w-0">
                  {row.trap ? (
                    <p className="mb-1 font-mono text-[9px] font-bold uppercase tracking-widest text-rose-700">
                      Banca testa isto
                    </p>
                  ) : null}
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
        <div className="flex items-start gap-2 rounded-xl border border-teal-200 bg-teal-50/90 px-3 py-2.5">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white">
            <AlertCircle className="h-3.5 w-3.5" aria-hidden />
          </span>
          <p className="font-body text-xs font-semibold leading-snug text-teal-950 md:text-sm">
            {footerRule}
          </p>
        </div>
      ) : null}
    </BoardChrome>
  );
}
