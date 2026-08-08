'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Shuffle, Users } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import type { DangerZoneItem } from './DangerZone';
import { BoardChrome } from '../primitives';
import { cn } from '@/lib/utils';

interface DangerZoneAdolescentViolenceCalendarProps {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  /** Contrato do schema; molde é estático (sem clique / reveal). */
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
}

type RowPalette = {
  left: string;
  right: string;
  chip: string;
};

/** Pastéis do calendário vacinal — linha a linha, tudo visível. */
const TRAP_PALETTES: RowPalette[] = [
  {
    left: 'bg-sky-100 text-sky-950',
    right: 'bg-sky-50 text-slate-900',
    chip: 'bg-sky-600',
  },
  {
    left: 'bg-emerald-100 text-emerald-950',
    right: 'bg-emerald-50 text-slate-900',
    chip: 'bg-emerald-600',
  },
  {
    left: 'bg-amber-100 text-amber-950',
    right: 'bg-amber-50 text-slate-900',
    chip: 'bg-amber-500',
  },
  {
    left: 'bg-orange-100 text-orange-950',
    right: 'bg-orange-50 text-slate-900',
    chip: 'bg-orange-500',
  },
];

const TRANSFER_PALETTE: RowPalette = {
  left: 'bg-violet-100 text-violet-950',
  right: 'bg-violet-50 text-slate-900',
  chip: 'bg-violet-600',
};

function isTransferItem(label: string): boolean {
  return /transfer|similar/i.test(label);
}

function letterFromLabel(label: string): string | undefined {
  const m = label.match(/\b([A-E])\b/i) || label.match(/^([A-E])\s*[—–\-:.]/i);
  return m?.[1]?.toUpperCase();
}

function shortLabel(label: string): string {
  return label
    .replace(/^letra\s+/i, '')
    .replace(/^[A-E]\s*[—–\-:.]?\s*/i, '')
    .trim();
}

function CalendarRow({
  label,
  detail,
  correct,
  palette,
  transfer,
  delay,
  reduceMotion,
}: {
  label: string;
  detail: string;
  correct: string;
  palette: RowPalette;
  transfer?: boolean;
  delay: number;
  reduceMotion: boolean | null;
}) {
  const letter = letterFromLabel(label);
  const leftTitle = shortLabel(label) || (transfer ? 'Transferência' : 'Pegadinha');

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduceMotion ? 0 : delay }}
      className="grid grid-cols-[7.25rem_1fr] gap-2 sm:grid-cols-[8.5rem_1fr] sm:gap-2.5"
    >
      {/* Card esquerdo — rótulo (idade no calendário vacinal) */}
      <div
        className={cn(
          'flex min-h-[4.5rem] flex-col items-center justify-center rounded-2xl px-2 py-2.5 text-center shadow-sm',
          palette.left,
        )}
      >
        <span
          className={cn(
            'mb-1.5 flex h-8 w-8 items-center justify-center rounded-full text-white shadow-sm',
            palette.chip,
          )}
        >
          {transfer ? (
            <Shuffle className="h-4 w-4" aria-hidden />
          ) : letter ? (
            <span className="font-display text-sm font-black">{letter}</span>
          ) : (
            <AlertTriangle className="h-4 w-4" aria-hidden />
          )}
        </span>
        <p className="font-display text-[11px] font-black uppercase leading-tight tracking-wide">
          {leftTitle}
        </p>
        <p className="mt-1 font-body text-[10px] font-semibold leading-snug opacity-80">
          {detail}
        </p>
      </div>

      {/* Card direito — conduta certa (vacinas no calendário) */}
      <div
        className={cn(
          'flex min-h-[4.5rem] items-start gap-2 rounded-2xl px-3 py-2.5 shadow-sm',
          palette.right,
        )}
      >
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-emerald-800">
            Conduta certa
          </p>
          <p className="mt-0.5 font-body text-sm font-semibold leading-snug">{correct}</p>
        </div>
      </div>
    </motion.div>
  );
}

function SectionHeader({
  title,
  subtitle,
  tone,
}: {
  title: string;
  subtitle: string;
  tone: 'trap' | 'transfer';
}) {
  return (
    <header
      className={cn(
        'flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-white shadow-md',
        tone === 'trap'
          ? 'bg-gradient-to-r from-sky-600 to-teal-600'
          : 'bg-gradient-to-r from-violet-600 to-fuchsia-600',
      )}
    >
      <span className="-ml-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/35">
        {tone === 'trap' ? (
          <Users className="h-4 w-4" aria-hidden />
        ) : (
          <Shuffle className="h-4 w-4" aria-hidden />
        )}
      </span>
      <div className="min-w-0">
        <p className="font-display text-sm font-black uppercase tracking-wide">{title}</p>
        <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-white/85">
          {subtitle}
        </p>
      </div>
    </header>
  );
}

/**
 * Pegadinhas violência — calendário vacinal estático (faixa de seção + dual-card pastel).
 * Trap e correção visíveis sem clique / arena.
 */
export function DangerZoneAdolescentViolenceCalendar({
  content,
  items,
  theme,
  footerRule,
}: DangerZoneAdolescentViolenceCalendarProps) {
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
      washOpacity={0.2}
      maxWidth="lg"
      footerLabel="Fixação"
      footerRule={footerRule}
    >
      <div className="text-center">
        <h2 className="font-display text-xl font-black tracking-tight md:text-2xl">
          <span className="text-slate-800">PEGADINHAS</span>{' '}
          <span className="text-teal-600">DA PROVA</span>
        </h2>
        <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
          {content || 'Violência sexual — rede de proteção'}
        </p>
      </div>

      {traps.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          <SectionHeader
            title="Distratores"
            subtitle="Pegadinha à esquerda · conduta certa à direita"
            tone="trap"
          />
          {traps.map((row, index) => (
            <CalendarRow
              key={`trap-${index}`}
              label={row.label}
              detail={row.detail}
              correct={row.correct}
              palette={TRAP_PALETTES[index % TRAP_PALETTES.length]!}
              delay={index * 0.035}
              reduceMotion={reduceMotion}
            />
          ))}
        </div>
      ) : null}

      {transfers.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          <SectionHeader
            title="Transferência"
            subtitle="Outra banca, mesma armadilha"
            tone="transfer"
          />
          {transfers.map((row, index) => (
            <CalendarRow
              key={`transfer-${index}`}
              label={row.label}
              detail={row.detail}
              correct={row.correct}
              palette={TRANSFER_PALETTE}
              transfer
              delay={0.12 + index * 0.035}
              reduceMotion={reduceMotion}
            />
          ))}
        </div>
      ) : null}
    </BoardChrome>
  );
}
