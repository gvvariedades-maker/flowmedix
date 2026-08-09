'use client';

import { useMemo, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { DangerZoneItem } from './DangerZone';
import { BoardChrome } from '../primitives';

interface DangerZonePtClassesAdverbCompareProps {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  footerRule?: string;
}

function isTransfer(label: string): boolean {
  return /outra banca|similares|transfer|salve|revise|pegadinha/i.test(label);
}

function renderRich(text: string, accent: string): ReactNode {
  const parts = text.split(/(«[^»]+»|,)/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) => {
    if (part.startsWith('«') && part.endsWith('»')) {
      return (
        <strong key={i} className={`font-black ${accent}`}>
          {part.slice(1, -1)}
        </strong>
      );
    }
    if (part === ',') {
      return (
        <strong key={i} className={`font-black ${accent}`}>
          ,
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

type CompareAxis = 'adverb' | 'prep_artigo' | 'locucao';

function resolveCompareAxis(content: string): CompareAxis {
  const c = content
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  if (/artigo/.test(c) && /preposi/.test(c)) return 'prep_artigo';
  if (/locucao|classe isolada/.test(c)) return 'locucao';
  return 'adverb';
}

const AXIS_COPY: Record<
  CompareAxis,
  { wrongChip: string; rightChip: string; tipLead: ReactNode; tipAsk: ReactNode }
> = {
  adverb: {
    wrongChip: 'Função adjetiva / errada',
    rightChip: 'Função adverbial / certa',
    tipLead: (
      <>
        O <span className="font-black text-emerald-700">advérbio</span> modifica{' '}
        <span className="font-black text-emerald-700">verbo</span>, adjetivo ou outro advérbio —
        não nomeia o substantivo.
      </>
    ),
    tipAsk: (
      <>
        Sempre pergunte: modifica o <span className="font-black text-emerald-700">verbo</span>?
      </>
    ),
  },
  prep_artigo: {
    wrongChip: 'Parece prep / errada',
    rightChip: 'É artigo / certa',
    tipLead: (
      <>
        «A» <span className="font-black text-emerald-700">artigo</span> determina o{' '}
        <span className="font-black text-emerald-700">nome</span>; preposição liga verbo →
        complemento.
      </>
    ),
    tipAsk: (
      <>
        Sempre pergunte: determina o <span className="font-black text-emerald-700">nome</span> ou
        liga o <span className="font-black text-emerald-700">verbo</span>?
      </>
    ),
  },
  locucao: {
    wrongChip: 'Classe isolada / errada',
    rightChip: 'É locução / certa',
    tipLead: (
      <>
        Locução prepositiva = <span className="font-black text-emerald-700">grupo</span> com valor
        de preposição — não classifique a palavra isolada.
      </>
    ),
    tipAsk: (
      <>
        Sempre pergunte: o destaque é <span className="font-black text-emerald-700">grupo</span> +
        complemento?
      </>
    ),
  },
};

/**
 * Arena compare ✗/✓ — gesto PEGADINHA (slide 4).
 * Eixo pelo `content`: Adjetivo×Advérbio · Artigo×Prep · Classe×Locução.
 * Protocolo: detail = visão errada · correct = visão certa · label = chip curto.
 */
export function DangerZonePtClassesAdverbCompare({
  content,
  items,
  theme,
  footerRule,
}: DangerZonePtClassesAdverbCompareProps) {
  const reduceMotion = useReducedMotion();
  const axis = useMemo(() => resolveCompareAxis(content), [content]);
  const copy = AXIS_COPY[axis];
  const { pairs, transfers } = useMemo(() => {
    const mapped = items.map((item, index) => {
      const label = item.label || item.title || `Item ${index + 1}`;
      return {
        label,
        wrong: item.detail || item.description || label,
        right: typeof item.correct === 'string' ? item.correct.trim() : '',
        transfer: isTransfer(label),
      };
    });
    return {
      pairs: mapped.filter((r) => !r.transfer && r.right),
      transfers: mapped.filter((r) => r.transfer),
    };
  }, [items]);

  if (items.length === 0) return null;

  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.28}
      footerRule={footerRule}
      footerLabel="TRANSFERÊNCIA"
      maxWidth="2xl"
      className="gap-3"
    >
      <div className="text-center">
        <h2 className="font-display text-xl font-black uppercase tracking-wide text-slate-900 md:text-2xl">
          {/×|vs|versus/i.test(content) ? (
            content.split(/\s*[×x]\s*|vs\.?|versus/i).map((part, i, arr) => (
              <span key={i}>
                {i === arr.length - 1 ? (
                  <span className="text-emerald-600">{part.trim()}</span>
                ) : (
                  <span>{part.trim()} × </span>
                )}
              </span>
            ))
          ) : (
            <>
              Sempre teste a{' '}
              <span className="text-emerald-600">função</span>
            </>
          )}
        </h2>
        <div className="mx-auto mt-2 h-px w-24 bg-slate-300" />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_1fr]">
        <div>
          <div className="mb-2 flex items-center justify-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500 text-white shadow-sm">
              <X className="h-4 w-4" strokeWidth={3} aria-hidden />
            </span>
            <span className="rounded-full bg-rose-500 px-3 py-1 font-mono text-[10px] font-black uppercase tracking-wider text-white">
              {copy.wrongChip}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {pairs.map((pair, index) => (
              <motion.div
                key={`wrong-${index}`}
                initial={reduceMotion ? false : { opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: reduceMotion ? 0 : Math.min(index * 0.04, 0.2) }}
                className="rounded-xl border-2 border-rose-300 bg-white px-3 py-2.5 shadow-sm"
              >
                <p className="font-mono text-[9px] font-bold uppercase tracking-wide text-rose-600">
                  {pair.label}
                </p>
                <p className="mt-0.5 font-body text-sm font-semibold uppercase leading-snug text-slate-800">
                  {renderRich(pair.wrong, 'text-rose-600')}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="hidden items-center justify-center md:flex" aria-hidden>
          <div className="h-full w-px bg-slate-200" />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
              <Check className="h-4 w-4" strokeWidth={3} aria-hidden />
            </span>
            <span className="rounded-full bg-emerald-500 px-3 py-1 font-mono text-[10px] font-black uppercase tracking-wider text-white">
              {copy.rightChip}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {pairs.map((pair, index) => (
              <motion.div
                key={`right-${index}`}
                initial={reduceMotion ? false : { opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: reduceMotion ? 0 : Math.min(index * 0.04, 0.2) }}
                className="rounded-xl border-2 border-emerald-300 bg-white px-3 py-2.5 shadow-sm"
              >
                <p className="font-mono text-[9px] font-bold uppercase tracking-wide text-emerald-700">
                  {pair.label}
                </p>
                <p className="mt-0.5 font-body text-sm font-semibold uppercase leading-snug text-slate-800">
                  {renderRich(pair.right, 'text-emerald-600')}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50/95 px-3 py-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500 font-display text-2xl font-black text-white shadow-sm">
          ?
        </div>
        <div className="min-w-0">
          <p className="font-body text-sm font-semibold leading-snug text-slate-800">{copy.tipLead}</p>
          <div className="my-2 h-px bg-slate-200" />
          <p className="font-body text-sm font-semibold text-slate-700">{copy.tipAsk}</p>
        </div>
      </div>

      {transfers.map((row, index) => (
        <div
          key={`xfer-${index}`}
          className="rounded-2xl border border-violet-800/40 bg-violet-950 px-4 py-3 text-violet-50 shadow-md"
        >
          <p className="font-display text-sm font-bold">{row.label}</p>
          {row.wrong ? <p className="mt-1 font-body text-sm text-violet-100/90">{row.wrong}</p> : null}
          {row.right ? (
            <p className="mt-1.5 font-body text-sm font-semibold text-amber-200">{row.right}</p>
          ) : null}
        </div>
      ))}
    </BoardChrome>
  );
}
