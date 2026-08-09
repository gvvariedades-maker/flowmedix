'use client';

import { useMemo, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  AlertTriangle,
  Check,
  Pill,
  Pin,
  Shield,
  Target,
  X,
  type LucideIcon,
} from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import type { DangerZoneItem } from './DangerZone';
import { BoardChrome } from '../primitives';
import { cn } from '@/lib/utils';

interface DangerZoneFarmacoTrapProps {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  footerRule?: string;
  /** Contrato do schema; molde é estático (sem clique / reveal). */
  compareRevealMode?: LogicFlowRevealMode;
}

type TrapRow = {
  label: string;
  detail: string;
  correct: string;
  letter?: string;
  transfer: boolean;
};

type SectionTone = 'red' | 'yellow' | 'orange' | 'green';

const SECTION: Record<
  SectionTone,
  { box: string; pill: string; ink: string }
> = {
  red: {
    box: 'border-rose-400 bg-rose-50/90',
    pill: 'bg-rose-600',
    ink: 'text-rose-950',
  },
  yellow: {
    box: 'border-amber-400 bg-amber-50/90',
    pill: 'bg-amber-500',
    ink: 'text-amber-950',
  },
  orange: {
    box: 'border-orange-400 bg-orange-50/90',
    pill: 'bg-orange-500',
    ink: 'text-orange-950',
  },
  green: {
    box: 'border-emerald-400 bg-emerald-50/90',
    pill: 'bg-emerald-600',
    ink: 'text-emerald-950',
  },
};

function isTransferItem(label: string): boolean {
  return /transfer|similar/i.test(label);
}

function parseLetter(label: string): string | undefined {
  const m = label.match(/^Letra\s+([A-E])\b/i);
  return m?.[1]?.toUpperCase();
}

function shortTitle(label: string): string {
  const m = label.match(/^Letra\s+[A-E]\s*[—–-]\s*(.+)$/i);
  return (m?.[1] ?? label).trim();
}

function toRow(item: DangerZoneItem, index: number): TrapRow {
  const label = (item.label || item.title || `Pegadinha ${index + 1}`).trim();
  return {
    label,
    detail: (item.detail || item.description || '').trim(),
    correct: typeof item.correct === 'string' ? item.correct.trim() : '',
    letter: parseLetter(label),
    transfer: isTransferItem(label),
  };
}

function SectionShell({
  tone,
  title,
  icon: Icon,
  children,
  ariaLabel,
}: {
  tone: SectionTone;
  title: string;
  icon: LucideIcon;
  children: ReactNode;
  ariaLabel: string;
}) {
  const s = SECTION[tone];
  return (
    <section
      className={cn('rounded-2xl border-[2.5px] p-3 shadow-sm md:p-4', s.box)}
      aria-label={ariaLabel}
    >
      <div
        className={cn(
          'mb-3 inline-flex max-w-full items-center gap-2 rounded-xl px-3 py-1.5 text-white shadow-sm',
          s.pill,
        )}
      >
        <Icon className="h-4 w-4 shrink-0" aria-hidden />
        <span className="font-body text-[11px] font-bold leading-tight md:text-xs">{title}</span>
      </div>
      {children}
    </section>
  );
}

function OpenTrapCard({
  row,
  delay,
  reduceMotion,
}: {
  row: TrapRow;
  delay: number;
  reduceMotion: boolean | null;
}) {
  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduceMotion ? 0 : delay }}
      className="flex flex-col gap-2 rounded-xl border border-white/80 bg-white/85 p-2.5 shadow-sm"
    >
      <div className="flex items-start gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-600 text-white">
          <X className="h-4 w-4" strokeWidth={3} aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="font-body text-xs font-black uppercase tracking-wide text-rose-950 md:text-sm">
            {row.letter ? (
              <span className="mr-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded bg-slate-900 px-1 font-mono text-[10px] text-white">
                {row.letter}
              </span>
            ) : null}
            {shortTitle(row.label)}
          </p>
          {row.detail ? (
            <p className="mt-0.5 font-body text-xs font-medium leading-snug text-slate-700 md:text-sm">
              {row.detail}
            </p>
          ) : null}
        </div>
      </div>
      {row.correct ? (
        <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50/90 px-2 py-1.5">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" strokeWidth={3} aria-hidden />
          <p className="font-body text-xs font-semibold leading-snug text-emerald-950 md:text-sm">
            {row.correct}
          </p>
        </div>
      ) : null}
    </motion.article>
  );
}

/**
 * Pegadinhas PK/PD — poster estático (modelo EBSERH: seções coloridas + ✗/✓ abertos).
 * Sem tap / “toque para ver”. JSON alimenta label/detail/correct.
 */
export function DangerZoneFarmacoTrap({
  content,
  items,
  theme,
  footerRule,
}: DangerZoneFarmacoTrapProps) {
  const reduceMotion = useReducedMotion();

  const { vedacao, atencao, alcance, transfers, keepChips } = useMemo(() => {
    const rows = items.map(toRow);
    const traps = rows.filter((r) => !r.transfer);
    const transfersRows = rows.filter((r) => r.transfer);

    const byLetter = (letters: string[]) =>
      traps.filter((r) => r.letter && letters.includes(r.letter));

    let vedacaoRows = byLetter(['A', 'C', 'D']);
    if (vedacaoRows.length < 2) vedacaoRows = traps.slice(0, Math.min(3, traps.length));

    const vedacaoKeys = new Set(vedacaoRows.map((r) => r.label));
    let atencaoRows = traps.filter((r) => !vedacaoKeys.has(r.label));
    if (atencaoRows.length === 0 && traps.length > 3) {
      atencaoRows = traps.slice(3);
    }

    const alcanceRows = traps
      .filter((r) => /50%|100%|adme|meia-vida|elimina/i.test(`${r.detail} ${r.correct}`))
      .slice(0, 2);

    const chips = [
      { label: 'ADME', ok: traps.some((r) => /\badme\b/i.test(`${r.detail} ${r.correct}`)) },
      { label: 'PD = ação', ok: traps.some((r) => /din[aâ]mica|a[cç][aã]o/i.test(r.correct)) },
      { label: 't½ = 50%', ok: traps.some((r) => /50%/.test(`${r.detail} ${r.correct}`)) },
      { label: 'I + II', ok: traps.some((r) => /i e ii|s[oó] i e ii/i.test(r.correct)) },
    ].filter((c) => c.ok);

    return {
      vedacao: vedacaoRows,
      atencao: atencaoRows,
      alcance: alcanceRows.length >= 2 ? alcanceRows : traps.slice(0, 2),
      transfers: transfersRows,
      keepChips: chips.length > 0 ? chips : [
        { label: 'ADME', ok: true },
        { label: 'PD', ok: true },
        { label: 't½ 50%', ok: true },
      ],
    };
  }, [items]);

  if (items.length === 0) return null;

  const title = content?.trim() || 'PEGADINHAS — PK/PD V/F';

  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.1}
      maxWidth="2xl"
      footerLabel="Transferência de prova"
      footerRule={footerRule}
    >
      {/* Header azul */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 rounded-2xl bg-[#2563eb] px-4 py-3 shadow-md"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
          <Pill className="h-5 w-5 text-white" aria-hidden />
        </span>
        <p className="min-w-0 font-display text-sm font-black uppercase leading-snug tracking-wide text-white md:text-base">
          {title}
        </p>
      </motion.div>

      {/* 1) Vermelho — vedação / distratores principais (✗ + ✓ abertos) */}
      {vedacao.length > 0 ? (
        <SectionShell
          tone="red"
          title="Vedação principal — não marque isto"
          icon={X}
          ariaLabel="Distratores principais"
        >
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {vedacao.map((row, i) => (
              <OpenTrapCard
                key={`ved-${row.label}`}
                row={row}
                delay={i * 0.03}
                reduceMotion={reduceMotion}
              />
            ))}
          </div>
          <p className="mt-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-white/80 px-3 py-2 font-body text-xs font-bold leading-snug text-rose-950 md:text-sm">
            <Pin className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" aria-hidden />
            Pegadinha-mãe: meia-vida = queda de 50% — nunca eliminação total (100%).
          </p>
        </SectionShell>
      ) : null}

      {/* 2) Amarelo — atenção em prova */}
      {atencao.length > 0 ? (
        <SectionShell
          tone="yellow"
          title="Atenção em prova!"
          icon={AlertTriangle}
          ariaLabel="Atenção em prova"
        >
          <p className="mb-2 flex items-center gap-2 font-body text-xs font-bold text-amber-950 md:text-sm">
            <X className="h-4 w-4 shrink-0 text-rose-600" strokeWidth={3} aria-hidden />
            Não autoriza combinações que:
          </p>
          <div className="flex flex-col gap-2">
            {atencao.map((row, i) => (
              <OpenTrapCard
                key={`aten-${row.label}`}
                row={row}
                delay={0.08 + i * 0.03}
                reduceMotion={reduceMotion}
              />
            ))}
          </div>
        </SectionShell>
      ) : null}

      {/* 3) Laranja — alcance da armadilha (2 eixos) */}
      {alcance.length > 0 ? (
        <SectionShell
          tone="orange"
          title="Alcance da armadilha"
          icon={Shield}
          ariaLabel="Alcance da armadilha"
        >
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {alcance.map((row, i) => (
              <div
                key={`alc-${row.label}`}
                className="rounded-xl border-2 border-orange-300 bg-white px-3 py-2.5 shadow-sm"
              >
                <p className="flex items-center gap-1.5 font-body text-xs font-black uppercase text-orange-950">
                  <Check className="h-4 w-4 text-emerald-600" strokeWidth={3} aria-hidden />
                  {shortTitle(row.label)}
                </p>
                {row.detail ? (
                  <p className="mt-1 flex items-start gap-1.5 font-body text-xs font-medium text-rose-800">
                    <X className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={3} aria-hidden />
                    {row.detail}
                  </p>
                ) : null}
                {row.correct ? (
                  <p className="mt-1.5 flex items-start gap-1.5 font-body text-xs font-semibold text-emerald-900">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={3} aria-hidden />
                    {row.correct}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </SectionShell>
      ) : null}

      {/* 4) Verde — o que proteger / transferência */}
      <SectionShell
        tone="green"
        title="O que acertar na prova"
        icon={Shield}
        ariaLabel="O que acertar"
      >
        <p className="mb-2 font-body text-xs font-semibold text-emerald-950 md:text-sm">
          Fixe estes marcos:
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {keepChips.map((chip) => (
            <div
              key={chip.label}
              className="flex flex-col items-center rounded-xl border-2 border-emerald-400 bg-emerald-600 px-2 py-2.5 text-center text-white shadow-sm"
            >
              <Check className="h-4 w-4" strokeWidth={3} aria-hidden />
              <span className="mt-1 font-body text-[10px] font-bold uppercase tracking-wide md:text-[11px]">
                {chip.label}
              </span>
            </div>
          ))}
        </div>
        {transfers.map((row, i) => (
          <div
            key={`tr-${i}`}
            className="mt-3 flex items-start gap-2 rounded-xl bg-white/85 px-3 py-2.5 shadow-sm"
          >
            <Target className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden />
            <div className="min-w-0">
              <p className="font-body text-xs font-black uppercase text-emerald-950">
                {shortTitle(row.label)}
              </p>
              <p className="mt-0.5 font-body text-xs font-semibold leading-snug text-emerald-900 md:text-sm">
                {row.correct || row.detail}
              </p>
            </div>
          </div>
        ))}
      </SectionShell>
    </BoardChrome>
  );
}
