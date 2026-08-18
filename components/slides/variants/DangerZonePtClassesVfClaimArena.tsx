'use client';

import { useMemo, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeftRight, Check, ShieldAlert, X } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { DangerZoneItem } from './DangerZone';
import { BoardChrome } from '../primitives';

interface DangerZonePtClassesVfClaimArenaProps {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  footerRule?: string;
  chipLabel?: string;
  slideTitle?: string;
}

type TrapRow = {
  key: string;
  letter: string;
  trap: string;
  fix: string;
};

type TransferRow = {
  key: string;
  label: string;
  trap: string;
  fix: string;
};

/** Paleta DZ — distinta dos peões CM/LF/GR (teal/violet/rose/amber). */
const ROW_SKINS = [
  { badge: 'bg-indigo-700', ring: 'ring-indigo-300', wash: 'bg-indigo-50/90' },
  { badge: 'bg-sky-600', ring: 'ring-sky-300', wash: 'bg-sky-50/90' },
  { badge: 'bg-fuchsia-700', ring: 'ring-fuchsia-300', wash: 'bg-fuchsia-50/90' },
  { badge: 'bg-lime-600', ring: 'ring-lime-300', wash: 'bg-lime-50/90' },
] as const;

function isTransfer(label: string): boolean {
  return /outra banca|similares|transfer|salve|revise|pegadinha/i.test(label);
}

function letterFromLabel(label: string): string {
  const m = label.match(/^([A-Ea-e])\b/);
  return m ? m[1]!.toUpperCase() : label.slice(0, 1).toUpperCase();
}

function splitAxis(content: string): [string, string] {
  const parts = content.split(/\s*[×x]\s*|vs\.?|versus/i).map((p) => p.trim());
  if (parts.length >= 2) return [parts[0]!, parts[1]!];
  return ['Parece certo', content || 'Classe vizinha'];
}

function renderRich(text: string, accent: string): ReactNode {
  const parts = text.split(/(«[^»]+»|≠)/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) => {
    if (part.startsWith('«') && part.endsWith('»')) {
      return (
        <strong key={i} className={`font-black ${accent}`}>
          {part.slice(1, -1)}
        </strong>
      );
    }
    if (part === '≠') {
      return (
        <span
          key={i}
          className="mx-0.5 inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-fuchsia-700 px-1.5 font-display text-sm font-black text-white"
        >
          ≠
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

/**
 * Slide 4 vf_multiclasse — arena pegadinha × correção por letra distratora.
 * Protocolo: detail = visão errada · correct = visão certa · label = chip (A–E).
 * Paleta indigo/sky/fuchsia/lime — distinta da família vf-claim 1–3.
 */
export function DangerZonePtClassesVfClaimArena({
  content,
  items,
  theme,
  footerRule,
  slideTitle,
}: DangerZonePtClassesVfClaimArenaProps) {
  const reduceMotion = useReducedMotion();
  const [leftAxis, rightAxis] = useMemo(() => splitAxis(content), [content]);

  const { rows, transfers } = useMemo(() => {
    const mapped: TrapRow[] = [];
    const xfers: TransferRow[] = [];

    items.forEach((item, index) => {
      const label = item.label || item.title || `Item ${index + 1}`;
      const trap = (item.detail || item.description || label).trim();
      const fix = typeof item.correct === 'string' ? item.correct.trim() : '';
      if (isTransfer(label)) {
        xfers.push({ key: `x-${index}`, label, trap, fix });
        return;
      }
      if (!fix) return;
      mapped.push({
        key: `dz-${index}`,
        letter: letterFromLabel(label),
        trap,
        fix,
      });
    });

    return { rows: mapped.slice(0, 4), transfers: xfers };
  }, [items]);

  if (items.length === 0) return null;

  const title = slideTitle || 'CADA LETRA';

  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.16}
      footerRule={undefined}
      maxWidth="2xl"
      className="gap-3"
    >
      <h2 className="text-center font-display text-xl font-black uppercase tracking-wide text-slate-900 md:text-2xl">
        {title.split(/\s+/).map((part, i, arr) => (
          <span key={i}>
            {i === arr.length - 1 ? (
              <span className="text-fuchsia-700">{part}</span>
            ) : (
              <span>{part} </span>
            )}
          </span>
        ))}
      </h2>

      <section className="overflow-hidden rounded-2xl border-2 border-indigo-600 bg-indigo-50 shadow-sm">
        <header className="flex items-center gap-2 bg-indigo-800 px-3 py-2 text-white">
          <ShieldAlert className="h-4 w-4 shrink-0 text-lime-300" aria-hidden />
          <p className="font-display text-sm font-black uppercase tracking-wide">
            {leftAxis} × {rightAxis}
          </p>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2">
          <div className="flex items-center gap-2.5 border-b border-indigo-200 px-3 py-3 sm:border-b-0 sm:border-r">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-fuchsia-600 text-white shadow-sm">
              <X className="h-5 w-5" strokeWidth={3} aria-hidden />
            </span>
            <p className="font-body text-base font-bold leading-snug text-slate-900 md:text-lg">
              Chute pela <span className="rounded bg-fuchsia-200 px-1.5 text-fuchsia-950">forma</span>{' '}
              ou sequência «tudo V/F»
            </p>
          </div>
          <div className="flex items-center gap-2.5 px-3 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-600 text-white shadow-sm">
              <Check className="h-5 w-5" strokeWidth={3} aria-hidden />
            </span>
            <p className="font-body text-base font-bold leading-snug text-slate-900 md:text-lg">
              Teste a <span className="rounded bg-sky-200 px-1.5 text-sky-950">classe</span> de cada
              peão antes do V/F
            </p>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-2.5">
        {rows.map((row, index) => {
          const skin = ROW_SKINS[index % ROW_SKINS.length]!;
          return (
            <motion.article
              key={row.key}
              initial={false}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: reduceMotion ? 0 : Math.min(index * 0.04, 0.16) }}
              className={`overflow-hidden rounded-2xl bg-white shadow-md ring-1 ${skin.ring}`}
            >
              <div className="grid grid-cols-1 items-stretch sm:grid-cols-[3.5rem_1fr_auto_1fr]">
                <div
                  className={`flex items-center justify-center px-2 py-3.5 font-display text-2xl font-black text-white ${skin.badge}`}
                >
                  {row.letter}
                </div>
                <div className={`px-3 py-3.5 ${skin.wash}`}>
                  <p className="font-mono text-xs font-black uppercase tracking-wider text-fuchsia-800">
                    Parece
                  </p>
                  <p className="mt-1.5 font-body text-base font-bold leading-snug text-slate-900 md:text-lg">
                    {renderRich(row.trap, 'text-fuchsia-700')}
                  </p>
                </div>
                <div className="hidden items-center justify-center sm:flex" aria-hidden>
                  <ArrowLeftRight className="h-5 w-5 text-slate-400" />
                </div>
                <div className="border-t border-slate-100 px-3 py-3.5 sm:border-t-0 sm:border-l sm:border-slate-100">
                  <p className="font-mono text-xs font-black uppercase tracking-wider text-sky-800">
                    É
                  </p>
                  <p className="mt-1.5 font-body text-base font-bold leading-snug text-slate-900 md:text-lg">
                    {renderRich(row.fix, 'text-sky-700')}
                  </p>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>

      {transfers.map((row) => (
        <section
          key={row.key}
          className="overflow-hidden rounded-2xl border-2 border-cyan-500 bg-slate-950 shadow-md ring-1 ring-cyan-400/40"
        >
          <header className="flex items-center gap-2 bg-indigo-800 px-3 py-2.5">
            <ArrowLeftRight className="h-5 w-5 text-lime-300" aria-hidden />
            <p className="font-display text-base font-black uppercase tracking-wide text-white md:text-lg">
              {row.label.replace(/…+$/, '')}
            </p>
          </header>
          <div className="space-y-3 px-3 py-4">
            {row.trap ? (
              <p
                className="rounded-xl border-2 border-fuchsia-400/70 bg-fuchsia-950/50 px-3 py-2.5 font-body text-base font-black leading-snug text-white md:text-lg"
                style={{ color: '#ffffff' }}
              >
                {row.trap}
              </p>
            ) : null}
            {row.fix ? (
              <p
                className="rounded-xl border-2 border-lime-400 bg-lime-400 px-3 py-2.5 font-body text-base font-black leading-snug md:text-lg"
                style={{ color: '#0f172a' }}
              >
                {row.fix}
              </p>
            ) : null}
          </div>
        </section>
      ))}

      {footerRule ? (
        <div className="rounded-2xl bg-slate-950 px-3 py-3.5 text-center shadow-md ring-1 ring-cyan-500/30">
          <p className="font-mono text-xs font-black uppercase tracking-widest text-cyan-300">
            Fixação
          </p>
          <p className="mt-1.5 font-display text-base font-black uppercase tracking-wide text-white md:text-lg">
            {footerRule}
          </p>
        </div>
      ) : null}
    </BoardChrome>
  );
}
