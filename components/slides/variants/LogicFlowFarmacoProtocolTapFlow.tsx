'use client';

import { useMemo, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  AlertTriangle,
  Check,
  Droplets,
  Info,
  Syringe,
  X,
} from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { cn } from '@/lib/utils';

interface LogicFlowFarmacoProtocolTapFlowProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  /** Contrato do schema; molde é estático (sem tap / reveal). */
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
}

type LetterDecision = {
  letter: string;
  claim: string;
  reason: string;
  keep: boolean;
};

type ParsedProtocol = {
  nucleus: string | null;
  decisions: LetterDecision[];
  markLetter: string | null;
  transfer: string | null;
};

const EMPHASIS_RE =
  /\b(antes|não|nao|nunca|sem|elimina|mantém|mantem|bolus|bólus|monitorar|diluir)\b/gi;

function EmphasisText({ text, className }: { text: string; className?: string }) {
  const parts = text.split(EMPHASIS_RE);
  const matches = text.match(EMPHASIS_RE) ?? [];
  if (matches.length === 0) {
    return <span className={className}>{text}</span>;
  }
  const nodes: ReactNode[] = [];
  parts.forEach((part, i) => {
    if (part) nodes.push(<span key={`t-${i}`}>{part}</span>);
    const hit = matches[i];
    if (hit) {
      nodes.push(
        <span key={`e-${i}`} className="font-black text-red-600">
          {hit}
        </span>,
      );
    }
  });
  return <span className={className}>{nodes}</span>;
}

function parseProtocolSteps(steps: string[]): ParsedProtocol {
  let nucleus: string | null = null;
  let markLetter: string | null = null;
  let transfer: string | null = null;
  const decisions: LetterDecision[] = [];

  for (const raw of steps) {
    const step = raw.replace(/\s+/g, ' ').trim();
    if (!step) continue;

    const nucleusMatch = step.match(/^n[uú]cleo\s*[:—–-]\s*(.+)$/i);
    if (nucleusMatch) {
      nucleus = nucleusMatch[1]!.trim();
      continue;
    }

    const markMatch = step.match(/^marcar\s+letra\s+([A-E])\b/i);
    if (markMatch) {
      markLetter = markMatch[1]!.toUpperCase();
      continue;
    }

    const transferMatch = step.match(/^em similares\s*[:—–-]?\s*(.+)$/i);
    if (transferMatch) {
      transfer = transferMatch[1]!.trim();
      continue;
    }

    const letterMatch = step.match(
      /^([A-E])\s*[:—–-]\s*(.+?)\s*→\s*(elimina|mant[eé]m)\s*(?:\(([^)]+)\))?\s*\.?$/i,
    );
    if (letterMatch) {
      decisions.push({
        letter: letterMatch[1]!.toUpperCase(),
        claim: letterMatch[2]!.trim(),
        reason: (letterMatch[4] || letterMatch[3] || '').trim(),
        keep: /^mant/i.test(letterMatch[3]!),
      });
      continue;
    }

    // fallback: "B: …" sem seta
    const loose = step.match(/^([A-E])\s*[:—–-]\s*(.+)$/i);
    if (loose) {
      const body = loose[2]!.trim();
      const keep = /mant[eé]m|correta|gabarito/i.test(body);
      decisions.push({
        letter: loose[1]!.toUpperCase(),
        claim: body.replace(/\s*→\s*(elimina|mant[eé]m).*$/i, '').trim(),
        reason: keep ? 'mantém' : 'elimina',
        keep,
      });
    }
  }

  if (!markLetter) {
    const kept = decisions.find((d) => d.keep);
    if (kept) markLetter = kept.letter;
  }

  return { nucleus, decisions, markLetter, transfer };
}

function PriorityRow({
  left,
  leftTone,
  right,
  rightTone,
  icon,
}: {
  left: ReactNode;
  leftTone: string;
  right: ReactNode;
  rightTone: string;
  icon?: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] gap-1.5 sm:grid-cols-[8.75rem_1fr] sm:gap-2">
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2.5 text-center text-white shadow-sm',
          leftTone,
        )}
      >
        {icon}
        <span className="font-display text-[10px] font-black uppercase leading-tight tracking-wide sm:text-[11px]">
          {left}
        </span>
      </div>
      <div
        className={cn(
          'flex items-center gap-2.5 rounded-2xl px-3 py-2.5 shadow-sm ring-1 ring-black/5 sm:px-4',
          rightTone,
        )}
      >
        {right}
      </div>
    </div>
  );
}

/**
 * Protocolo clínico EV — poster estático estilo print de urgência
 * (faixas prioridade + faixa verde + tabela). Sem tap.
 */
export function LogicFlowFarmacoProtocolTapFlow({
  steps,
  theme: _theme,
  footerRule,
}: LogicFlowFarmacoProtocolTapFlowProps) {
  const reduceMotion = useReducedMotion();
  const parsed = useMemo(
    () => parseProtocolSteps(normalizeLogicFlowSteps(steps)),
    [steps],
  );

  const { nucleus, decisions, markLetter, transfer } = parsed;
  const keep = decisions.find((d) => d.keep);
  const traps = decisions.filter((d) => !d.keep);
  const classicTrap =
    traps.find((d) => /b[oó]lus|r[aá]pid/i.test(`${d.claim} ${d.reason}`)) ??
    traps.find((d) => /via|subcut|sc\b/i.test(`${d.claim} ${d.reason}`)) ??
    traps[0];

  if (!nucleus && decisions.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <p className="font-body text-sm text-slate-500">Nenhum passo de protocolo definido</p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto bg-[#f8fafc]">
      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col gap-2.5 px-3 py-3 md:gap-3 md:px-4 md:py-4">
        {/* Faixa 1 — prioridade / núcleo */}
        {nucleus ? (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <PriorityRow
              left={
                <>
                  Prioridade
                  <br />
                  sempre
                </>
              }
              leftTone="bg-[#e11d48]"
              rightTone="bg-rose-100"
              icon={<AlertTriangle className="h-5 w-5 text-white" aria-hidden />}
              right={
                <div className="min-w-0">
                  <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-rose-700">
                    Núcleo do protocolo
                  </p>
                  <p className="mt-0.5 font-body text-sm font-bold leading-snug text-slate-900 md:text-[0.95rem]">
                    <EmphasisText text={nucleus} />
                  </p>
                </div>
              }
            />
          </motion.div>
        ) : null}

        {/* Faixa 2 — conduta que mantém (meta) */}
        {keep ? (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduceMotion ? 0 : 0.04 }}
          >
            <PriorityRow
              left={
                <>
                  Meta
                  <br />
                  letra {keep.letter}
                </>
              }
              leftTone="bg-[#2563eb]"
              rightTone="bg-sky-100"
              icon={<Droplets className="h-5 w-5 text-white" aria-hidden />}
              right={
                <div className="min-w-0">
                  <p className="font-display text-sm font-black uppercase tracking-wide text-blue-800">
                    Mantém
                  </p>
                  <p className="mt-0.5 font-body text-sm font-semibold leading-snug text-slate-900">
                    <EmphasisText text={keep.claim} />
                    {keep.reason ? (
                      <span className="mt-0.5 block text-xs font-bold text-blue-800">
                        {keep.reason}
                      </span>
                    ) : null}
                  </p>
                </div>
              }
            />
          </motion.div>
        ) : null}

        {/* Faixa 3 — pegadinha clássica */}
        {classicTrap ? (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduceMotion ? 0 : 0.08 }}
          >
            <PriorityRow
              left={
                <>
                  Elimina
                  <br />
                  {classicTrap.letter}
                </>
              }
              leftTone="bg-[#f59e0b]"
              rightTone="bg-amber-100"
              icon={<Syringe className="h-5 w-5 text-white" aria-hidden />}
              right={
                <div className="min-w-0">
                  <p className="font-display text-sm font-black uppercase tracking-wide text-amber-950">
                    Pegadinha clássica
                  </p>
                  <p className="mt-0.5 font-body text-sm font-semibold leading-snug text-slate-900">
                    <EmphasisText text={classicTrap.claim} />
                    {classicTrap.reason ? (
                      <span className="mt-0.5 block text-xs font-bold text-amber-900">
                        → {classicTrap.reason}
                      </span>
                    ) : null}
                  </p>
                </div>
              }
            />
          </motion.div>
        ) : null}

        {/* Faixa verde — gabarito */}
        {markLetter ? (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduceMotion ? 0 : 0.1 }}
            className="rounded-2xl bg-[#15803d] px-3 py-3 text-center shadow-md"
          >
            <p className="font-display text-sm font-black uppercase tracking-wide text-white md:text-base">
              Marcar letra {markLetter}
              {keep ? ' — monitorização + infusão no tempo' : ''}
            </p>
          </motion.div>
        ) : null}

        {/* Tabela — decisão por letra */}
        {decisions.length > 0 ? (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduceMotion ? 0 : 0.12 }}
            className="flex flex-col gap-1.5"
          >
            <div className="grid grid-cols-[4.5rem_5.5rem_1fr] gap-1.5 sm:grid-cols-[5rem_6.5rem_1fr]">
              {['Letra', 'Decisão', 'Motivo'].map((h) => (
                <div
                  key={h}
                  className="rounded-xl bg-[#1e3a8a] px-2 py-2 text-center font-display text-[10px] font-black uppercase tracking-wide text-white sm:text-[11px]"
                >
                  {h}
                </div>
              ))}
            </div>

            {[...decisions]
              .sort((a, b) => a.letter.localeCompare(b.letter))
              .map((d) => {
                const rowTone = d.keep
                  ? {
                      cell: 'bg-emerald-100 text-emerald-950',
                      label: 'Mantém',
                      Icon: Check,
                    }
                  : {
                      cell: 'bg-rose-100 text-rose-950',
                      label: 'Elimina',
                      Icon: X,
                    };
                const Icon = rowTone.Icon;
                return (
                  <div
                    key={d.letter}
                    className="grid grid-cols-[4.5rem_5.5rem_1fr] gap-1.5 sm:grid-cols-[5rem_6.5rem_1fr]"
                  >
                    <div
                      className={cn(
                        'flex items-center justify-center gap-1 rounded-xl px-1 py-2 font-display text-sm font-black',
                        rowTone.cell,
                      )}
                    >
                      {d.keep ? (
                        <Check className="h-3.5 w-3.5" aria-hidden />
                      ) : (
                        <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
                      )}
                      {d.letter}
                    </div>
                    <div
                      className={cn(
                        'flex items-center justify-center gap-1 rounded-xl px-1 py-2 font-display text-[11px] font-black uppercase',
                        rowTone.cell,
                      )}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      {rowTone.label}
                    </div>
                    <div
                      className={cn(
                        'flex items-center rounded-xl px-2.5 py-2 font-body text-xs font-semibold leading-snug sm:text-sm',
                        rowTone.cell,
                      )}
                    >
                      {d.reason || d.claim}
                    </div>
                  </div>
                );
              })}
          </motion.div>
        ) : null}

        {/* Transferência */}
        {transfer ? (
          <div className="flex items-start gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-3 py-2.5">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" aria-hidden />
            <div>
              <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-sky-800">
                Em similares
              </p>
              <p className="font-body text-xs font-semibold leading-snug text-slate-800 sm:text-sm">
                {transfer}
              </p>
            </div>
          </div>
        ) : null}

        {footerRule ? (
          <div className="rounded-2xl bg-slate-900 px-3 py-2.5 text-center">
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
