'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import type { DangerZoneItem } from './DangerZone';
import { BoardChrome, SoftRealIcon } from '../primitives';
import { cn } from '@/lib/utils';

interface DangerZoneAdolescentGenericVersusBlocksProps {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
}

const ICON_NAMES = ['Ban', 'Lock', 'MessageCircleWarning', 'ShieldAlert'] as const;

/**
 * Slide 4 genérico — blocos estilo “COFEN × COREN”:
 * aba laranja + ícone → seta → texto. Estático (sem clique).
 */
export function DangerZoneAdolescentGenericVersusBlocks({
  content,
  items,
  theme,
  footerRule,
}: DangerZoneAdolescentGenericVersusBlocksProps) {
  const reduceMotion = useReducedMotion();

  const paired = useMemo(
    () =>
      items.map((item, index) => ({
        key: `${item.label}-${index}`,
        label: (item.label || item.title || `Pegadinha ${index + 1}`).trim(),
        detail: (item.detail || item.description || '').trim(),
        correct: typeof item.correct === 'string' ? item.correct.trim() : '',
        iconName: ICON_NAMES[index % ICON_NAMES.length]!,
      })),
    [items],
  );

  if (items.length === 0) return null;

  return (
    <BoardChrome theme={theme} washOpacity={0.14} maxWidth="lg">
      <header className="text-center">
        <h2 className="font-display text-2xl font-black tracking-tight text-orange-500 md:text-3xl">
          PEGADINHA <span className="text-orange-600">×</span> CONDUTA
        </h2>
        <p className="mt-1 font-body text-sm font-semibold text-slate-600">
          {content || 'Armadilhas do item de adolescente'}
        </p>
      </header>

      <section className="overflow-hidden rounded-2xl border border-orange-200 bg-[#FFF8F1] shadow-sm">
        <div className="flex flex-wrap items-center gap-2 bg-orange-500 px-3 py-2">
          <span className="rounded-md bg-white px-2 py-0.5 font-display text-xs font-black uppercase text-orange-600">
            Banca
          </span>
          <span className="font-display text-xs font-black uppercase tracking-wide text-white">
            O que costuma induzir erro
          </span>
        </div>

        <ul className="flex flex-col gap-3 px-3 py-3">
          {paired.map((row, index) => (
            <motion.li
              key={row.key}
              initial={reduceMotion ? false : { opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: reduceMotion ? 0 : index * 0.04 }}
              className="rounded-xl bg-white/80 px-2 py-2 ring-1 ring-orange-100"
            >
              <p className="mb-1.5 font-display text-xs font-black uppercase tracking-wide text-orange-700">
                {row.label}
              </p>
              <div className="flex items-start gap-2">
                <SoftRealIcon name={row.iconName} tone="orange" size="md" />
                <ArrowRight className="mt-3 h-4 w-4 shrink-0 text-orange-400" aria-hidden />
                <div className="min-w-0 flex-1">
                  {row.detail ? (
                    <p className="font-body text-sm font-medium leading-snug text-slate-700">
                      <span className="font-black text-rose-700">Pegadinha: </span>
                      {row.detail}
                    </p>
                  ) : null}
                  {row.correct ? (
                    <p className="mt-1 flex items-start gap-1.5 font-body text-sm font-semibold leading-snug text-emerald-800">
                      <SoftRealIcon name="CheckCircle2" tone="emerald" size="sm" className="mt-0.5" />
                      <span>
                        <span className="font-black">Conduta: </span>
                        {row.correct}
                      </span>
                    </p>
                  ) : null}
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      </section>

      {footerRule ? (
        <div
          className={cn(
            'rounded-2xl border border-orange-200 bg-orange-50 px-3 py-2.5 text-center',
          )}
        >
          <p className="font-body text-xs font-bold leading-snug text-orange-950 md:text-sm">
            {footerRule}
          </p>
        </div>
      ) : null}
    </BoardChrome>
  );
}
