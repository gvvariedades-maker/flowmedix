'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';
import {
  inferZRailSlot,
  zBandHighlightedMarkers,
  Z_RAIL_MARKERS,
  type ZRailSlot,
} from '@/lib/slides/adolescentAntropometriaSlideUtils';
import { BoardChrome, LabelBodyRow, type BoardTone } from '../primitives';

export interface GrowthZRailConcept {
  icon: string;
  title: string;
  description: string;
}

const SLOT_TONE: Record<ZRailSlot, BoardTone> = {
  tool: 'command',
  metric: 'teal',
  band_overweight: 'warn',
  action: 'ok',
  band_severe_low: 'warn',
  band_severe_high: 'exception',
  pegadinha: 'exception',
  general: 'neutral',
};

function isTrapConcept(c: GrowthZRailConcept): boolean {
  return /^(pegadinha|armadilha)\b/i.test(c.title.trim());
}

function isHeroBand(slot: ZRailSlot): boolean {
  return slot === 'band_overweight';
}

/** Extrai âncora tipográfica da faixa (+1 a +2) sem hardcode de gabarito. */
function extractBandAnchor(text: string): string | null {
  const normalized = text.replace(/−/g, '-');
  const between = normalized.match(/([+-]?\d+)\s*(?:a|e|e\s+|\u2013|\u2014|-)\s*([+-]?\d+)/i);
  if (between) {
    const a = Number(between[1]);
    const b = Number(between[2]);
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    const fmt = (n: number) => (n > 0 ? `+${n}` : `${n}`);
    return `${fmt(lo)} a ${fmt(hi)}`;
  }
  if (/\+1/.test(normalized) && /\+2/.test(normalized)) return '+1 a +2';
  return null;
}

interface AdolescentGrowthZRailConceptMapProps {
  concepts: GrowthZRailConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

/**
 * Terreno Z — trilho Caderneta + herói da faixa cobrada + trilho label×corpo.
 * Sem cliques; pegadinha por último; footer = transferência.
 */
export function AdolescentGrowthZRailConceptMap({
  concepts,
  theme,
  footerRule,
}: AdolescentGrowthZRailConceptMapProps) {
  const reduceMotion = useReducedMotion();

  const { hero, rows, railMarkers, heroAnchor } = useMemo(() => {
    const mapped = concepts.map((c, index) => {
      const slot = inferZRailSlot(c.title, c.description);
      const trap = isTrapConcept(c) || slot === 'pegadinha';
      const hero = !trap && isHeroBand(slot);
      return {
        key: `${c.title}-${index}`,
        title: c.title,
        detail: c.description,
        slot,
        trap,
        hero,
        tone: (trap ? 'exception' : SLOT_TONE[slot]) as BoardTone,
        icon: resolveLucideIcon(c.icon) ?? resolveLucideIcon('Activity'),
        anchor: extractBandAnchor(`${c.title} ${c.description}`),
      };
    });

    const heroRow = mapped.find((r) => r.hero) ?? null;
    const traps = mapped.filter((r) => r.trap);
    const rest = mapped.filter((r) => !r.hero && !r.trap);
    const ordered = [...rest, ...traps.slice(0, 1)];

    const markers = heroRow
      ? zBandHighlightedMarkers('sobrepeso', `${heroRow.title} ${heroRow.detail}`)
      : new Set<number>([0]);

    return {
      hero: heroRow,
      rows: ordered,
      railMarkers: markers,
      heroAnchor: heroRow?.anchor ?? extractBandAnchor(footerRule ?? '') ?? null,
    };
  }, [concepts, footerRule]);

  if (concepts.length === 0) return null;

  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.32}
      eyebrow="Caderneta — escore Z (5–19 anos)"
      title="Classificar no trilho — faixa certa da prova"
      footerLabel="Transferência de prova"
      footerRule={footerRule}
      maxWidth="lg"
    >
      {/* Trilho Z — herói espacial: faixa cobrada acesa */}
      <div className="rounded-2xl border-2 border-sky-300/90 bg-white/95 px-3 py-3 shadow-md">
        <p className="mb-2 text-center font-mono text-[10px] font-bold uppercase tracking-widest text-sky-800">
          Trilho Z · IMC
        </p>
        <div className="relative flex items-center justify-between gap-0.5">
          <div
            className="pointer-events-none absolute left-1 right-1 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-rose-400 via-amber-300 via-40% to-sky-400"
            aria-hidden
          />
          {Z_RAIL_MARKERS.map((marker) => {
            const lit = railMarkers.has(marker);
            return (
              <div
                key={marker}
                className={`relative z-10 flex h-10 min-w-[2.4rem] flex-col items-center justify-center rounded-xl border-2 bg-white shadow-sm transition-all ${
                  lit
                    ? 'scale-105 border-amber-500 ring-2 ring-amber-300/70'
                    : 'border-slate-200 opacity-70'
                }`}
              >
                <span
                  className={`font-mono text-[11px] font-black tabular-nums ${
                    lit ? 'text-amber-950' : 'text-slate-700'
                  }`}
                >
                  {marker > 0 ? `+${marker}` : marker}
                </span>
              </div>
            );
          })}
        </div>
        {heroAnchor ? (
          <p className="mt-2 text-center font-mono text-[10px] font-bold uppercase tracking-wide text-amber-800">
            Faixa cobrada · {heroAnchor}
          </p>
        ) : null}
      </div>

      {/* Herói pedagógico — número outdoor da Caderneta */}
      {hero ? (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-2xl border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-amber-100/90 p-4 shadow-lg shadow-amber-500/15 ring-2 ring-amber-300/50 ring-offset-2 ring-offset-white"
        >
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-amber-800">
            Âncora · {hero.title}
          </p>
          {heroAnchor ? (
            <p className="mt-1 font-display text-3xl font-black tabular-nums tracking-tight text-amber-950 md:text-4xl">
              {heroAnchor}
            </p>
          ) : null}
          <p className="mt-2 font-body text-sm font-semibold leading-snug text-amber-950">
            {hero.detail}
          </p>
        </motion.div>
      ) : null}

      <div className="flex flex-col gap-2.5">
        {rows.map((row, index) => {
          const Icon = row.icon;
          return (
            <motion.div
              key={row.key}
              initial={reduceMotion ? false : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: reduceMotion ? 0 : index * 0.04 }}
            >
              <LabelBodyRow
                layout="rail"
                chip={row.title}
                body={row.detail}
                tone={row.tone}
                icon={Icon ?? undefined}
                bodyStrong={row.trap}
                emphasized={row.trap}
                hint={
                  row.trap ? (
                    <span className="font-bold uppercase tracking-wide text-rose-700">
                      Banca testa isto
                    </span>
                  ) : undefined
                }
              />
            </motion.div>
          );
        })}
      </div>
    </BoardChrome>
  );
}
