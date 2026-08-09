'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  CheckCircle2,
  ClipboardCheck,
  ShieldCheck,
  Target,
  XCircle,
  ArrowRightLeft,
  type LucideIcon,
} from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import { parseAdolescentExcetoStep } from '@/lib/slides/adolescentSlideUtils';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { BoardChrome, boardTone, type BoardTone } from '../primitives';
import { cn } from '@/lib/utils';

interface LogicFlowAdolescentExcetoIsolateBoardProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  /** Ignorado — board glanceable (0 taps). */
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
}

type ParsedStep = ReturnType<typeof parseAdolescentExcetoStep> & { key: string };

type RowSkin = {
  tone: BoardTone;
  leftLabel: string;
  Icon: LucideIcon;
  rowBg: string;
  iconWrap: string;
};

function kindSkin(kind: ParsedStep['kind']): RowSkin {
  switch (kind) {
    case 'command':
      return {
        tone: 'command',
        leftLabel: 'Comando',
        Icon: Target,
        rowBg: 'bg-sky-50',
        iconWrap: 'bg-sky-500 text-white',
      };
    case 'keep':
      return {
        tone: 'keep',
        leftLabel: 'Manter',
        Icon: CheckCircle2,
        rowBg: 'bg-emerald-50',
        iconWrap: 'bg-emerald-500 text-white',
      };
    case 'exception':
      return {
        tone: 'exception',
        leftLabel: 'Exceção',
        Icon: XCircle,
        rowBg: 'bg-rose-50',
        iconWrap: 'bg-rose-600 text-white',
      };
    case 'mark':
      return {
        tone: 'command',
        leftLabel: 'Gabarito',
        Icon: CheckCircle2,
        rowBg: 'bg-sky-50',
        iconWrap: 'bg-sky-600 text-white',
      };
    case 'transfer':
      return {
        tone: 'transfer',
        leftLabel: 'Similares',
        Icon: ArrowRightLeft,
        rowBg: 'bg-amber-50',
        iconWrap: 'bg-amber-500 text-white',
      };
    default:
      return {
        tone: 'neutral',
        leftLabel: 'Passo',
        Icon: ClipboardCheck,
        rowBg: 'bg-violet-50',
        iconWrap: 'bg-violet-500 text-white',
      };
  }
}

/** Coluna direita limpa — sem “Letra B — B.” */
function decisionText(step: ParsedStep): string {
  let t = step.text.trim();
  t = t
    .replace(/^comando\s*[:—–-]?\s*/i, '')
    .replace(/^(manter|acolher)\s*[:—–-]?\s*/i, '')
    .replace(/^exce[cç][aã]o\s*[:—–-]?\s*/i, '')
    .replace(/^em similares\s*[:—–-]?\s*/i, '')
    .replace(/^marcar\s+letra\s*[a-e]\s*\.?\s*/i, '')
    .replace(/^gabarito\s*[:—–-]?\s*/i, '')
    .replace(/^letra\s*([a-e])\s*\.?\s*/i, '')
    .replace(/^[.\s—–-]+/, '')
    .trim();

  if (step.kind === 'mark' && step.letter) {
    const letter = step.letter.toUpperCase();
    if (!t || t.toUpperCase() === letter || t.toUpperCase() === `${letter}.`) {
      return `Letra ${letter}`;
    }
    return `Letra ${letter} — ${t}`;
  }

  return t || step.text;
}

/**
 * Slide 2 ética — tabela PASSO × DECISÃO (células soltas, gap branco).
 */
export function LogicFlowAdolescentExcetoIsolateBoard({
  steps,
  theme,
  footerRule,
}: LogicFlowAdolescentExcetoIsolateBoardProps) {
  const reduceMotion = useReducedMotion();
  const normalized = useMemo(() => normalizeLogicFlowSteps(steps), [steps]);
  const parsed = useMemo(
    () =>
      normalized.map((step, index) => ({
        ...parseAdolescentExcetoStep(step, index),
        key: `s${index}`,
      })),
    [normalized],
  );

  if (normalized.length === 0) {
    return (
      <div className="flex min-h-full items-center justify-center p-6">
        <p className="font-body text-slate-400">Nenhum passo definido</p>
      </div>
    );
  }

  const headerTone = boardTone('command');
  const transferTone = boardTone('transfer');

  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.28}
      eyebrow="Funil — isolar a conduta que afasta"
      footerLabel="Fixação"
      footerRule={footerRule}
      maxWidth="2xl"
      className="gap-2"
    >
      <div className="flex flex-col gap-1.5">
        {/* Header azul — barra solta */}
        <div
          className={cn(
            'flex items-center gap-2 rounded-xl px-3 py-2.5 shadow-sm',
            headerTone.badge,
            headerTone.badgeText,
          )}
        >
          <ShieldCheck className="h-5 w-5 shrink-0" strokeWidth={2.5} aria-hidden />
          <p className="font-body text-sm font-bold leading-snug">
            Isolar a única conduta que afasta o adolescente
          </p>
        </div>

        {/* Subheader âmbar */}
        <div
          className={cn(
            'flex items-center gap-2 rounded-xl px-3 py-2 shadow-sm',
            transferTone.badge,
            transferTone.badgeText,
          )}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-amber-700 shadow-sm">
            <ClipboardCheck className="h-4 w-4" aria-hidden />
          </span>
          <p className="font-mono text-[11px] font-black uppercase tracking-wider">
            Esquema de decisão
          </p>
        </div>

        {/* Cabeçalhos de coluna */}
        <div className="grid grid-cols-[6.25rem_1fr] gap-1.5 sm:grid-cols-[7rem_1fr]">
          <div className="rounded-xl bg-sky-700 px-2 py-1.5 text-center shadow-sm">
            <p className="font-mono text-[10px] font-black uppercase tracking-wider text-white">
              Passo
            </p>
          </div>
          <div className="rounded-xl bg-sky-700 px-2 py-1.5 text-center shadow-sm">
            <p className="font-mono text-[10px] font-black uppercase tracking-wider text-white">
              Decisão
            </p>
          </div>
        </div>

        {/* Linhas — células soltas, gap branco */}
        {parsed.map((step, index) => {
          const skin = kindSkin(step.kind);
          const t = boardTone(skin.tone);
          const Icon = skin.Icon;
          const emphasized = step.kind === 'exception';
          const passoChip =
            step.kind === 'mark' && step.letter
              ? step.letter.toUpperCase()
              : skin.leftLabel;

          return (
            <motion.div
              key={step.key}
              initial={reduceMotion ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduceMotion ? 0 : Math.min(index * 0.03, 0.18) }}
              className={cn(
                'grid grid-cols-[6.25rem_1fr] gap-1.5 sm:grid-cols-[7rem_1fr]',
                emphasized && 'relative z-[1]',
              )}
            >
              {/* Passo: ícone + chip curto (1 linha) */}
              <div
                className={cn(
                  'flex min-h-[3rem] items-center justify-center gap-1.5 rounded-xl border px-1.5 py-2 shadow-sm',
                  skin.rowBg,
                  t.border,
                  emphasized && 'ring-2 ring-rose-400/80',
                )}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                    skin.iconWrap,
                  )}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                </span>
                <span
                  className={cn(
                    'truncate font-mono text-[10px] font-black uppercase tracking-wide',
                    t.text,
                  )}
                >
                  {passoChip}
                </span>
              </div>

              <div
                className={cn(
                  'flex min-h-[3rem] items-center rounded-xl border px-3 py-2 shadow-sm',
                  skin.rowBg,
                  t.border,
                  emphasized && 'ring-2 ring-rose-400/80',
                )}
              >
                <p
                  className={cn(
                    'font-body text-[13px] font-semibold leading-snug md:text-sm',
                    t.text,
                    emphasized && 'font-bold',
                  )}
                >
                  {decisionText(step)}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </BoardChrome>
  );
}
