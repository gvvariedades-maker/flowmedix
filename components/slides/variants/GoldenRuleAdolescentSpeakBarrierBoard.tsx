'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, MessageCircleWarning, Shield } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';
import {
  inferSpeakBarrierSide,
  type SpeakBarrierSide,
} from '@/lib/slides/adolescentSlideUtils';

interface GoldenRuleAdolescentSpeakBarrierBoardProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

function sideMeta(side: SpeakBarrierSide): {
  Icon: typeof Check;
  panel: string;
  label: string;
} {
  switch (side) {
    case 'barrier':
      return {
        Icon: MessageCircleWarning,
        panel: 'border-rose-300 bg-rose-50/95',
        label: 'Barreira',
      };
    case 'rights':
      return {
        Icon: Shield,
        panel: 'border-indigo-300 bg-indigo-50/95',
        label: 'Direitos',
      };
    case 'ok':
      return {
        Icon: Check,
        panel: 'border-emerald-300 bg-emerald-50/95',
        label: 'Conduta',
      };
    default:
      return {
        Icon: Check,
        panel: 'border-slate-200 bg-white',
        label: 'Regra',
      };
  }
}

/** Contraste “como falar × como NÃO falar” — scan em uma tela. */
export function GoldenRuleAdolescentSpeakBarrierBoard({
  content,
  rows,
  theme,
  footerRule,
}: GoldenRuleAdolescentSpeakBarrierBoardProps) {
  const reduceMotion = useReducedMotion();

  const enriched = useMemo(
    () =>
      rows.map((row) => ({
        row,
        side: inferSpeakBarrierSide(row.label ?? '', row.value ?? ''),
      })),
    [rows],
  );

  const barrier = enriched.filter((e) => e.side === 'barrier');
  const okish = enriched.filter((e) => e.side !== 'barrier');

  if (rows.length === 0) return null;

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-5">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-30`} />

      <div className="relative z-10 mx-auto flex w-full max-w-xl flex-col gap-3">
        {content ? (
          <h2 className="text-center font-display text-base font-black uppercase tracking-wide text-slate-900 md:text-lg">
            {content}
          </h2>
        ) : null}

        <p className="text-center font-mono text-[10px] font-bold uppercase tracking-widest text-sky-700/90">
          Informação completa ≠ jargão
        </p>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-emerald-800">
              Como falar / o que informar
            </p>
            {okish.map(({ row, side }, i) => {
              const meta = sideMeta(side);
              const Icon = meta.Icon;
              return (
                <motion.div
                  key={`ok-${i}`}
                  initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-xl border-2 p-3 ${meta.panel}`}
                >
                  <div className="mb-1 flex items-center gap-1.5">
                    <Icon className="h-4 w-4 shrink-0 text-emerald-700" aria-hidden />
                    <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-slate-600">
                      {row.label}
                    </span>
                  </div>
                  <p className="font-body text-sm font-semibold leading-snug text-slate-900">
                    {row.value}
                  </p>
                  {row.exam_hint ? (
                    <p className="mt-2 rounded-lg bg-white/60 px-2 py-1.5 font-body text-xs text-slate-600">
                      {row.exam_hint}
                    </p>
                  ) : null}
                </motion.div>
              );
            })}
          </div>

          <div className="flex flex-col gap-2">
            <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-rose-800">
              Como NÃO falar
            </p>
            {(barrier.length > 0 ? barrier : enriched.filter((e) => e.side === 'barrier')).map(
              ({ row }, i) => (
                <motion.div
                  key={`bad-${i}`}
                  initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border-2 border-rose-400 bg-rose-50/95 p-3 ring-1 ring-rose-200"
                >
                  <div className="mb-1 flex items-center gap-1.5">
                    <MessageCircleWarning className="h-4 w-4 shrink-0 text-rose-700" aria-hidden />
                    <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-rose-800">
                      {row.label}
                    </span>
                  </div>
                  <p className="font-body text-sm font-bold leading-snug text-rose-950">
                    {row.value}
                  </p>
                  {row.exam_hint ? (
                    <p className="mt-2 rounded-lg bg-white/70 px-2 py-1.5 font-body text-xs text-rose-900/80">
                      {row.exam_hint}
                    </p>
                  ) : null}
                </motion.div>
              ),
            )}
            {barrier.length === 0 ? (
              <p className="rounded-xl border border-dashed border-rose-200 bg-rose-50/50 px-3 py-4 text-center font-body text-xs text-rose-800/80">
                Marque a row com ênfase alert / “não falar” no JSON para destacar a barreira.
              </p>
            ) : null}
          </div>
        </div>

        {footerRule ? (
          <p className="rounded-xl border border-sky-200/70 bg-sky-50/80 px-3 py-2.5 text-center font-body text-sm italic text-sky-900/85">
            {footerRule}
          </p>
        ) : null}
      </div>
    </div>
  );
}
