'use client';

import { useMemo, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeftRight, Brain, Check, Scale, X } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { DangerZoneItem } from './DangerZone';
import { BoardChrome } from '../primitives';

interface DangerZonePtClassesExcetoTipBoardProps {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  footerRule?: string;
}

type PairRow = {
  key: string;
  letter: string;
  wrong: string;
  right: string;
  exception: boolean;
};

const PASTEL = [
  { panel: 'bg-violet-100', badge: 'bg-violet-700', ring: 'ring-violet-400' },
  { panel: 'bg-amber-100', badge: 'bg-amber-600', ring: 'ring-amber-400' },
  { panel: 'bg-rose-100', badge: 'bg-rose-700', ring: 'ring-rose-500' },
] as const;

function isTransfer(label: string): boolean {
  return /outra banca|similares|transfer|salve|revise|pegadinha/i.test(label);
}

function letterFromLabel(label: string): string {
  const m = label.match(/^([A-Ea-e])\b/);
  return m ? m[1]!.toUpperCase() : '';
}

function isExceptionRight(right: string): boolean {
  return /exce[cç]|n[uú]cleo|nomeia|incorreto|par[eê]ntese erra/i.test(right);
}

/** Destaque «…» — chip sólido com ink escuro forçado (inline). */
function renderRich(
  text: string,
  mode: 'light-trap' | 'light-ok' | 'dark',
): ReactNode {
  const parts = text.split(/(«[^»]+»)/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) => {
    if (part.startsWith('«') && part.endsWith('»')) {
      const word = part.slice(1, -1);
      const bg =
        mode === 'dark' ? '#fbbf24' : mode === 'light-ok' ? '#a7f3d0' : '#fecdd3';
      return (
        <span
          key={i}
          className="mx-0.5 inline-block rounded-md px-1.5 py-0.5 font-black"
          style={{ backgroundColor: bg, color: '#0f172a' }}
        >
          {word}
        </span>
      );
    }
    return (
      <span key={i} style={{ color: '#0f172a' }}>
        {part}
      </span>
    );
  });
}

function splitAxis(content: string): [string, string] {
  const parts = content.split(/\s*[×x]\s*|vs\.?|versus/i).map((p) => p.trim());
  if (parts.length >= 2) return [parts[0]!, parts[1]!];
  return ['Parece errado', content || 'É a classe certa'];
}

function groupKeeps(keeps: PairRow[]): PairRow[] {
  if (keeps.length <= 3) return keeps;
  const grouped: PairRow[] = [];
  const nonExc = keeps.filter((k) => !k.exception);
  const exc = keeps.filter((k) => k.exception);

  for (let i = 0; i < nonExc.length; i += 2) {
    const a = nonExc[i]!;
    const b = nonExc[i + 1];
    if (!b) {
      grouped.push(a);
      continue;
    }
    const letters = [a.letter, b.letter].filter(Boolean).join('·');
    grouped.push({
      key: `g-${letters}`,
      letter: letters || String(grouped.length + 1),
      wrong: `${a.wrong.replace(/\.$/, '')} · ${b.wrong}`,
      right: `${a.right.replace(/\.$/, '')} · ${b.right}`,
      exception: false,
    });
  }
  grouped.push(...exc);
  return grouped.slice(0, 3);
}

/**
 * Slide 4 EXCETO — contraste WCAG + tipografia TE-legível.
 */
export function DangerZonePtClassesExcetoTipBoard({
  content,
  items,
  theme,
  footerRule,
}: DangerZonePtClassesExcetoTipBoardProps) {
  const reduceMotion = useReducedMotion();
  const [leftAxis, rightAxis] = useMemo(() => splitAxis(content), [content]);

  const valorMode = useMemo(() => {
    const corpus = [
      content,
      ...items.map((i) => `${i.label || ''} ${i.detail || ''} ${i.correct || ''}`),
    ].join(' ');
    return /valor|causal|explicat|advers|comparat|incorreto|par[eê]ntese/i.test(corpus);
  }, [content, items]);

  const { pairs, transfers } = useMemo(() => {
    const mapped: PairRow[] = [];
    const xfers: Array<{ key: string; label: string; wrong: string; right: string }> = [];

    items.forEach((item, index) => {
      const label = item.label || item.title || `Item ${index + 1}`;
      const wrong = item.detail || item.description || label;
      const right = typeof item.correct === 'string' ? item.correct.trim() : '';
      if (isTransfer(label)) {
        xfers.push({ key: `x-${index}`, label, wrong, right });
        return;
      }
      if (!right) return;
      mapped.push({
        key: `dz-${index}`,
        letter: letterFromLabel(label),
        wrong,
        right,
        exception: isExceptionRight(right),
      });
    });

    return { pairs: groupKeeps(mapped), transfers: xfers };
  }, [items]);

  if (items.length === 0) return null;

  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.14}
      footerRule={undefined}
      maxWidth="2xl"
      className="gap-3"
    >
      <h2 className="text-center font-display text-2xl font-black uppercase tracking-wide text-slate-900">
        <span className="text-rose-700">{leftAxis}</span>
        <span className="mx-1.5 text-slate-500">×</span>
        <span className="text-emerald-700">{rightAxis}</span>
      </h2>

      <section className="overflow-hidden rounded-2xl border-2 border-sky-500 bg-sky-50 shadow-sm">
        <header className="flex items-center gap-2 bg-sky-700 px-3 py-2 text-white">
          <Scale className="h-4 w-4 shrink-0" aria-hidden />
          <p className="font-display text-sm font-black uppercase tracking-wide">
            Pegadinha × Correção
          </p>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2">
          <div className="flex items-center gap-2.5 border-b border-sky-200 px-3 py-3 sm:border-b-0 sm:border-r">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-600 text-white shadow-sm">
              <X className="h-4 w-4" strokeWidth={3} aria-hidden />
            </span>
            <p className="font-body text-base font-bold leading-snug text-slate-900">
              {valorMode ? (
                <>
                  Confia no{' '}
                  <span className="rounded bg-rose-200 px-1 text-rose-950">rótulo</span> → chute
                </>
              ) : (
                <>
                  Vê o <span className="rounded bg-rose-200 px-1 text-rose-950">nome</span> → chute
                  substantivo
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2.5 px-3 py-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm">
              <Check className="h-4 w-4" strokeWidth={3} aria-hidden />
            </span>
            <p className="font-body text-base font-bold leading-snug text-slate-900">
              {valorMode ? (
                <>
                  Testa o{' '}
                  <span className="rounded bg-emerald-200 px-1 text-emerald-950">uso</span> na
                  oração
                </>
              ) : (
                <>
                  Modifica o{' '}
                  <span className="rounded bg-emerald-200 px-1 text-emerald-950">verbo</span>? →
                  locução
                </>
              )}
            </p>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-2.5">
        {pairs.map((pair, index) => {
          const skin = PASTEL[Math.min(index, PASTEL.length - 1)]!;
          const hero = pair.exception;
          return (
            <motion.div
              key={pair.key}
              initial={reduceMotion ? false : { y: 6 }}
              animate={{ y: 0 }}
              transition={{ delay: reduceMotion ? 0 : Math.min(index * 0.04, 0.16) }}
              className={`grid grid-cols-[3rem_1fr] gap-2.5 rounded-2xl p-2.5 ring-2 ${skin.panel} ${skin.ring} ${
                hero ? 'ring-rose-600 shadow-md' : ''
              }`}
            >
              <div
                className={`flex items-center justify-center rounded-xl font-display font-black text-white shadow-sm ${skin.badge} ${
                  hero ? 'h-12 w-12 text-lg' : 'h-11 w-11 text-sm'
                }`}
              >
                {pair.letter}
              </div>
              <div className="min-w-0 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-stretch">
                <div className="rounded-xl border-2 border-rose-400 bg-white px-3 py-2.5">
                  <p className="font-mono text-xs font-black uppercase tracking-wider text-rose-700">
                    Parece
                  </p>
                  <p className="mt-1 font-body text-base font-bold leading-snug text-slate-900">
                    {renderRich(pair.wrong, 'light-trap')}
                  </p>
                </div>
                <div className="hidden items-center justify-center sm:flex" aria-hidden>
                  <ArrowLeftRight className="h-5 w-5 text-slate-500" />
                </div>
                <div
                  className={`rounded-xl border-2 px-3 py-2.5 ${
                    hero ? 'border-rose-800' : 'border-emerald-500 bg-white'
                  }`}
                  style={hero ? { backgroundColor: '#fff1f2' } : undefined}
                >
                  <p
                    className={`font-mono text-xs font-black uppercase tracking-wider ${
                      hero ? 'text-rose-800' : 'text-emerald-800'
                    }`}
                  >
                    {hero ? (valorMode ? 'Incorreto' : 'Exceção') : 'É'}
                  </p>
                  <p
                    className="mt-1 font-body text-base font-black leading-snug"
                    style={{ color: '#0f172a' }}
                  >
                    {renderRich(pair.right, hero ? 'light-trap' : 'light-ok')}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {transfers.map((row) => (
        <section
          key={row.key}
          className="overflow-hidden rounded-2xl border-2 border-indigo-700 shadow-md"
          style={{ backgroundColor: '#eef2ff' }}
        >
          <header
            className="flex items-center gap-2 px-3 py-2"
            style={{ backgroundColor: '#312e81' }}
          >
            <ArrowLeftRight className="h-4 w-4 text-amber-300" aria-hidden />
            <p className="font-display text-sm font-black uppercase tracking-wide text-white">
              {row.label.replace(/…+$/, '')}
            </p>
          </header>
          <div className="space-y-2 px-3 py-3" style={{ backgroundColor: '#eef2ff' }}>
            {row.wrong ? (
              <p
                className="font-body text-base font-black leading-snug"
                style={{ color: '#0f172a' }}
              >
                {renderRich(row.wrong, 'light-trap')}
              </p>
            ) : null}
            {row.right ? (
              <p
                className="font-body text-base font-black leading-snug"
                style={{ color: '#0f172a' }}
              >
                {renderRich(row.right, 'light-ok')}
              </p>
            ) : null}
          </div>
        </section>
      ))}

      <section
        className="overflow-hidden rounded-2xl border-2 border-rose-800 shadow-md"
        style={{ backgroundColor: '#fff1f2' }}
      >
        <header
          className="flex items-center gap-2 px-3 py-2.5"
          style={{ backgroundColor: '#9f1239' }}
        >
          <Brain className="h-5 w-5 text-amber-300" aria-hidden />
          <p className="font-display text-base font-black uppercase tracking-wide text-white">
            Dica de memorização
          </p>
        </header>
        <div className="space-y-2.5 px-3 py-3.5" style={{ backgroundColor: '#fff1f2' }}>
          {valorMode ? (
            <>
              <p
                className="font-body text-base font-black leading-snug"
                style={{ color: '#0f172a' }}
              >
                «Como…?» + pergunta indignada →{' '}
                <span
                  className="inline-block rounded-md px-2 py-1 font-black uppercase"
                  style={{ backgroundColor: '#38bdf8', color: '#0f172a' }}
                >
                  causal
                </span>{' '}
                ={' '}
                <span
                  className="inline-block rounded-md px-2 py-1 font-black uppercase"
                  style={{ backgroundColor: '#f59e0b', color: '#0f172a' }}
                >
                  INCORRETO
                </span>{' '}
                se o parêntese disser explicativo
              </p>
              <p
                className="font-body text-base font-black leading-snug"
                style={{ color: '#0f172a' }}
              >
                Pois / já que em afirmativa →{' '}
                <span
                  className="inline-block rounded-md px-2 py-1 font-black uppercase"
                  style={{ backgroundColor: '#34d399', color: '#0f172a' }}
                >
                  explicativo
                </span>{' '}
                ={' '}
                <span
                  className="inline-block rounded-md border-2 border-slate-900 px-2 py-1 font-black uppercase"
                  style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
                >
                  manter
                </span>
              </p>
            </>
          ) : (
            <>
              <p
                className="font-body text-base font-black leading-snug"
                style={{ color: '#0f172a' }}
              >
                Nomeia o período? →{' '}
                <span
                  className="inline-block rounded-md px-2 py-1 font-black uppercase"
                  style={{ backgroundColor: '#38bdf8', color: '#0f172a' }}
                >
                  substantivo
                </span>{' '}
                ={' '}
                <span
                  className="inline-block rounded-md px-2 py-1 font-black uppercase"
                  style={{ backgroundColor: '#f59e0b', color: '#0f172a' }}
                >
                  EXCETO
                </span>
              </p>
              <p
                className="font-body text-base font-black leading-snug"
                style={{ color: '#0f172a' }}
              >
                Modifica o verbo? →{' '}
                <span
                  className="inline-block rounded-md px-2 py-1 font-black uppercase"
                  style={{ backgroundColor: '#34d399', color: '#0f172a' }}
                >
                  locução
                </span>{' '}
                ={' '}
                <span
                  className="inline-block rounded-md border-2 border-slate-900 px-2 py-1 font-black uppercase"
                  style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
                >
                  manter
                </span>
              </p>
            </>
          )}
        </div>
      </section>

      {footerRule ? (
        <div className="rounded-2xl bg-slate-950 px-3 py-3.5 text-center shadow-md">
          <p className="font-mono text-xs font-black uppercase tracking-widest text-amber-300">
            Fixação
          </p>
          <p className="mt-1.5 font-display text-lg font-black uppercase tracking-wide text-white md:text-xl">
            {footerRule}
          </p>
        </div>
      ) : null}
    </BoardChrome>
  );
}
