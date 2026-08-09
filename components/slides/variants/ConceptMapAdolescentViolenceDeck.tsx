'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';
import { BoardChrome, type BoardTone, boardTone } from '../primitives';
import { cn } from '@/lib/utils';

export interface ViolenceConcept {
  icon: string;
  title: string;
  description: string;
}

interface ConceptMapAdolescentViolenceDeckProps {
  concepts: ViolenceConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

type SlotKind = 'notificacao' | 'rede' | 'acolhimento' | 'pegadinha' | 'geral';

function inferSlot(title: string, detail: string): SlotKind {
  const t = `${title} ${detail}`.toLowerCase();
  if (/^(pegadinha|armadilha)\b/.test(title.trim()) || /banca\s+nega|pegadinha/.test(t)) {
    return 'pegadinha';
  }
  if (/notifica/.test(t)) return 'notificacao';
  if (/rede|tutelar|creas|sinan|articula/.test(t)) return 'rede';
  if (/acolh|proteger|boletim|\bbo\b|cuidar/.test(t)) return 'acolhimento';
  return 'geral';
}

const SLOT_TONE: Record<SlotKind, BoardTone> = {
  notificacao: 'warn',
  rede: 'command',
  acolhimento: 'ok',
  pegadinha: 'exception',
  geral: 'teal',
};

const SLOT_LEFT: Record<SlotKind, string> = {
  notificacao: 'bg-amber-100 text-amber-900 border-amber-300',
  rede: 'bg-sky-100 text-sky-900 border-sky-300',
  acolhimento: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  pegadinha: 'bg-rose-100 text-rose-900 border-rose-300',
  geral: 'bg-slate-100 text-slate-900 border-slate-300',
};

const SLOT_RIGHT: Record<SlotKind, string> = {
  notificacao: 'bg-amber-50/95 border-amber-200',
  rede: 'bg-sky-50/95 border-sky-200',
  acolhimento: 'bg-emerald-50/95 border-emerald-200',
  pegadinha: 'bg-rose-50/95 border-rose-200',
  geral: 'bg-white border-slate-200',
};

/**
 * Slide 1 violência — calendário: faixa de categoria + dual-card (rótulo × detalhe).
 * Cards com massa visual (borda 2, sombra, contraste de fundo).
 */
export function ConceptMapAdolescentViolenceDeck({
  concepts,
  theme,
  footerRule,
}: ConceptMapAdolescentViolenceDeckProps) {
  const reduceMotion = useReducedMotion();

  const rows = useMemo(() => {
    const mapped = concepts.map((c, index) => {
      const slot = inferSlot(c.title, c.description);
      return {
        key: `${c.title}-${index}`,
        title: c.title,
        detail: c.description,
        slot,
        tone: SLOT_TONE[slot],
        left: SLOT_LEFT[slot],
        right: SLOT_RIGHT[slot],
        trap: slot === 'pegadinha',
        icon: resolveLucideIcon(c.icon) ?? resolveLucideIcon('Shield'),
      };
    });
    const traps = mapped.filter((r) => r.trap);
    const rest = mapped.filter((r) => !r.trap);
    return [...rest, ...traps.slice(0, 1)];
  }, [concepts]);

  if (concepts.length === 0) return null;

  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.3}
      eyebrow="Violência sexual — rede de proteção"
      title="Notificar · acolher · articular · não cair na pegadinha"
      footerLabel="Transferência de prova"
      footerRule={footerRule}
      maxWidth="lg"
    >
      <div className="flex flex-col gap-4">
        {rows.map((row, index) => {
          const Icon = row.icon;
          const t = boardTone(row.tone);
          return (
            <motion.section
              key={row.key}
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduceMotion ? 0 : index * 0.045 }}
              className="flex flex-col gap-2.5"
            >
              {/* Faixa de categoria — modelo calendário vacinação */}
              <div
                className={cn(
                  'flex items-center gap-2.5 rounded-full px-3 py-2 shadow-md',
                  t.badge,
                  t.badgeText,
                  row.trap && 'ring-2 ring-rose-400/60 ring-offset-2 ring-offset-transparent',
                )}
              >
                <span className="-ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/25 ring-2 ring-white/50 shadow-sm">
                  {Icon ? <Icon className="h-5 w-5" aria-hidden /> : null}
                </span>
                <p className="font-display text-sm font-black uppercase tracking-wide md:text-[15px]">
                  {row.title}
                </p>
              </div>

              {/* Dual-card: rótulo compacto + detalhe com massa */}
              <div className="grid grid-cols-[7.5rem_1fr] gap-2.5 sm:grid-cols-[8.5rem_1fr]">
                <div
                  className={cn(
                    'flex min-h-[5.5rem] flex-col items-center justify-center rounded-2xl border-2 px-2 py-3 text-center shadow-md',
                    row.left,
                  )}
                >
                  {Icon ? <Icon className="mb-1.5 h-6 w-6 opacity-90" aria-hidden /> : null}
                  <p className="font-display text-[11px] font-black uppercase leading-tight tracking-wide">
                    {row.title}
                  </p>
                </div>
                <div
                  className={cn(
                    'flex min-h-[5.5rem] flex-col justify-center rounded-2xl border-2 px-3.5 py-3 shadow-md',
                    row.right,
                    row.trap && 'ring-2 ring-rose-300/70',
                  )}
                >
                  <p
                    className={cn(
                      'font-body text-sm leading-snug text-slate-900',
                      row.trap ? 'font-bold' : 'font-semibold',
                    )}
                  >
                    {row.detail}
                  </p>
                  {row.trap ? (
                    <p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-widest text-rose-700">
                      Banca testa isto
                    </p>
                  ) : null}
                </div>
              </div>
            </motion.section>
          );
        })}
      </div>
    </BoardChrome>
  );
}
