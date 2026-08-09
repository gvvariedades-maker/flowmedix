'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import type { DangerZoneItem } from './DangerZone';
import { BoardChrome } from '../primitives';
import { cn } from '@/lib/utils';

interface DangerZoneAdolescentZThresholdTrapProps {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  /** Contrato do schema; molde é estático (sem toque). */
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
}

type CardTone = {
  header: string;
  quote: string;
  exampleBg: string;
  exampleText: string;
};

const TONES: CardTone[] = [
  {
    header: 'bg-rose-600',
    quote: 'text-slate-900',
    exampleBg: 'bg-rose-100',
    exampleText: 'text-rose-800',
  },
  {
    header: 'bg-sky-600',
    quote: 'text-slate-900',
    exampleBg: 'bg-sky-100',
    exampleText: 'text-sky-800',
  },
  {
    header: 'bg-violet-600',
    quote: 'text-slate-900',
    exampleBg: 'bg-violet-100',
    exampleText: 'text-violet-800',
  },
  {
    header: 'bg-orange-500',
    quote: 'text-slate-900',
    exampleBg: 'bg-orange-100',
    exampleText: 'text-orange-800',
  },
];

const TRANSFER_TONE: CardTone = {
  header: 'bg-fuchsia-600',
  quote: 'text-slate-900',
  exampleBg: 'bg-fuchsia-100',
  exampleText: 'text-fuchsia-800',
};

function isTransferItem(label: string): boolean {
  return /transfer|similar/i.test(label);
}

/** Núcleo curto para aspas — gesto “definição” do print. */
function quoteCore(detail: string): string {
  const t = detail.replace(/\s+/g, ' ').trim();
  // Remove prefixo de letra se houver (“B rotula…”)
  const cleaned = t.replace(/^[A-E]\s+/i, '').replace(/^[A-E]\s+rotula\s+/i, '');
  if (cleaned.length <= 42) return cleaned.toUpperCase();
  return `${cleaned.slice(0, 41).trimEnd().toUpperCase()}…`;
}

function exampleCore(correct: string): string {
  const t = correct.replace(/\s+/g, ' ').trim();
  // Prefere a 1ª cláusula decisória
  const first = t.split(/[.—;]/)[0]?.trim() ?? t;
  if (first.length <= 72) return first;
  return `${first.slice(0, 71).trimEnd()}…`;
}

function TrapCard({
  label,
  detail,
  correct,
  tone,
  wide,
  delay,
  reduceMotion,
}: {
  label: string;
  detail: string;
  correct: string;
  tone: CardTone;
  wide?: boolean;
  delay: number;
  reduceMotion: boolean | null;
}) {
  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduceMotion ? 0 : delay }}
      className={cn(
        'flex flex-col overflow-hidden rounded-2xl bg-white shadow-lg shadow-slate-900/10',
        wide && 'sm:col-span-2',
      )}
    >
      <div className={cn('px-3 py-2.5 text-center', tone.header)}>
        <p className="font-display text-xs font-black uppercase tracking-wide text-white md:text-sm">
          {label}
        </p>
      </div>
      <div className="flex flex-1 flex-col gap-3 px-3 py-3">
        <p
          className={cn(
            'text-center font-display text-sm font-black uppercase leading-snug tracking-wide md:text-[15px]',
            tone.quote,
          )}
        >
          “{quoteCore(detail)}”
        </p>
        {correct ? (
          <div className={cn('rounded-xl px-3 py-2.5 text-center', tone.exampleBg)}>
            <p
              className={cn(
                'font-body text-xs font-bold uppercase leading-snug tracking-wide md:text-[13px]',
                tone.exampleText,
              )}
            >
              {exampleCore(correct)}
            </p>
          </div>
        ) : null}
      </div>
    </motion.article>
  );
}

/**
 * Pegadinhas Z — cards tipo glossário (header cor + “definição” + caixa correta).
 * Estático: trap e correção visíveis sem toque.
 */
export function DangerZoneAdolescentZThresholdTrap({
  content,
  items,
  theme,
  footerRule,
}: DangerZoneAdolescentZThresholdTrapProps) {
  const reduceMotion = useReducedMotion();

  const { traps, transfers } = useMemo(() => {
    const rows = items.map((item, index) => {
      const label = (item.label || item.title || `Pegadinha ${index + 1}`).trim();
      return {
        label,
        detail: (item.detail || item.description || '').trim(),
        correct: typeof item.correct === 'string' ? item.correct.trim() : '',
        transfer: isTransferItem(label),
      };
    });
    return {
      traps: rows.filter((r) => !r.transfer),
      transfers: rows.filter((r) => r.transfer),
    };
  }, [items]);

  if (items.length === 0) return null;

  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.22}
      maxWidth="lg"
      footerLabel="Fixação"
      footerRule={footerRule}
    >
      <div className="rounded-2xl border border-slate-200/90 bg-white px-4 py-3 text-center shadow-md shadow-slate-900/5">
        <p className="font-display text-sm font-black uppercase tracking-wide text-rose-800 md:text-base">
          {content || 'Pegadinhas — escore Z'}
        </p>
        <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
          Trap em aspas · faixa certa na caixa colorida
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {traps.map((row, index) => (
          <TrapCard
            key={`trap-${index}`}
            label={row.label}
            detail={row.detail}
            correct={row.correct}
            tone={TONES[index % TONES.length]!}
            delay={index * 0.04}
            reduceMotion={reduceMotion}
          />
        ))}
      </div>

      {transfers.map((row, index) => (
        <TrapCard
          key={`transfer-${index}`}
          label={row.label}
          detail={row.detail}
          correct={row.correct}
          tone={TRANSFER_TONE}
          wide
          delay={0.16 + index * 0.04}
          reduceMotion={reduceMotion}
        />
      ))}
    </BoardChrome>
  );
}
