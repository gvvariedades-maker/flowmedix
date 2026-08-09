'use client';

import { useMemo, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  Check,
  FlaskConical,
  Pin,
  Shield,
  Syringe,
  Timer,
  X,
  type LucideIcon,
} from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import type { DangerZoneItem } from './DangerZone';
import {
  inferFarmacoClinicoTrapSlot,
  type FarmacoClinicoTrapSlot,
} from '@/lib/slides/farmacoClinicoProtocolSlideUtils';
import { cn } from '@/lib/utils';

interface DangerZoneFarmacoClinicoTrapProps {
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
  slot: FarmacoClinicoTrapSlot;
  transfer: boolean;
};

const SLOT_ICON: Record<FarmacoClinicoTrapSlot, LucideIcon> = {
  diluente: FlaskConical,
  via: Syringe,
  tempo: Timer,
  monitor: Activity,
  interacao: AlertTriangle,
  transferencia: Shield,
  geral: AlertTriangle,
};

function parseLetter(label: string): string | undefined {
  const m = label.match(/^Letra\s+([A-E])\b/i);
  return m?.[1]?.toUpperCase();
}

function shortTitle(label: string): string {
  return label
    .replace(/^Letra\s+[A-E]\s*[—–-]\s*/i, '')
    .replace(/^Transferência\s*[—–-]?\s*/i, '')
    .trim();
}

function isTransferItem(label: string, slot: FarmacoClinicoTrapSlot): boolean {
  return slot === 'transferencia' || /transfer|similar|mecanismo/i.test(label);
}

function toRow(item: DangerZoneItem, index: number): TrapRow {
  const label = (item.label || item.title || `Pegadinha ${index + 1}`).trim();
  const detail = (item.detail || item.description || '').trim();
  const correct = typeof item.correct === 'string' ? item.correct.trim() : '';
  const slot = inferFarmacoClinicoTrapSlot(label, detail, correct);
  return {
    label,
    detail,
    correct,
    letter: parseLetter(label),
    slot,
    transfer: isTransferItem(label, slot),
  };
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
  const Icon = SLOT_ICON[row.slot] ?? AlertTriangle;
  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduceMotion ? 0 : delay }}
      className="flex flex-col gap-2 rounded-2xl border-2 border-rose-200 bg-white p-2.5 shadow-sm"
      aria-label={`${row.letter ? `Letra ${row.letter}` : row.label} — pegadinha`}
    >
      <div className="flex items-start gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-sm">
          <X className="h-4 w-4" strokeWidth={3} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-1.5 font-body text-xs font-black uppercase tracking-wide text-rose-950 md:text-sm">
            {row.letter ? (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded bg-slate-900 px-1 font-mono text-[10px] text-white">
                {row.letter}
              </span>
            ) : (
              <Icon className="h-3.5 w-3.5 text-rose-700" aria-hidden />
            )}
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
        <div className="flex items-start gap-2 rounded-xl border-2 border-emerald-300 bg-emerald-50 px-2.5 py-2">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" strokeWidth={3} aria-hidden />
          <p className="font-body text-xs font-bold leading-snug text-emerald-950 md:text-sm">
            {row.correct}
          </p>
        </div>
      ) : null}
    </motion.article>
  );
}

function SectionShell({
  tone,
  title,
  icon: Icon,
  children,
  ariaLabel,
}: {
  tone: 'rose' | 'violet' | 'amber';
  title: string;
  icon: LucideIcon;
  children: ReactNode;
  ariaLabel: string;
}) {
  const styles = {
    rose: {
      box: 'border-rose-400 bg-rose-50/95',
      pill: 'bg-rose-600',
    },
    violet: {
      box: 'border-violet-400 bg-violet-50/95',
      pill: 'bg-violet-700',
    },
    amber: {
      box: 'border-amber-400 bg-amber-50/95',
      pill: 'bg-amber-500',
    },
  }[tone];

  return (
    <section
      className={cn('rounded-2xl border-[2.5px] p-3 shadow-sm md:p-3.5', styles.box)}
      aria-label={ariaLabel}
    >
      <div
        className={cn(
          'mb-2.5 inline-flex max-w-full items-center gap-2 rounded-xl px-3 py-1.5 text-white shadow-sm',
          styles.pill,
        )}
      >
        <Icon className="h-4 w-4 shrink-0" aria-hidden />
        <span className="font-body text-[11px] font-bold leading-tight md:text-xs">{title}</span>
      </div>
      {children}
    </section>
  );
}

/**
 * Pegadinhas IBP EV — poster estático (✗ + ✓ abertos, 0 taps).
 * Herói = vedação bólus/SC/diluente; transferência no rodapé.
 */
export function DangerZoneFarmacoClinicoTrap({
  content,
  items,
  theme: _theme,
  footerRule,
}: DangerZoneFarmacoClinicoTrapProps) {
  const reduceMotion = useReducedMotion();

  const { title, letterTraps, transferRows, heroLine } = useMemo(() => {
    const rows = items.map(toRow);
    const traps = rows.filter((r) => !r.transfer && r.letter);
    const otherTraps = rows.filter((r) => !r.transfer && !r.letter);
    const transfers = rows.filter((r) => r.transfer);

    const letters = traps.map((r) => r.letter).filter(Boolean) as string[];
    const hasBolus = rows.some((r) => /b[oó]lus/i.test(`${r.label} ${r.detail} ${r.correct}`));
    const hasSc = rows.some((r) => /subcut|sc\b/i.test(`${r.label} ${r.detail} ${r.correct}`));
    const hasDil = rows.some((r) => /fosfato|diluent|glicose/i.test(`${r.label} ${r.detail}`));

    const chips = [
      hasDil ? 'diluente inventado' : null,
      hasSc ? 'via SC' : null,
      hasBolus ? 'bólus rápido' : null,
    ].filter(Boolean);

    return {
      title: content?.trim() || 'PEGADINHAS — IBP EV',
      letterTraps: [...traps, ...otherTraps],
      transferRows: transfers,
      heroLine:
        chips.length > 0
          ? `Elimine: ${chips.join(' · ')}`
          : 'Elimine bólus, SC e diluição exótica',
    };
  }, [items, content]);

  if (items.length === 0) return null;

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto bg-[#fff7f9]">
      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col gap-3 px-3 py-3 md:gap-3.5 md:px-4 md:py-4">
        {/* Header */}
        <motion.header
          initial={reduceMotion ? false : { opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-2xl border-2 border-rose-700 bg-rose-600 px-3 py-2.5 shadow-md md:px-4"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/30">
            <AlertTriangle className="h-5 w-5 text-white" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-rose-100">
              Técnica EV — armadilhas
            </p>
            <h2 className="font-display text-sm font-black uppercase leading-snug tracking-wide text-white md:text-base">
              {title}
            </h2>
          </div>
        </motion.header>

        {/* Herói outdoor — decisão em 1s */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduceMotion ? 0 : 0.03 }}
          className="rounded-2xl border-[3px] border-rose-500 bg-gradient-to-r from-rose-50 via-white to-fuchsia-50 px-3 py-3 text-center shadow-md ring-2 ring-rose-200/80"
        >
          <p className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-rose-700">
            Vedação principal
          </p>
          <p className="mt-0.5 font-display text-base font-black uppercase leading-snug text-rose-950 md:text-lg">
            <span className="text-rose-600">NÃO</span> marque isto
          </p>
          <p className="mt-1 font-body text-sm font-bold text-slate-800">{heroLine}</p>
        </motion.div>

        {/* Distratores por letra — ✗/✓ abertos */}
        {letterTraps.length > 0 ? (
          <SectionShell
            tone="rose"
            title="Distratores — pegadinha × conduta"
            icon={X}
            ariaLabel="Distratores com correção aberta"
          >
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {letterTraps.map((row, i) => (
                <OpenTrapCard
                  key={`trap-${row.label}`}
                  row={row}
                  delay={0.05 + i * 0.03}
                  reduceMotion={reduceMotion}
                />
              ))}
            </div>
            <p className="mt-3 flex items-start gap-2 rounded-xl border-2 border-rose-200 bg-white/90 px-3 py-2 font-body text-xs font-bold leading-snug text-rose-950 md:text-sm">
              <Pin className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" aria-hidden />
              Pegadinha-mãe: urgência clínica ≠ bólus rápido nem SC “equivalente” ao EV.
            </p>
          </SectionShell>
        ) : null}

        {/* Transferência / mecanismo */}
        {transferRows.length > 0 ? (
          <SectionShell
            tone="violet"
            title="O que acertar na prova"
            icon={Shield}
            ariaLabel="Transferência de prova"
          >
            <div className="flex flex-col gap-2">
              {transferRows.map((row) => (
                <div
                  key={`fix-${row.label}`}
                  className="rounded-xl border-2 border-violet-300 bg-white px-3 py-2.5 shadow-sm"
                >
                  <p className="flex items-center gap-1.5 font-body text-xs font-black uppercase text-violet-950">
                    <Check className="h-4 w-4 text-emerald-600" strokeWidth={3} aria-hidden />
                    {shortTitle(row.label)}
                  </p>
                  {row.correct ? (
                    <p className="mt-1 font-body text-xs font-semibold leading-snug text-slate-800 md:text-sm">
                      {row.correct}
                    </p>
                  ) : row.detail ? (
                    <p className="mt-1 font-body text-xs font-semibold leading-snug text-slate-800 md:text-sm">
                      {row.detail}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
            <div className="mt-2.5 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {['VIA', 'DILUENTE', 'TEMPO', 'MONITOR'].map((chip) => (
                <div
                  key={chip}
                  className="rounded-xl border-2 border-emerald-400 bg-emerald-50 px-1 py-2 text-center font-display text-[10px] font-black uppercase tracking-wide text-emerald-950"
                >
                  ✓ {chip}
                </div>
              ))}
            </div>
          </SectionShell>
        ) : null}

        {footerRule ? (
          <div className="rounded-2xl border-2 border-slate-800 bg-slate-950 px-3 py-2.5 text-center shadow-md">
            <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-cyan-300">
              Transferência de prova
            </p>
            <p className="mt-0.5 font-body text-sm font-bold leading-snug text-white">
              {footerRule}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
