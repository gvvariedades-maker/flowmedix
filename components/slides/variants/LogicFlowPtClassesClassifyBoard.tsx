'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CheckCircle2, Filter, XCircle } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { normalizeLogicFlowSteps } from '@/lib/reverseStudySlidesNormalize';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { BoardChrome, CategoryStrip, PolarityPanel, boardTone } from '../primitives';

interface LogicFlowPtClassesClassifyBoardProps {
  steps: string[] | Array<{ id?: string; text: string }>;
  theme: ThemeColors;
  /** Ignorado — board glanceable (0 taps). Aceito para contrato do player / gate tap. */
  revealMode?: LogicFlowRevealMode;
  footerRule?: string;
  chipLabel?: string;
}

function stepTone(text: string): 'keep' | 'exception' | 'command' | 'transfer' | 'neutral' {
  if (/gabarito/i.test(text)) return 'keep';
  if (/eliminar|oposição|oposicao|condição|condicao|concess/i.test(text)) return 'exception';
  if (/similares|outra banca|teste pois|teste troca/i.test(text)) return 'transfer';
  if (/comando|pista|motivo|classe|família|familia|\d+\s*·\s*valor/i.test(text)) return 'command';
  return 'neutral';
}

function parseLayer(text: string): { n: string | null; body: string; chip: string } {
  const m = text.match(/^(\d+)\s*·\s*(.+)$/);
  if (m) {
    const rest = m[2];
    const head = rest.split(/\s*[—–-]\s*/)[0]?.trim() ?? rest;
    return { n: m[1], body: rest, chip: head.slice(0, 28) };
  }
  if (/gabarito/i.test(text)) return { n: null, body: text, chip: 'Gabarito' };
  if (/similares|outra banca/i.test(text)) return { n: null, body: text, chip: 'Transferência' };
  return { n: null, body: text, chip: 'Trilho' };
}

function LayerBadge({
  n,
  tone,
}: {
  n: string | null;
  tone: ReturnType<typeof stepTone>;
}) {
  const t = boardTone(tone);
  if (n) {
    return (
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl font-display text-xl font-black shadow-sm ${t.badge} ${t.badgeText}`}
      >
        {n}
      </div>
    );
  }
  if (tone === 'keep') {
    return <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-700" aria-hidden />;
  }
  if (tone === 'exception') {
    return <XCircle className="mt-0.5 h-6 w-6 shrink-0 text-rose-700" aria-hidden />;
  }
  return <Filter className="mt-0.5 h-6 w-6 shrink-0 text-amber-700" aria-hidden />;
}

/**
 * Classes de palavras — CLASSIFICAR em camadas 1·2·3 (board 0 taps).
 * Inspiração: seções numeradas (regência-style); JSON alimenta tudo.
 */
export function LogicFlowPtClassesClassifyBoard({
  steps,
  theme,
  footerRule,
}: LogicFlowPtClassesClassifyBoardProps) {
  const reduceMotion = useReducedMotion();
  const normalized = useMemo(() => normalizeLogicFlowSteps(steps), [steps]);

  if (normalized.length === 0) {
    return (
      <div className="flex min-h-full items-center justify-center p-6">
        <p className="font-body text-slate-400">Nenhum passo definido</p>
      </div>
    );
  }

  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.4}
      eyebrow="Estratégia de prova"
      footerRule={footerRule}
      footerLabel={footerRule ? 'TRANSFERÊNCIA' : undefined}
      maxWidth="2xl"
    >
      <div className="flex items-center justify-between gap-2">
        <CategoryStrip label="Camadas do conectivo" tone="command" />
        <span className="font-mono text-[10px] font-bold uppercase tracking-wide text-slate-500">
          Board · 0 taps
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {normalized.map((step, index) => {
          const tone = stepTone(step);
          const t = boardTone(tone);
          const layer = parseLayer(step);
          const chip =
            tone === 'keep'
              ? 'Gabarito'
              : tone === 'exception'
                ? 'Eliminar'
                : tone === 'transfer'
                  ? 'Transferência'
                  : layer.n
                    ? `${layer.n} · ${layer.chip}`
                    : `Trilho ${index + 1}`;
          return (
            <motion.div
              key={`pt-classes-step-${index}`}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduceMotion ? 0 : Math.min(index * 0.04, 0.2) }}
            >
              <PolarityPanel tone={tone} emphasized={tone === 'keep'}>
                <div className="flex items-start gap-3">
                  <LayerBadge n={layer.n} tone={tone} />
                  <div className="min-w-0 flex-1">
                    <p className={`font-mono text-[10px] font-bold uppercase tracking-widest ${t.accent}`}>
                      {chip}
                    </p>
                    <p className="mt-1 font-body text-sm font-semibold leading-snug text-slate-900 md:text-base">
                      {layer.body}
                    </p>
                  </div>
                </div>
              </PolarityPanel>
            </motion.div>
          );
        })}
      </div>
    </BoardChrome>
  );
}
