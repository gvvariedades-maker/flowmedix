'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';
import { inferZBandId, type ZBandId } from '@/lib/slides/adolescentAntropometriaSlideUtils';
import { BoardChrome } from '../primitives';
import { cn } from '@/lib/utils';

interface GoldenRuleAdolescentZBandBoardProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

type PillTone = {
  header: string;
  value: string;
  ring?: string;
};

const PILL_TONES: Record<string, PillTone> = {
  violet: {
    header: 'bg-violet-600 text-white',
    value: 'text-violet-700',
  },
  sky: {
    header: 'bg-sky-500 text-white',
    value: 'text-sky-700',
  },
  orange: {
    header: 'bg-orange-500 text-white',
    value: 'text-orange-700',
  },
  emerald: {
    header: 'bg-emerald-600 text-white',
    value: 'text-emerald-700',
  },
  blue: {
    header: 'bg-blue-600 text-white',
    value: 'text-blue-700',
  },
  amber: {
    header: 'bg-amber-500 text-amber-950',
    value: 'text-amber-800',
  },
  rose: {
    header: 'bg-rose-600 text-white',
    value: 'text-rose-700',
  },
};

const BAND_PILL: Record<ZBandId, keyof typeof PILL_TONES> = {
  magreza_acentuada: 'violet',
  magreza: 'sky',
  eutrofia: 'emerald',
  sobrepeso: 'orange',
  obesidade: 'blue',
  obesidade_grave: 'amber',
  estatura_baixa: 'rose',
  general: 'sky',
};

/** Pares adjacentes que a banca troca (±1 DP) — gesto ≠ do print. */
const CONFUSION_PAIRS: ReadonlyArray<readonly [ZBandId, ZBandId]> = [
  ['magreza_acentuada', 'magreza'],
  ['eutrofia', 'sobrepeso'],
  ['obesidade', 'obesidade_grave'],
];

type EnrichedRow = {
  row: GoldenRuleRow;
  band: ZBandId;
  highlighted: boolean;
};

function BandPill({
  label,
  value,
  toneKey,
  emphasized,
}: {
  label: string;
  value: string;
  toneKey: keyof typeof PILL_TONES;
  emphasized?: boolean;
}) {
  const tone = PILL_TONES[toneKey];
  return (
    <div
      className={cn(
        'flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl bg-white shadow-md shadow-slate-900/10',
        emphasized && 'ring-2 ring-orange-400/70 ring-offset-2 ring-offset-white',
      )}
    >
      <div className={cn('px-3 py-2.5 text-center', tone.header)}>
        <p className="font-display text-[11px] font-black uppercase leading-tight tracking-wide md:text-xs">
          {label}
        </p>
      </div>
      <div className="border border-t-0 border-slate-200/80 px-3 py-2 text-center">
        <p className={cn('font-mono text-xs font-bold tabular-nums md:text-sm', tone.value)}>
          {value}
        </p>
      </div>
    </div>
  );
}

function TitleWithAccent({ text }: { text: string }) {
  const parts = text.split(
    /(ESCORE Z|SIMILARES|DIFERENTES|FAIXAS|CADERNETA|SENTIDOS|IMC|\+1|\+2)/i,
  );
  return (
    <span>
      {parts.map((part, i) =>
        /^(ESCORE Z|SIMILARES|DIFERENTES|FAIXAS|CADERNETA|SENTIDOS|IMC|\+1|\+2)$/i.test(
          part,
        ) ? (
          <span key={i} className="font-black text-rose-600">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </span>
  );
}

/**
 * Faixas Z — pares ≠ (faixas vizinhas que a banca troca).
 * Estilo resumo premium: pill cor + definição; sem cliques.
 */
export function GoldenRuleAdolescentZBandBoard({
  content,
  rows,
  theme,
  footerRule,
}: GoldenRuleAdolescentZBandBoardProps) {
  const reduceMotion = useReducedMotion();

  const { pairs, leftovers, title } = useMemo(() => {
    const enriched: EnrichedRow[] = rows.map((row) => ({
      row,
      band: inferZBandId(row.label ?? '', row.value ?? ''),
      highlighted: row.emphasis === 'highlight',
    }));

    const byBand = new Map<ZBandId, EnrichedRow>();
    for (const item of enriched) {
      if (!byBand.has(item.band) || item.highlighted) {
        byBand.set(item.band, item);
      }
    }

    const used = new Set<ZBandId>();
    const pairs: { left: EnrichedRow; right: EnrichedRow; hero: boolean }[] = [];

    for (const [leftId, rightId] of CONFUSION_PAIRS) {
      const left = byBand.get(leftId);
      const right = byBand.get(rightId);
      if (!left || !right) continue;
      pairs.push({
        left,
        right,
        hero: left.highlighted || right.highlighted,
      });
      used.add(leftId);
      used.add(rightId);
    }

    const leftovers = enriched.filter((e) => !used.has(e.band));

    const title =
      content?.trim() ||
      'Faixas similares no trilho Z, mas com sentidos diferentes';

    return { pairs, leftovers, title };
  }, [rows, content]);

  if (rows.length === 0) return null;

  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.22}
      maxWidth="lg"
      footerLabel="Decore"
      footerRule={footerRule}
    >
      <div className="rounded-2xl border border-slate-200/90 bg-white px-4 py-3 text-center shadow-md shadow-slate-900/5">
        <p className="font-body text-sm font-bold uppercase leading-snug tracking-wide text-slate-800 md:text-[15px]">
          <TitleWithAccent text={title} />
        </p>
        <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
          Caderneta · IMC 5–19 anos · pares que a banca desloca
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {pairs.map(({ left, right, hero }, index) => (
          <motion.div
            key={`${left.band}-${right.band}`}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduceMotion ? 0 : index * 0.05 }}
            className="flex items-stretch gap-2 sm:gap-3"
          >
            <BandPill
              label={left.row.label ?? left.band}
              value={left.row.value ?? ''}
              toneKey={BAND_PILL[left.band]}
              emphasized={hero && left.highlighted}
            />
            <div className="flex shrink-0 items-center justify-center px-0.5">
              <span
                className="font-display text-2xl font-black text-slate-400 md:text-3xl"
                aria-label="diferente de"
              >
                ≠
              </span>
            </div>
            <BandPill
              label={right.row.label ?? right.band}
              value={right.row.value ?? ''}
              toneKey={BAND_PILL[right.band]}
              emphasized={hero && right.highlighted}
            />
          </motion.div>
        ))}
      </div>

      {leftovers.length > 0 ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          {leftovers.map((item) => (
            <BandPill
              key={item.band}
              label={item.row.label ?? item.band}
              value={item.row.value ?? ''}
              toneKey={BAND_PILL[item.band]}
              emphasized={item.highlighted}
            />
          ))}
        </div>
      ) : null}
    </BoardChrome>
  );
}
