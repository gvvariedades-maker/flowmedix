'use client';

import { useMemo, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeftRight,
  ArrowRight,
  Check,
  MessageCircle,
  Plus,
  X,
  type LucideIcon,
} from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { DangerZoneItem } from './DangerZone';
import { BoardChrome } from '../primitives';

interface DangerZonePtClassesSwapArenaProps {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  footerRule?: string;
}

type RowSkin = {
  row: string;
  badge: string;
  badgeText: string;
  accent: string;
  check: string;
  Icon: LucideIcon;
};

const SKINS: RowSkin[] = [
  {
    row: 'bg-emerald-100/95',
    badge: 'bg-emerald-500',
    badgeText: 'text-white',
    accent: 'text-emerald-800',
    check: 'text-emerald-600',
    Icon: Plus,
  },
  {
    row: 'bg-orange-100/95',
    badge: 'bg-orange-500',
    badgeText: 'text-white',
    accent: 'text-orange-800',
    check: 'text-orange-600',
    Icon: X,
  },
  {
    row: 'bg-amber-100/95',
    badge: 'bg-amber-400',
    badgeText: 'text-amber-950',
    accent: 'text-amber-900',
    check: 'text-amber-600',
    Icon: ArrowLeftRight,
  },
  {
    row: 'bg-sky-100/95',
    badge: 'bg-sky-500',
    badgeText: 'text-white',
    accent: 'text-sky-900',
    check: 'text-sky-600',
    Icon: ArrowRight,
  },
  {
    row: 'bg-violet-100/95',
    badge: 'bg-violet-500',
    badgeText: 'text-white',
    accent: 'text-violet-900',
    check: 'text-violet-600',
    Icon: MessageCircle,
  },
];

function skinFor(label: string, index: number): RowSkin {
  const l = label.toLowerCase();
  if (/aditiv/.test(l)) return SKINS[0];
  if (/advers/.test(l)) return SKINS[1];
  if (/altern/.test(l)) return SKINS[2];
  if (/conclus/.test(l)) return SKINS[3];
  if (/explic/.test(l)) return SKINS[4];
  if (/concess|condicion|causal/.test(l)) return SKINS[index % SKINS.length];
  return SKINS[index % SKINS.length];
}

function isTransfer(label: string): boolean {
  return /outra banca|similares|transfer|salve|revise/i.test(label);
}

/** Destaca «…» ou a 1ª peça da coluna Conjunções no exemplo. */
function renderExample(text: string, pieces: string, accentClass: string): ReactNode {
  const marked = text.split(/(«[^»]+»)/g);
  if (marked.length > 1) {
    return marked.map((part, i) => {
      if (part.startsWith('«') && part.endsWith('»')) {
        return (
          <strong key={i} className={`font-black ${accentClass}`}>
            {part.slice(1, -1)}
          </strong>
        );
      }
      return <span key={i}>{part}</span>;
    });
  }

  const firstPiece = pieces
    .split(/[,;]/)[0]
    ?.replace(/\([^)]*\)/g, '')
    .trim();
  if (firstPiece && firstPiece.length >= 2) {
    const re = new RegExp(`(${firstPiece.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'i');
    const m = text.split(re);
    if (m.length > 1) {
      return m.map((part, i) =>
        re.test(part) ? (
          <strong key={i} className={`font-black ${accentClass}`}>
            {part}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        ),
      );
    }
  }
  return text;
}

/**
 * Tabela prática Classificação × Conjunções × Exemplo — gesto CLASSIFICAR (slide 4).
 * Inspiração: tabela colorida de coordenativas; sem CTA/watermark de feed.
 * JSON: label=classificação · detail=peças · correct=exemplo.
 */
export function DangerZonePtClassesSwapArena({
  content,
  items,
  theme,
  footerRule,
}: DangerZonePtClassesSwapArenaProps) {
  const reduceMotion = useReducedMotion();
  const { rows, transfers } = useMemo(() => {
    const mapped = items.map((item, index) => {
      const label = item.label || item.title || `Item ${index + 1}`;
      return {
        label,
        pieces: item.detail || item.description || '',
        example: typeof item.correct === 'string' ? item.correct.trim() : '',
        transfer: isTransfer(label),
        skin: skinFor(label, index),
      };
    });
    return {
      rows: mapped.filter((r) => !r.transfer),
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
      {/* Título outdoor + subtítulo (gesto do print) */}
      <div className="text-center">
        <h2 className="font-display text-xl font-black uppercase tracking-wide text-slate-900 md:text-2xl">
          {content || 'Conjunções'}
        </h2>
        <div className="mx-auto mt-2 inline-flex max-w-full items-center gap-2 rounded-xl border-2 border-slate-800/80 bg-white px-3 py-1.5 shadow-sm">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-violet-600 text-[11px] font-black text-white">
            ≡
          </span>
          <p className="font-body text-xs font-semibold text-slate-700 md:text-sm">
            Tabela prática para revisar e nunca mais esquecer
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border-2 border-slate-800/80 bg-white shadow-md">
        {/* Cabeçalho navy — 3 colunas (gesto do print) */}
        <div className="grid grid-cols-[7.25rem_minmax(0,1fr)_minmax(0,1.15fr)] bg-slate-900 text-white md:grid-cols-[8.5rem_minmax(0,1.1fr)_minmax(0,1.25fr)]">
          {['Classificação', 'Conjunções', 'Exemplo'].map((h) => (
            <div
              key={h}
              className="border-r border-white/10 px-1.5 py-2 text-center font-mono text-[9px] font-bold uppercase tracking-wider last:border-r-0 md:px-3 md:text-[11px] md:tracking-widest"
            >
              {h}
            </div>
          ))}
        </div>

        <div className="divide-y divide-slate-800/10">
          {rows.map((row, index) => {
            const { skin } = row;
            const Icon = skin.Icon;
            return (
              <motion.div
                key={`pt-classes-table-${index}`}
                initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduceMotion ? 0 : Math.min(index * 0.03, 0.18) }}
                className={`grid grid-cols-[7.25rem_minmax(0,1fr)_minmax(0,1.15fr)] items-center gap-1.5 px-1.5 py-2 md:grid-cols-[8.5rem_minmax(0,1.1fr)_minmax(0,1.25fr)] md:gap-2.5 md:px-3 md:py-2.5 ${skin.row}`}
              >
                <div className="flex min-w-0 items-center gap-1.5 md:gap-2">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-sm md:h-9 md:w-9 ${skin.badge} ${skin.badgeText}`}
                  >
                    <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" strokeWidth={2.75} aria-hidden />
                  </span>
                  <p
                    className={`truncate font-display text-[11px] font-black uppercase tracking-wide md:text-sm ${skin.accent}`}
                  >
                    {row.label}
                  </p>
                </div>
                <p className="min-w-0 font-body text-[11px] font-semibold leading-snug text-slate-900 md:text-sm">
                  {row.pieces}
                </p>
                <div className="flex min-w-0 items-start gap-1 md:gap-1.5">
                  <Check
                    className={`mt-0.5 h-3.5 w-3.5 shrink-0 md:h-4 md:w-4 ${skin.check}`}
                    strokeWidth={3}
                    aria-hidden
                  />
                  <p className="min-w-0 font-body text-[11px] leading-snug text-slate-800 md:text-sm">
                    {row.example
                      ? renderExample(row.example, row.pieces, skin.accent)
                      : '—'}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {transfers.map((row, index) => (
        <div
          key={`pt-classes-xfer-${index}`}
          className="rounded-2xl border border-violet-800/40 bg-violet-950 px-4 py-3 text-violet-50 shadow-md"
        >
          <p className="font-display text-sm font-bold">{row.label}</p>
          {row.pieces ? <p className="mt-1 font-body text-sm text-violet-100/90">{row.pieces}</p> : null}
          {row.example ? (
            <p className="mt-1.5 font-body text-sm font-semibold text-amber-200">{row.example}</p>
          ) : null}
        </div>
      ))}
    </BoardChrome>
  );
}
