'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { ThemeColors } from '../core/themeGenerator';
import { BoardChrome, SoftRealIcon, type SoftRealIconTone } from '../primitives';
import { cn } from '@/lib/utils';

export interface GenericConcept {
  icon: string;
  title: string;
  description: string;
}

interface ConceptMapAdolescentGenericHubProps {
  concepts: GenericConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

const CARD_TONES: Array<{
  border: string;
  chip: string;
  soft: string;
  iconTone: SoftRealIconTone;
}> = [
  { border: 'border-emerald-500', chip: 'bg-emerald-600', soft: 'bg-emerald-50', iconTone: 'emerald' },
  { border: 'border-sky-500', chip: 'bg-sky-600', soft: 'bg-sky-50', iconTone: 'sky' },
  { border: 'border-emerald-500', chip: 'bg-emerald-600', soft: 'bg-emerald-50', iconTone: 'emerald' },
  { border: 'border-sky-500', chip: 'bg-sky-600', soft: 'bg-sky-50', iconTone: 'sky' },
  { border: 'border-teal-500', chip: 'bg-teal-600', soft: 'bg-teal-50', iconTone: 'teal' },
];

/**
 * Slide 1 genérico — hub estilo CF/88 (círculo central + satélites). Estático.
 */
export function ConceptMapAdolescentGenericHub({
  concepts,
  theme,
  footerRule,
}: ConceptMapAdolescentGenericHubProps) {
  const reduceMotion = useReducedMotion();

  const cards = useMemo(
    () =>
      concepts.slice(0, 5).map((c, index) => ({
        key: `${c.title}-${index}`,
        n: index + 1,
        title: c.title,
        detail: c.description,
        iconName: c.icon || 'Heart',
        tone: CARD_TONES[index % CARD_TONES.length]!,
      })),
    [concepts],
  );

  if (concepts.length === 0) return null;

  return (
    <BoardChrome theme={theme} washOpacity={0.14} maxWidth="lg">
      <header className="text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-xl bg-[#0B3A6E] px-3 py-1.5 text-white shadow-md">
          <SoftRealIcon name="HeartHandshake" tone="white" size="sm" bare />
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider">
            Saúde do adolescente
          </span>
        </div>
        <p className="mt-2 font-display text-xs font-black uppercase tracking-[0.2em] text-emerald-700">
          Núcleo do cuidado
        </p>
      </header>

      <div className="relative mx-auto flex max-w-md flex-col items-center">
        <motion.div
          initial={reduceMotion ? false : { scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-[1] flex h-36 w-36 flex-col items-center justify-center rounded-full bg-[#0B3A6E] text-center shadow-xl ring-4 ring-emerald-400/35 md:h-40 md:w-40"
        >
          <SoftRealIcon name="Cross" tone="teal" size="sm" className="mb-1 shadow-emerald-900/20" />
          <p className="px-3 font-display text-[11px] font-black uppercase leading-tight tracking-wide text-white md:text-xs">
            Escuta · sigilo · vínculo
          </p>
          <p className="mt-1 font-mono text-[9px] font-bold uppercase tracking-widest text-emerald-300">
            Base clínica
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {cards.map((card, index) => (
          <motion.article
            key={card.key}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduceMotion ? 0 : 0.05 + index * 0.04 }}
            className={cn(
              'relative rounded-2xl border-2 bg-white px-3 pb-3 pt-5 shadow-md',
              card.tone.border,
            )}
          >
            <span
              className={cn(
                'absolute -top-3 left-1/2 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full font-display text-xs font-black text-white shadow',
                card.tone.chip,
              )}
            >
              {card.n}
            </span>
            <div className="mb-2 flex flex-col items-center gap-1.5">
              <SoftRealIcon name={card.iconName} tone={card.tone.iconTone} size="md" />
              <p className="font-display text-xs font-black uppercase tracking-wide text-[#0B3A6E]">
                {card.title}
              </p>
            </div>
            <div className={cn('rounded-xl px-2.5 py-2', card.tone.soft)}>
              <p className="text-center font-body text-sm font-semibold leading-snug text-slate-900">
                {card.detail}
              </p>
            </div>
          </motion.article>
        ))}
      </div>

      {footerRule ? (
        <div className="rounded-2xl border border-[#0B3A6E]/15 bg-[#0B3A6E]/[0.04] px-3 py-2.5 text-center">
          <p className="font-body text-xs font-semibold leading-snug text-slate-800 md:text-sm">
            {footerRule}
          </p>
        </div>
      ) : null}
    </BoardChrome>
  );
}
