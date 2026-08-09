'use client';

import { useMemo, type ComponentType, type SVGProps } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Lightbulb,
  Target,
  XCircle,
} from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import {
  parseAdolescentZStep,
  type AdolescentZStepKind,
} from '@/lib/slides/adolescentAntropometriaSlideUtils';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { BoardChrome } from '../primitives';
import { cn } from '@/lib/utils';

interface LogicFlowAdolescentZClassifyTapProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  /** Mantido no contrato; molde é estático (sem serializar passos). */
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
}

type RowIcon = ComponentType<SVGProps<SVGSVGElement> & { className?: string }>;

type ParsedRow = {
  kind: AdolescentZStepKind;
  letter?: string;
  raw: string;
  index: number;
  body: string;
};

function cleanStepBody(raw: string): string {
  return raw
    .replace(/^comando:\s*/i, '')
    .replace(/^em similares:\s*/i, '')
    .replace(/^([A-E]):\s*/i, '')
    .replace(/\s*[→\-–—]\s*(mantém|mantem|elimina)\.?\s*$/i, '')
    .replace(/\s*→\s*/g, ' · ')
    .trim();
}

function iconForKind(kind: AdolescentZStepKind): RowIcon {
  switch (kind) {
    case 'classify_ok':
      return CheckCircle2;
    case 'eliminate':
    case 'threshold':
      return XCircle;
    case 'mark':
      return Target;
    case 'fixacao':
      return Lightbulb;
    case 'context':
      return ClipboardList;
    default:
      return AlertTriangle;
  }
}

function NoteRow({
  letter,
  body,
  kind,
  delay,
  reduceMotion,
}: {
  letter?: string;
  body: string;
  kind: AdolescentZStepKind;
  delay: number;
  reduceMotion: boolean | null;
}) {
  const Icon = iconForKind(kind);
  const keep = kind === 'classify_ok' || kind === 'mark';

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: reduceMotion ? 0 : delay }}
      className="border-b border-dashed border-orange-300/80 py-2.5 last:border-b-0"
    >
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 shadow-sm',
            keep
              ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
              : 'border-orange-400 bg-orange-50 text-orange-700',
          )}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <ArrowRight className="h-4 w-4 shrink-0 text-orange-500" aria-hidden />
        {letter ? (
          <span
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-sm font-black',
              keep ? 'bg-emerald-600 text-white' : 'bg-orange-600 text-white',
            )}
          >
            {letter}
          </span>
        ) : null}
        <p className="min-w-0 flex-1 font-body text-sm font-semibold leading-snug text-slate-900">
          {body}
        </p>
      </div>
    </motion.div>
  );
}

function StudySection({
  badge,
  subtitle,
  rows,
  reduceMotion,
  delayBase,
}: {
  badge: string;
  subtitle: string;
  rows: ParsedRow[];
  reduceMotion: boolean | null;
  delayBase: number;
}) {
  if (rows.length === 0) return null;

  return (
    <section className="overflow-hidden rounded-2xl border-2 border-orange-400/90 bg-gradient-to-b from-orange-50/95 to-amber-50/80 shadow-md shadow-orange-900/10">
      <header className="flex flex-wrap items-stretch gap-2 border-b border-orange-200/90 bg-white/70 p-3">
        <div className="flex items-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 px-4 py-2 shadow-sm">
          <span className="font-display text-lg font-black tracking-wide text-white md:text-xl">
            {badge}
          </span>
        </div>
        <div className="flex min-w-0 flex-1 items-center rounded-xl border border-orange-200 bg-white px-3 py-2">
          <p className="font-mono text-[10px] font-bold uppercase leading-tight tracking-wider text-slate-800 md:text-[11px]">
            {subtitle}
          </p>
        </div>
      </header>
      <div className="px-3 pb-1 pt-0.5">
        {rows.map((row, i) => (
          <NoteRow
            key={`${row.kind}-${row.index}`}
            letter={row.letter}
            body={row.body}
            kind={row.kind}
            delay={delayBase + i * 0.04}
            reduceMotion={reduceMotion}
          />
        ))}
      </div>
    </section>
  );
}

/**
 * Escore Z — raciocínio estático no gesto MANTÉM × ELIMINA
 * (inspiração resumo COFEN×COREN: chip+seta+texto; sem tap).
 */
export function LogicFlowAdolescentZClassifyTap({
  steps,
  theme,
  footerRule,
}: LogicFlowAdolescentZClassifyTapProps) {
  const reduceMotion = useReducedMotion();

  const { comando, keepRows, dropRows, transfer } = useMemo(() => {
    const normalized = normalizeLogicFlowSteps(steps);
    const parsed: ParsedRow[] = normalized.map((step, index) => {
      const p = parseAdolescentZStep(step, index);
      return { ...p, body: cleanStepBody(p.raw) };
    });

    const comando = parsed.find((p) => p.kind === 'context')?.body;
    const transfer = parsed.find((p) => p.kind === 'fixacao')?.body;
    const keepRows = parsed.filter((p) => p.kind === 'classify_ok' || p.kind === 'mark');
    const dropRows = parsed.filter((p) => p.kind === 'eliminate' || p.kind === 'threshold');

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
        <h2 className="font-display text-2xl font-black tracking-tight md:text-3xl">
          <span className="bg-gradient-to-b from-orange-500 to-orange-700 bg-clip-text text-transparent drop-shadow-sm">
            MANTÉM
          </span>
          <span className="mx-2 text-slate-800">×</span>
          <span className="bg-gradient-to-b from-orange-500 to-orange-700 bg-clip-text text-transparent drop-shadow-sm">
            ELIMINA
          </span>
        </h2>
        <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-orange-800/80">
          Escore Z · Caderneta do Adolescente
        </p>
      </div>

      {comando ? (
        <div className="flex items-start gap-2.5 rounded-2xl border-2 border-orange-300 bg-white/95 px-3 py-3 shadow-sm">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-500 text-white">
            <ClipboardList className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-orange-700">
              Comando
            </p>
            <p className="font-body text-sm font-semibold leading-snug text-slate-900">{comando}</p>
          </div>
        </div>
      ) : null}

      <StudySection
        badge="MANTÉM"
        subtitle="Faixa que a Caderneta confirma — orientar estilo de vida"
        rows={keepRows}
        reduceMotion={reduceMotion}
        delayBase={0.05}
      />

      <StudySection
        badge="ELIMINA"
        subtitle="Banca desloca ±1 DP — limiar errado nas categorias vizinhas"
        rows={dropRows}
        reduceMotion={reduceMotion}
        delayBase={0.12}
      />
    </BoardChrome>
  );
}
