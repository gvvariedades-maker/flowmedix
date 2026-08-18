'use client';

import { useMemo, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { ThemeColors } from '../core/themeGenerator';
import {
  EV_STATION_ORDER,
  inferEvStationSlot,
  type EvStationSlot,
} from '@/lib/slides/farmacoClinicoProtocolSlideUtils';
import { cn } from '@/lib/utils';

export interface EvStationConcept {
  icon: string;
  title: string;
  description: string;
}

interface InfusaoEvStationDeckConceptMapProps {
  concepts: EvStationConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

const SLOT_ORDER_INDEX: Record<EvStationSlot, number> = Object.fromEntries(
  EV_STATION_ORDER.map((slot, index) => [slot, index]),
) as Record<EvStationSlot, number>;

/** Pares bolha → caixa — pastéis do print (azul/lilás · pêssego/mostarda). */
const PAIR_TONES = [
  {
    bubble: 'bg-[#D9EDF8] text-slate-800',
    box: 'bg-[#C7C6F1] text-slate-900',
  },
  {
    bubble: 'bg-[#F4E8D7] text-slate-800',
    box: 'bg-[#F0C45C] text-slate-900',
  },
] as const;

const EMPHASIS_RE =
  /\b(não|nao|nunca|sem|certo|errado|sempre|só|so|apenas|bólus|bolus)\b/gi;

function TitleWithEmphasis({ text }: { text: string }) {
  const parts = text.split(EMPHASIS_RE);
  const matches = text.match(EMPHASIS_RE) ?? [];
  if (matches.length === 0) {
    return <>{text}</>;
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
  return <>{nodes}</>;
}

function RedArrow({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 28"
      className={cn('h-5 w-4 shrink-0 text-red-500', className)}
      aria-hidden
    >
      <path
        d="M12 2c0 8-4 12-4 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path d="M5 17l3 7 5-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NotebookDoodles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* caderno — canto SE */}
      <svg className="absolute left-2 top-2 h-10 w-10 text-slate-300/70" viewBox="0 0 48 48" fill="none">
        <rect x="12" y="8" width="26" height="32" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 14h26M12 20h26M12 26h26M12 32h26" stroke="currentColor" strokeWidth="1" opacity="0.7" />
        <circle cx="10" cy="14" r="1.5" fill="currentColor" />
        <circle cx="10" cy="22" r="1.5" fill="currentColor" />
        <circle cx="10" cy="30" r="1.5" fill="currentColor" />
      </svg>
      {/* lápis — canto SD */}
      <svg className="absolute right-2 top-3 h-9 w-9 rotate-12 text-slate-300/70" viewBox="0 0 48 48" fill="none">
        <path d="M14 34l4 4 18-18-4-4L14 34z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M32 16l4 4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M14 34l-2 6 6-2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
      {/* folha — canto ID */}
      <svg className="absolute bottom-10 right-3 h-8 w-8 text-slate-300/50" viewBox="0 0 48 48" fill="none">
        <path
          d="M24 8c6 8 10 14 10 22a10 10 0 11-20 0c0-8 4-14 10-22z"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <path d="M24 18v14" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    </div>
  );
}

/**
 * Estações IBP EV — poster estático estilo “caderno / bolha → caixa”.
 * Sem accordion / clique. JSON alimenta título + detail.
 */
export function InfusaoEvStationDeckConceptMap({
  concepts,
  theme: _theme,
  footerRule,
}: InfusaoEvStationDeckConceptMapProps) {
  const reduceMotion = useReducedMotion();

  const sortedConcepts = useMemo(() => {
    return [...concepts]
      .map((concept, originalIndex) => ({
        concept,
        originalIndex,
        slot: inferEvStationSlot(concept.title, concept.description),
      }))
      .filter(({ concept }) => concept.title.trim() || concept.description.trim())
      .sort(
        (a, b) =>
          (SLOT_ORDER_INDEX[a.slot] ?? 99) - (SLOT_ORDER_INDEX[b.slot] ?? 99) ||
          a.originalIndex - b.originalIndex,
      );
  }, [concepts]);

  if (sortedConcepts.length === 0) return null;

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto">
      {/* fundo caderno quadriculado */}
      <div
        className="absolute inset-0 bg-[#f7f7f5]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(148,163,184,0.22) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(148,163,184,0.22) 1px, transparent 1px)
          `,
          backgroundSize: '18px 18px',
        }}
      />
      <NotebookDoodles />

      <div className="relative z-10 flex flex-col gap-3 px-3 py-3 md:gap-4 md:px-5 md:py-4">
        <header className="text-center">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-violet-700">
            Estações — infusão EV
          </p>
          <h2 className="mt-0.5 font-display text-base font-black uppercase tracking-tight text-slate-900 md:text-lg">
            Protocolo que a <span className="text-red-600">banca</span> cobra
          </h2>
        </header>

        <div className="mx-auto flex w-full max-w-lg flex-col gap-3.5 md:gap-5">
          {sortedConcepts.map(({ concept }, index) => {
            const tone = PAIR_TONES[index % PAIR_TONES.length]!;
            return (
              <motion.section
                key={`${concept.title}-${index}`}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduceMotion ? 0 : index * 0.04 }}
                className="flex flex-col items-center gap-1"
                aria-label={concept.title}
              >
                {/* bolha-título */}
                <div
                  className={cn(
                    'w-[min(100%,22rem)] rounded-full px-4 py-2 text-center shadow-sm ring-1 ring-black/5',
                    tone.bubble,
                  )}
                >
                  <p className="font-display text-sm font-bold leading-snug md:text-base">
                    <TitleWithEmphasis text={concept.title} />
                  </p>
                </div>

                <RedArrow className="h-4 w-3.5" />

                {/* caixa-conteúdo */}
                <div
                  className={cn(
                    'w-full rounded-[1.25rem] px-3.5 py-2.5 text-center shadow-md ring-1 ring-black/5 md:px-5 md:py-3',
                    tone.box,
                  )}
                >
                  <p className="font-body text-xs font-semibold leading-snug md:text-sm">
                    {concept.description}
                  </p>
                </div>
              </motion.section>
            );
          })}
        </div>

        {footerRule ? (
          <div className="mx-auto w-full max-w-lg rounded-[1.35rem] bg-gradient-to-r from-rose-500 to-rose-600 px-4 py-3 text-center shadow-md">
            <p className="font-body text-sm font-bold leading-snug text-white md:text-base">
              {footerRule}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
