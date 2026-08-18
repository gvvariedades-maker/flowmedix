'use client';

import { useMemo, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  BookOpen,
  Check,
  Compass,
  Pill,
  Pin,
  Scale,
  Target,
  X,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';
import { BoardChrome, CriticalNumber } from '../primitives';
import { cn } from '@/lib/utils';

interface GoldenRulePkPdReferenceBoardProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

const ADME_PHASES = [
  { letter: 'A', label: 'Absorção' },
  { letter: 'D', label: 'Distribuição' },
  { letter: 'M', label: 'Metabolismo' },
  { letter: 'E', label: 'Excreção' },
] as const;

type SectionTone = 'violet' | 'green' | 'orange' | 'red';

const SECTION: Record<
  SectionTone,
  { box: string; pill: string; ink: string; soft: string }
> = {
  violet: {
    box: 'border-violet-400 bg-violet-50/90',
    pill: 'bg-violet-600',
    ink: 'text-violet-950',
    soft: 'text-violet-900/85',
  },
  green: {
    box: 'border-emerald-400 bg-emerald-50/90',
    pill: 'bg-emerald-600',
    ink: 'text-emerald-950',
    soft: 'text-emerald-900/85',
  },
  orange: {
    box: 'border-orange-400 bg-orange-50/90',
    pill: 'bg-orange-500',
    ink: 'text-orange-950',
    soft: 'text-orange-900/85',
  },
  red: {
    box: 'border-rose-400 bg-rose-50/90',
    pill: 'bg-rose-600',
    ink: 'text-rose-950',
    soft: 'text-rose-900/90',
  },
};

function isAlertRow(row: GoldenRuleRow): boolean {
  return row.emphasis === 'alert' || row.badge === 'warn';
}

function extractPercent(text: string): string | null {
  const m = text.match(/(\d+)\s*%/);
  return m?.[1] ?? null;
}

function rowMentionsAdme(row: GoldenRuleRow): boolean {
  return /\badme\b/i.test(`${row.label} ${row.value}`);
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
      className={cn('relative rounded-2xl border-[2.5px] p-3 pt-4 shadow-sm md:p-4 md:pt-5', s.box)}
      aria-label={ariaLabel}
    >
      {/* Pill header estilo EBSERH — barra sólida no topo da seção, sem clique */}
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

/**
 * Board estático PK/PD — modelo visual EBSERH (seções coloridas + pills + trilho),
 * sem tap/lentes. Labels/values vêm do JSON; 0 hardcode de gabarito/letra.
 */
export function GoldenRulePkPdReferenceBoard({
  content,
  rows,
  theme,
  footerRule,
}: GoldenRulePkPdReferenceBoardProps) {
  const reduceMotion = useReducedMotion();

  const { keepRows, alertRows, showAdmeRail, criticalPct, pkRow, pdRow } = useMemo(() => {
    const keep = rows.filter((r) => !isAlertRow(r));
    const alerts = rows.filter((r) => isAlertRow(r));
    const pk = keep.find((r) => /cin[eé]tica/i.test(r.label)) ?? keep[0];
    const pd = keep.find((r) => /din[aâ]mica/i.test(r.label)) ?? keep[1];
    const pctSource = alerts[0]?.value ?? alerts[0]?.label ?? '';
    return {
      keepRows: keep,
      alertRows: alerts,
      showAdmeRail: pk ? rowMentionsAdme(pk) : false,
      criticalPct: extractPercent(pctSource),
      pkRow: pk,
      pdRow: pd,
    };
  }, [rows]);

  if (rows.length === 0) return null;

  const title = content?.trim() || 'CINÉTICA × DINÂMICA × t½';

  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.1}
      maxWidth="2xl"
      footerLabel="Fixação de prova"
      footerRule={footerRule}
    >
      {/* 1) Header azul (modelo EBSERH) */}
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

      {/* 2) Roxo — essência: PK × PD lado a lado + pin */}
      {(pkRow || pdRow) && (
        <SectionShell
          tone="violet"
          title="Essência — cinética × dinâmica"
          icon={Scale}
          ariaLabel="Essência cinética e dinâmica"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[pkRow, pdRow].filter(Boolean).map((row, i) => (
              <div
                key={`pair-${row!.label}-${i}`}
                className="flex items-start gap-2.5 rounded-xl bg-white/80 px-2.5 py-2"
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700 ring-1 ring-violet-200">
                  {i === 0 ? (
                    <Activity className="h-4 w-4" aria-hidden />
                  ) : (
                    <Zap className="h-4 w-4" aria-hidden />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 font-body text-sm font-bold text-violet-950">
                    <Check className="h-4 w-4 shrink-0 text-emerald-600" strokeWidth={3} aria-hidden />
                    {row!.label}
                  </p>
                  <p className="mt-0.5 font-body text-xs font-medium leading-snug text-slate-700 md:text-sm">
                    {row!.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 flex items-start gap-2 rounded-xl bg-white/70 px-3 py-2 font-body text-xs font-bold leading-snug text-violet-950 md:text-sm">
            <Pin className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" aria-hidden />
            <span>
              Cinética = o <em className="not-italic font-black">organismo</em> processa · Dinâmica = o{' '}
              <em className="not-italic font-black">fármaco</em> age
            </span>
          </p>
        </SectionShell>
      )}

      {/* 3) Verde — lista “cai em prova” (estática) */}
      <SectionShell
        tone="green"
        title="O que a banca testa (cai em prova!)"
        icon={Compass}
        ariaLabel="Pontos que caem em prova"
      >
        <ul className="flex flex-col gap-2.5">
          {keepRows.map((row, i) => (
            <li
              key={`green-${row.label}-${i}`}
              className="flex items-start gap-2.5 rounded-xl bg-white/75 px-2.5 py-2"
            >
              <span className="relative mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200">
                <BookOpen className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 font-body text-sm font-bold text-emerald-950">
                  <Check className="h-4 w-4 shrink-0 text-emerald-600" strokeWidth={3} aria-hidden />
                  {row.label}
                </p>
                <p className="mt-0.5 font-body text-xs font-medium leading-snug text-slate-700 md:text-sm">
                  {row.value}
                </p>
              </div>
            </li>
          ))}
          {alertRows[0] ? (
            <li className="flex items-start gap-2.5 rounded-xl bg-white/75 px-2.5 py-2">
              <span className="relative mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-700 ring-1 ring-rose-200">
                <X className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full bg-rose-600 p-0.5 text-white" aria-hidden />
                <AlertTriangle className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 font-body text-sm font-bold text-emerald-950">
                  <Check className="h-4 w-4 shrink-0 text-emerald-600" strokeWidth={3} aria-hidden />
                  Não confundir meia-vida com eliminação total
                </p>
                <p className="mt-0.5 font-body text-xs font-medium leading-snug text-slate-700 md:text-sm">
                  {alertRows[0].value}
                </p>
              </div>
            </li>
          ) : null}
        </ul>
      </SectionShell>

      {/* 4) Laranja — ADME em linha (como Ética/Decoro/Boa-fé/Lealdade) */}
      {showAdmeRail ? (
        <SectionShell
          tone="orange"
          title="Fundamento ADME — o corpo processa"
          icon={BookOpen}
          ariaLabel="Trilho ADME"
        >
          <p className="mb-3 text-center font-body text-xs font-semibold text-orange-950/85 md:text-sm">
            {pkRow?.value ?? 'O organismo processa o fármaco nestas fases:'}
          </p>
          <div className="relative px-1">
            <div
              className="pointer-events-none absolute left-[12%] right-[12%] top-[1.35rem] hidden h-0.5 bg-orange-300 sm:block"
              aria-hidden
            />
            <ol className="relative grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-1.5">
              {ADME_PHASES.map((phase, i) => (
                <li
                  key={phase.letter}
                  className="flex flex-col items-center rounded-xl border-2 border-orange-300 bg-white px-2 py-2.5 text-center shadow-sm"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 font-display text-sm font-black text-white shadow-sm">
                    {phase.letter}
                  </span>
                  <span className="mt-1.5 font-body text-[10px] font-bold uppercase tracking-wide text-orange-950 md:text-[11px]">
                    {phase.label}
                  </span>
                  <span className="sr-only">
                    Fase {i + 1} de {ADME_PHASES.length}
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <p className="mt-3 flex items-center justify-center gap-2 font-body text-xs font-bold text-orange-950 md:text-sm">
            <Target className="h-4 w-4 shrink-0 text-orange-600" aria-hidden />
            Ordem da cinética — memorizar o trilho ADME
          </p>
        </SectionShell>
      ) : null}

      {/* 5) Vermelho — consequências / pegadinha (aberto) */}
      {alertRows.map((row, i) => (
        <SectionShell
          key={`red-${row.label}-${i}`}
          tone="red"
          title="Pegadinha importante"
          icon={AlertTriangle}
          ariaLabel={row.label}
        >
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-4">
            {criticalPct ? (
              <CriticalNumber
                value={criticalPct}
                unit="%"
                label={row.label}
                emphasis="alert"
                className="shrink-0"
              />
            ) : null}
            <ul className="flex min-w-0 flex-1 flex-col gap-2">
              <li className="flex items-start gap-2 rounded-xl bg-white/80 px-2.5 py-2">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-600 font-display text-xs font-black text-white">
                  !
                </span>
                <p className="font-body text-sm font-bold leading-snug text-rose-950">
                  {row.label}: {row.value}
                </p>
              </li>
              <li className="flex items-start gap-2 rounded-xl bg-white/80 px-2.5 py-2">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" strokeWidth={3} aria-hidden />
                <p className="font-body text-sm font-semibold leading-snug text-rose-950">
                  {criticalPct
                    ? `Trocar ${criticalPct}% por 100% / “eliminação total” é o erro clássico.`
                    : 'Não troque o marco numérico da meia-vida por eliminação total.'}
                </p>
              </li>
            </ul>
          </div>
        </SectionShell>
      ))}
    </BoardChrome>
  );
}
