'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Droplets } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { SlideLucideIcon } from '../core/SlideLucideIcon';
import { BoardChrome } from '../primitives';
import { cn } from '@/lib/utils';

export interface PkPdConcept {
  icon: string;
  title: string;
  description: string;
}

interface AdmeJourneyRailConceptMapProps {
  concepts: PkPdConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

const ADME_PHASES = [
  { letter: 'A', label: 'Absorção' },
  { letter: 'D', label: 'Distribuição' },
  { letter: 'M', label: 'Metabolismo' },
  { letter: 'E', label: 'Excreção' },
] as const;

/** Paleta por bloco — inspira seções numeradas do print (sem 3D/feed). */
const CARD_TONES = [
  {
    box: 'border-teal-500 bg-teal-50/90',
    badge: 'bg-teal-600',
    title: 'text-teal-800',
    bullet: 'bg-teal-500',
    ink: 'text-teal-950',
  },
  {
    box: 'border-violet-500 bg-violet-50/90',
    badge: 'bg-violet-600',
    title: 'text-violet-800',
    bullet: 'bg-violet-500',
    ink: 'text-violet-950',
  },
  {
    box: 'border-orange-500 bg-orange-50/90',
    badge: 'bg-orange-500',
    title: 'text-orange-800',
    bullet: 'bg-orange-500',
    ink: 'text-orange-950',
  },
  {
    box: 'border-rose-400 bg-rose-50/90',
    badge: 'bg-rose-500',
    title: 'text-rose-800',
    bullet: 'bg-rose-500',
    ink: 'text-rose-950',
  },
] as const;

function splitBullets(description: string): string[] {
  const raw = description.replace(/\s+/g, ' ').trim();
  if (!raw) return [];
  if (/[—–-]/.test(raw) && raw.includes('→')) {
    // "ADME: A → D → M → E — resto" → keep as one + optional rest after em dash
    const parts = raw.split(/\s*[—–]\s*/);
    return parts.map((p) => p.trim()).filter(Boolean);
  }
  if (raw.includes('·')) {
    return raw.split('·').map((p) => p.trim()).filter(Boolean);
  }
  return [raw];
}

function mentionsAdme(text: string): boolean {
  return /\badme\b/i.test(text);
}

/**
 * Terreno PK/PD — poster estático (blocos numerados estilo infográfico).
 * Sem lentes / tap. JSON alimenta título + detail; 0 hardcode de gabarito.
 */
export const AdmeJourneyRailConceptMap = ({
  concepts,
  theme,
  footerRule,
}: AdmeJourneyRailConceptMapProps) => {
  const reduceMotion = useReducedMotion();

  const { cards, showAdmeStrip, closingLine } = useMemo(() => {
    const list = concepts.filter((c) => c.title.trim() || c.description.trim());
    const adme = list.some((c) => mentionsAdme(`${c.title} ${c.description}`));
    return {
      cards: list,
      showAdmeStrip: adme,
      closingLine: footerRule?.trim() || '',
    };
  }, [concepts, footerRule]);

  if (cards.length === 0) return null;

  return (
    <BoardChrome theme={theme} washOpacity={0.12} maxWidth="2xl" footerRule={undefined}>
      {/* Faixa de contexto — sem CTA de toque */}
      <div className="text-center">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">
          Trilho PK → PD
        </p>
        <h2 className="mt-1 font-display text-lg font-black uppercase tracking-tight text-slate-900 md:text-xl">
          <span className="text-teal-700">Terreno</span>{' '}
          <span className="text-rose-600">PK/PD</span>
        </h2>
        <p className="mt-1 font-body text-xs font-semibold text-slate-600 md:text-sm">
          Cinética processa · dinâmica age · meia-vida cai 50%
        </p>
      </div>

      {/* Blocos 1…n — tudo aberto */}
      <div className="flex flex-col gap-3">
        {cards.map((concept, index) => {
          const tone = CARD_TONES[index % CARD_TONES.length]!;
          const bullets = splitBullets(concept.description);
          const n = index + 1;

          return (
            <motion.section
              key={`${concept.title}-${index}`}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduceMotion ? 0 : index * 0.04 }}
              className={cn(
                'relative rounded-3xl border-[3px] bg-white p-3 pt-4 shadow-md md:p-4 md:pt-5',
                tone.box,
              )}
              aria-label={`${n}. ${concept.title}`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-base font-black text-white shadow-sm ring-2 ring-white',
                    tone.badge,
                  )}
                >
                  {n}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3
                      className={cn(
                        'font-display text-sm font-black uppercase tracking-wide md:text-base',
                        tone.title,
                      )}
                    >
                      {concept.title}
                    </h3>
                    {concept.icon ? (
                      <span
                        className={cn(
                          'inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/90 shadow-sm ring-1 ring-black/5',
                          tone.title,
                        )}
                      >
                        <SlideLucideIcon name={concept.icon} className="h-4 w-4" />
                      </span>
                    ) : null}
                  </div>

                  <ul className="mt-2.5 flex flex-col gap-1.5">
                    {bullets.map((line, bi) => (
                      <li key={bi} className="flex items-start gap-2">
                        <span
                          className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', tone.bullet)}
                          aria-hidden
                        />
                        <p
                          className={cn(
                            'font-body text-xs font-semibold leading-snug md:text-sm',
                            tone.ink,
                          )}
                        >
                          {line}
                        </p>
                      </li>
                    ))}
                  </ul>

                  {/* Ícones de reforço estilo “gota + escudo” — só no 1º bloco ADME */}
                  {index === 0 && showAdmeStrip ? (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-sm">
                        <Droplets className="h-4 w-4" aria-hidden />
                      </span>
                      <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-sm">
                        <Check className="h-4 w-4" strokeWidth={3} aria-hidden />
                      </span>
                      <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-teal-800">
                        Corpo processa o fármaco
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            </motion.section>
          );
        })}
      </div>

      {/* Chips ADME compactos — só letras (detalhe das fases fica no golden_rule) */}
      {showAdmeStrip ? (
        <ol className="grid grid-cols-4 gap-1.5" aria-label="Fases ADME">
          {ADME_PHASES.map((phase) => (
            <li
              key={phase.letter}
              className="flex flex-col items-center rounded-2xl border-2 border-teal-400 bg-white px-1 py-2 text-center shadow-sm"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-600 font-display text-xs font-black text-white">
                {phase.letter}
              </span>
              <span className="mt-0.5 font-body text-[9px] font-bold uppercase leading-tight text-teal-900">
                {phase.label}
              </span>
            </li>
          ))}
        </ol>
      ) : null}

      {/* Faixa de fechamento — coral do print, sem @/CTA de feed */}
      {closingLine ? (
        <div className="rounded-3xl bg-gradient-to-r from-rose-500 to-rose-600 px-4 py-3 text-center shadow-md">
          <p className="font-body text-sm font-bold leading-snug text-white md:text-base">
            {closingLine}
          </p>
        </div>
      ) : null}
    </BoardChrome>
  );
};
