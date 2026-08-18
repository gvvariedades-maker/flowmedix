'use client';

import { useMemo, type ComponentType, type SVGProps } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Lightbulb,
  Target,
  XCircle,
} from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import {
  cleanViolenceStepBody,
  parseAdolescentViolenceStep,
  type AdolescentViolenceStepKind,
} from '@/lib/slides/adolescentViolenceSlideUtils';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { BoardChrome } from '../primitives';
import { cn } from '@/lib/utils';

interface LogicFlowAdolescentViolenceTimelineProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  /** Contrato do logic_flow; molde é estático (sem tap). */
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
}

type RowIcon = ComponentType<SVGProps<SVGSVGElement> & { className?: string }>;

type ParsedRow = {
  kind: AdolescentViolenceStepKind;
  letter?: string;
  raw: string;
  index: number;
  body: string;
};

const ROW_PALETTE = [
  { rail: 'bg-sky-500', text: 'text-sky-700', card: 'bg-sky-50 border-sky-200' },
  { rail: 'bg-violet-500', text: 'text-violet-700', card: 'bg-violet-50 border-violet-200' },
  { rail: 'bg-orange-500', text: 'text-orange-700', card: 'bg-orange-50 border-orange-200' },
  { rail: 'bg-rose-500', text: 'text-rose-700', card: 'bg-rose-50 border-rose-200' },
  { rail: 'bg-teal-500', text: 'text-teal-700', card: 'bg-teal-50 border-teal-200' },
] as const;

const KEEP_PALETTE = {
  rail: 'bg-emerald-600',
  text: 'text-emerald-800',
  card: 'bg-emerald-50 border-emerald-300',
} as const;

function iconForKind(kind: AdolescentViolenceStepKind): RowIcon {
  switch (kind) {
    case 'keep':
      return CheckCircle2;
    case 'eliminate':
      return XCircle;
    case 'mark':
      return Target;
    case 'transfer':
      return Lightbulb;
    case 'context':
      return ClipboardList;
    default:
      return AlertTriangle;
  }
}

function TimelineRow({
  letter,
  body,
  kind,
  colorIndex,
  isLast,
  delay,
  reduceMotion,
}: {
  letter?: string;
  body: string;
  kind: AdolescentViolenceStepKind;
  colorIndex: number;
  isLast: boolean;
  delay: number;
  reduceMotion: boolean | null;
}) {
  const keep = kind === 'keep' || kind === 'mark';
  const palette = keep ? KEEP_PALETTE : ROW_PALETTE[colorIndex % ROW_PALETTE.length];
  const Icon = iconForKind(kind);
  const marker = letter ?? (kind === 'mark' ? '✓' : '·');

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: reduceMotion ? 0 : delay }}
      className="grid grid-cols-[4.5rem_1fr] gap-2 md:grid-cols-[5.5rem_1fr] md:gap-3"
    >
      {/* Coluna ANO/LETRA + trilho */}
      <div className="relative flex flex-col items-center pt-1">
        {!isLast ? (
          <span
            className="absolute left-1/2 top-10 bottom-[-0.35rem] w-1 -translate-x-1/2 rounded-full bg-slate-200"
            aria-hidden
          />
        ) : null}
        <span
          className={cn(
            'relative z-[1] flex h-11 w-11 items-center justify-center rounded-full text-white shadow-md ring-4 ring-white',
            palette.rail,
          )}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <p className={cn('mt-1.5 font-display text-base font-black tabular-nums', palette.text)}>
          {marker}
        </p>
        <span className={cn('mt-0.5 h-1.5 w-1.5 rotate-45', palette.rail)} aria-hidden />
      </div>

      {/* Card fato — modelo calendário (massa) */}
      <div
        className={cn(
          'mb-3 rounded-2xl border-2 px-3.5 py-3 shadow-sm',
          palette.card,
        )}
      >
        <p className="font-body text-sm font-semibold leading-snug text-slate-900">{body}</p>
        <p
          className={cn(
            'mt-1.5 font-mono text-[9px] font-bold uppercase tracking-widest',
            palette.text,
          )}
        >
          {keep ? 'Mantém' : 'Elimina'}
        </p>
      </div>
    </motion.div>
  );
}

function TimelineSection({
  badge,
  yearsHint,
  subtitle,
  rows,
  reduceMotion,
  delayBase,
  accent,
}: {
  badge: string;
  yearsHint: string;
  subtitle: string;
  rows: ParsedRow[];
  reduceMotion: boolean | null;
  delayBase: number;
  accent: 'drop' | 'keep';
}) {
  if (rows.length === 0) return null;

  const header =
    accent === 'keep'
      ? 'bg-gradient-to-r from-emerald-600 to-teal-600'
      : 'bg-gradient-to-r from-rose-600 to-orange-500';

  return (
    <section className="overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-md shadow-slate-900/8">
      {/* Faixa de categoria — calendário vacinação */}
      <header className={cn('flex flex-wrap items-center gap-2 px-3 py-2.5 text-white', header)}>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/40">
          {accent === 'keep' ? (
            <CheckCircle2 className="h-4.5 w-4.5" aria-hidden />
          ) : (
            <XCircle className="h-4.5 w-4.5" aria-hidden />
          )}
        </span>
        <p className="font-display text-sm font-black uppercase tracking-wide md:text-base">
          {badge}
        </p>
        <span className="rounded-full bg-white/20 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider">
          {yearsHint}
        </span>
      </header>

      <div className="border-b border-slate-200 bg-slate-50 px-3 py-2">
        <div className="grid grid-cols-[4.5rem_1fr] gap-2 md:grid-cols-[5.5rem_1fr]">
          <p className="text-center font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500">
            Letra
          </p>
          <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="px-3 pb-2 pt-3">
        {rows.map((row, i) => (
          <TimelineRow
            key={`${row.kind}-${row.index}`}
            letter={row.letter}
            body={row.body}
            kind={row.kind}
            colorIndex={i}
            isLast={i === rows.length - 1}
            delay={delayBase + i * 0.04}
            reduceMotion={reduceMotion}
          />
        ))}
      </div>
    </section>
  );
}

/**
 * Violência / rede — raciocínio estático em linha do tempo (sem tap).
 * Visual: trilho + letras (timeline) + faixas de seção (calendário).
 */
export function LogicFlowAdolescentViolenceTimeline({
  steps,
  theme,
  footerRule,
}: LogicFlowAdolescentViolenceTimelineProps) {
  const reduceMotion = useReducedMotion();

  const { comando, keepRows, dropRows, transfer } = useMemo(() => {
    const normalized = normalizeLogicFlowSteps(steps);
    const parsed: ParsedRow[] = normalized.map((step, index) => {
      const p = parseAdolescentViolenceStep(step, index);
      return { ...p, body: cleanViolenceStepBody(p.raw) };
    });

    const comando = parsed.find((p) => p.kind === 'context')?.body;
    const transfer = parsed.find((p) => p.kind === 'transfer')?.body;
    const keepRows = parsed.filter((p) => p.kind === 'keep' || p.kind === 'mark');
    const dropRows = parsed.filter((p) => p.kind === 'eliminate');

    return { comando, keepRows, dropRows, transfer };
  }, [steps]);

  const resolvedFooter = footerRule ?? transfer;

  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.28}
      maxWidth="lg"
      footerLabel="Transferência de prova"
      footerRule={resolvedFooter}
    >
      <div className="text-center">
        <h2 className="font-display text-xl font-black tracking-tight md:text-2xl">
          <span className="text-rose-600">LINHA DO TEMPO</span>
          <span className="mx-1.5 text-slate-400">·</span>
          <span className="text-slate-900">ELIMINA × MANTÉM</span>
        </h2>
        <div className="mx-auto mt-2 flex h-2 max-w-[14rem] items-center justify-center">
          <span className="h-0.5 flex-1 rounded-full bg-sky-500" />
          <span className="mx-1 h-2 w-2 rotate-45 bg-sky-500" aria-hidden />
          <span className="h-0.5 flex-1 rounded-full bg-sky-500" />
        </div>
        <p className="mt-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
          Violência sexual · rede de proteção
        </p>
      </div>

      {comando ? (
        <div className="flex items-start gap-2.5 rounded-2xl border-2 border-sky-300 bg-white/95 px-3 py-3 shadow-sm">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-600 text-white">
            <ClipboardList className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-sky-700">
              Comando
            </p>
            <p className="font-body text-sm font-semibold leading-snug text-slate-900">{comando}</p>
          </div>
        </div>
      ) : null}

      <TimelineSection
        badge="1. Elimina"
        yearsHint="Distratores"
        subtitle="Fato — por que cai"
        rows={dropRows}
        reduceMotion={reduceMotion}
        delayBase={0.05}
        accent="drop"
      />

      <TimelineSection
        badge="2. Mantém"
        yearsHint="Gabarito"
        subtitle="Fato — por que fica"
        rows={keepRows}
        reduceMotion={reduceMotion}
        delayBase={0.14}
        accent="keep"
      />
    </BoardChrome>
  );
}
