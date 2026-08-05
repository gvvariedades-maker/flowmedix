'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Ban, CheckCircle2, Pill } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';
import { BoardChrome, CategoryStrip, PolarityPanel } from '../primitives';
import { cn } from '@/lib/utils';

export interface PniExcetoConcept {
  icon: string;
  title: string;
  description: string;
}

function isCommandItem(title: string, description: string): boolean {
  return /comando|incorreta|exceto|afirmativa falsa|três opções|tres opcoes/i.test(
    `${title} ${description}`,
  );
}

function isMythItem(title: string, description: string): boolean {
  return /antibiótico|antibiotico|mito|não adia|nao adia|calendário|calendario/i.test(
    `${title} ${description}`,
  ) && !isCommandItem(title, description);
}

interface PniExcetoCommandConceptMapProps {
  concepts: PniExcetoConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

/**
 * Mapa INCORRETA/EXCETO PNI — Glance OS:
 * outdoor INCORRETA + herói comando + painel mito + cards de terreno (0 taps).
 */
export function PniExcetoCommandConceptMap({
  concepts,
  theme,
  footerRule,
}: PniExcetoCommandConceptMapProps) {
  const reduceMotion = useReducedMotion();

  const { command, myth, rest } = useMemo(() => {
    const cmd = concepts.find((c) => isCommandItem(c.title, c.description));
    const mythItem = concepts.find(
      (c) => c !== cmd && isMythItem(c.title, c.description),
    );
    const others = concepts.filter((c) => c !== cmd && c !== mythItem);
    return {
      command: cmd ?? concepts[0],
      myth: mythItem,
      rest: others,
    };
  }, [concepts]);

  if (concepts.length === 0) return null;

  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.4}
      eyebrow="MAPA — INCORRETA / EXCETO"
      footerRule={footerRule}
      footerLabel={footerRule ? 'FIXAÇÃO' : undefined}
      maxWidth="3xl"
      className="gap-3"
    >
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span
          className={cn(
            'rounded-2xl px-4 py-2 font-display text-2xl font-black tracking-tight text-rose-700',
            'bg-rose-100 ring-2 ring-rose-400/60 shadow-sm md:text-3xl',
          )}
        >
          INCORRETA
        </span>
        <CategoryStrip label="Ache a falsa · 3 verdadeiras" tone="exception" />
      </div>

      {command ? (
        <PolarityPanel tone="command" emphasized>
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
                theme.iconBg,
                theme.iconText,
              )}
            >
              <Ban className="h-6 w-6" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-rose-800">
                Comando da prova
              </p>
              <h3 className="mt-0.5 font-body text-lg font-bold text-slate-900 md:text-xl">
                {command.title}
              </h3>
              <p className="mt-1.5 font-body text-sm leading-snug text-slate-700 md:text-base">
                {command.description}
              </p>
            </div>
          </div>
        </PolarityPanel>
      ) : null}

      {myth ? (
        <PolarityPanel tone="transfer" emphasized>
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
              <Pill className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <CategoryStrip label="Terreno da pegadinha" tone="transfer" className="mb-1 self-start" />
              <p className="font-body text-base font-bold leading-snug text-slate-900">
                {myth.title}
              </p>
              <p className="mt-1 font-body text-sm leading-snug text-amber-950 md:text-[15px]">
                {myth.description}
              </p>
            </div>
          </div>
        </PolarityPanel>
      ) : null}

      {rest.length > 0 ? (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {rest.map((concept, index) => {
            const Icon = resolveLucideIcon(concept.icon);
            return (
              <motion.div
                key={`${concept.title}-${index}`}
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduceMotion ? 0 : index * 0.04 }}
                className="overflow-hidden rounded-2xl border border-l-[4px] border-l-emerald-500 bg-white/95 p-4 shadow-sm"
              >
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                    <Icon size={18} aria-hidden />
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-emerald-800">
                    <CheckCircle2 className="h-3 w-3" aria-hidden />
                    Manter
                  </span>
                </div>
                <p className="font-display text-sm font-bold text-slate-900">{concept.title}</p>
                <p className="mt-1.5 font-body text-sm leading-snug text-slate-700">
                  {concept.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      ) : null}
    </BoardChrome>
  );
}
