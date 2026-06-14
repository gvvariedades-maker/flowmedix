'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Zap } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { DangerZoneItem } from './DangerZone';

type ArenaLetter = 'A' | 'B' | 'C' | 'D' | 'E';

type ArenaEntry = {
  letter: ArenaLetter;
  text: string;
  tipo: 'ok' | 'erro';
  tag: string;
  analise: string;
  calc: string;
};

function extractLetter(label: string, detail: string): ArenaLetter | null {
  const m = `${label} ${detail}`.match(/letra\s*([A-E])/i);
  return m ? (m[1].toUpperCase() as ArenaLetter) : null;
}

function shortOptionText(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length <= 72) return trimmed;
  return `${trimmed.slice(0, 69)}…`;
}

function buildArenaEntries(items: DangerZoneItem[]): ArenaEntry[] {
  const byLetter = new Map<ArenaLetter, DangerZoneItem>();

  for (const item of items) {
    const letter = extractLetter(item.label ?? '', item.detail ?? '');
    if (letter) byLetter.set(letter, item);
  }

  const entries: ArenaEntry[] = [];

  for (const [letter, item] of byLetter) {
    const correct = (item.correct ?? '').trim();
    const isOk = /gabarito.*letra\s*a/i.test(correct) && letter === 'A';
    const trapText = item.detail || item.description || '';
    entries.push({
      letter,
      text: shortOptionText(trapText.replace(/^Letra\s+[A-E]\s*—\s*/i, '')),
      tipo: isOk ? 'ok' : 'erro',
      tag: isOk
        ? `GABARITO CONFIRMADO — Letra ${letter}`
        : `ARMADILHA DETECTADA — Letra ${letter}`,
      analise: isOk
        ? correct || 'Alternativa correta conforme o enunciado.'
        : `A banca descreve o dispositivo de forma invertida. ${correct ? `Correto: ${correct.replace(/^Gabarito:\s*/i, '')}` : ''}`,
      calc: isOk
        ? 'CNA = baixo fluxo · inserção na narina · mensurar para conforto'
        : letter === 'B'
          ? 'CNA = baixo fluxo (não alto) · 1–6 L/min típico'
          : letter === 'C'
            ? 'Venturi tem diluidores + bolsa — não é “simples com furos”'
            : letter === 'D'
              ? 'Diluidores FiO₂ = Venturi · máscara simples ≠ indicada rotineira em DPOC'
              : 'Elimine pelo texto literal antes de marcar',
    });
  }

  if (!byLetter.has('A')) {
    const sampleCorrect = items.map((i) => i.correct ?? '').find((c) => /letra\s*a/i.test(c));
    if (sampleCorrect) {
      const text = sampleCorrect.replace(/^Gabarito:\s*letra\s*A\s*—\s*/i, '').trim();
      entries.push({
        letter: 'A',
        text: shortOptionText(text),
        tipo: 'ok',
        tag: 'GABARITO CONFIRMADO — Letra A',
        analise: sampleCorrect,
        calc: 'CNA = baixo fluxo · inserção na narina · mensurar para conforto',
      });
    }
  }

  return entries.sort((a, b) => a.letter.localeCompare(b.letter));
}

interface DangerZoneOxygenArenaProps {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  footerRule?: string;
}

export function DangerZoneOxygenArena({
  content,
  items,
  theme,
  footerRule,
}: DangerZoneOxygenArenaProps) {
  const entries = useMemo(() => buildArenaEntries(items), [items]);
  const [active, setActive] = useState<ArenaLetter | null>(null);
  const [visited, setVisited] = useState<Set<ArenaLetter>>(() => new Set());

  const stats = useMemo(() => {
    let erros = 0;
    let oks = 0;
    for (const l of visited) {
      const e = entries.find((x) => x.letter === l);
      if (e?.tipo === 'erro') erros += 1;
      if (e?.tipo === 'ok') oks += 1;
    }
    return { erros, oks, vistas: visited.size };
  }, [visited, entries]);

  const activeEntry = entries.find((e) => e.letter === active);

  const julgar = useCallback((letter: ArenaLetter) => {
    setActive(letter);
    setVisited((prev) => new Set(prev).add(letter));
  }, []);

  const reiniciar = useCallback(() => {
    setActive(null);
    setVisited(new Set());
  }, []);

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden p-3 md:p-5">
      <motion.div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 mx-auto flex w-full max-w-lg min-h-0 flex-1 flex-col">
        {content ? (
          <div className="mb-2.5 rounded-xl border border-red-300/70 border-l-[5px] border-l-red-500 bg-gradient-to-br from-red-50 via-white to-rose-50/90 px-3 py-2.5 shadow-lg shadow-red-200/30 ring-1 ring-red-200/40">
            <p className="font-display text-[11px] font-extrabold uppercase leading-snug tracking-wide text-red-900 md:text-xs">
              {content}
            </p>
          </div>
        ) : null}

        <div className="mb-2.5 grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-red-300/70 bg-gradient-to-br from-red-50 via-white to-rose-50/80 px-2 py-2 text-center shadow-md shadow-red-200/30 ring-1 ring-red-200/40">
            <p className="font-mono text-xl font-black tabular-nums text-red-500">{stats.erros}</p>
            <p className="font-mono text-[8px] font-bold uppercase tracking-wide text-slate-500">Armadilhas</p>
          </div>
          <div className="rounded-xl border border-violet-300/70 bg-gradient-to-br from-violet-50 via-white to-purple-50/80 px-2 py-2 text-center shadow-md shadow-violet-200/30 ring-1 ring-violet-200/40">
            <p className="font-mono text-xl font-black tabular-nums text-violet-600">{stats.vistas}</p>
            <p className="font-mono text-[8px] font-bold uppercase tracking-wide text-slate-500">Vistas</p>
          </div>
          <div className="rounded-xl border border-emerald-300/70 bg-gradient-to-br from-emerald-50 via-white to-teal-50/80 px-2 py-2 text-center shadow-md shadow-emerald-200/30 ring-1 ring-emerald-200/40">
            <p className="font-mono text-xl font-black tabular-nums text-emerald-600">{stats.oks}</p>
            <p className="font-mono text-[8px] font-bold uppercase tracking-wide text-slate-500">Gabarito</p>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
          {entries.map((entry) => {
            const isActive = active === entry.letter;
            const wasVisited = visited.has(entry.letter);
            return (
              <button
                key={entry.letter}
                type="button"
                onClick={() => julgar(entry.letter)}
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all active:scale-[0.99] ${
                  isActive
                    ? entry.tipo === 'ok'
                      ? 'border-emerald-400/70 border-l-[5px] border-l-emerald-500 bg-gradient-to-br from-emerald-50 via-white to-teal-50/90 shadow-lg shadow-emerald-200/40 ring-1 ring-emerald-200/50'
                      : 'border-red-400/70 border-l-[5px] border-l-red-500 bg-gradient-to-br from-red-50 via-white to-rose-50/90 shadow-lg shadow-red-200/40 ring-1 ring-red-200/50'
                    : wasVisited
                      ? entry.tipo === 'ok'
                        ? 'border-emerald-300/60 bg-gradient-to-br from-emerald-50/80 to-white shadow-md shadow-emerald-100/30'
                        : 'border-red-300/60 bg-gradient-to-br from-red-50/80 to-white shadow-md shadow-red-100/30'
                      : 'border-slate-200/90 bg-gradient-to-br from-white to-slate-50/90 shadow-sm ring-1 ring-slate-100/80 hover:border-slate-300/80 hover:shadow-md'
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-extrabold shadow-sm ${
                    isActive
                      ? entry.tipo === 'ok'
                        ? 'bg-gradient-to-br from-emerald-200 to-teal-200/90 text-emerald-800'
                        : 'bg-gradient-to-br from-red-200 to-rose-200/90 text-red-700'
                      : wasVisited
                        ? entry.tipo === 'ok'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-600'
                        : 'bg-gradient-to-br from-slate-100 to-slate-50 text-slate-500'
                  }`}
                >
                  {entry.letter}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 font-body text-xs font-bold leading-snug text-slate-900 md:text-sm">
                    {entry.text}
                  </p>
                  <p className="mt-0.5 font-mono text-[9px] text-slate-400">
                    {wasVisited ? (entry.tipo === 'ok' ? 'Gabarito' : 'Armadilha revelada') : 'Toque para interrogar →'}
                  </p>
                </div>
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    wasVisited
                      ? entry.tipo === 'ok'
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-red-100 text-red-600'
                      : 'opacity-0'
                  }`}
                >
                  {entry.tipo === 'ok' ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" strokeWidth={3} />}
                </span>
              </button>
            );
          })}
        </div>

        {activeEntry ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-2.5 rounded-xl border p-3 shadow-lg ring-1 ${
              activeEntry.tipo === 'ok'
                ? 'border-emerald-300/70 bg-gradient-to-br from-emerald-50 via-white to-teal-50/90 shadow-emerald-200/30 ring-emerald-200/40'
                : 'border-red-300/70 bg-gradient-to-br from-red-50 via-white to-rose-50/90 shadow-red-200/30 ring-red-200/40'
            }`}
          >
            <div className="mb-1.5 flex items-center gap-1.5">
              <Zap className={`h-3.5 w-3.5 ${activeEntry.tipo === 'ok' ? 'text-emerald-600' : 'text-red-500'}`} />
              <span
                className={`font-mono text-[9px] font-extrabold uppercase tracking-wide ${
                  activeEntry.tipo === 'ok' ? 'text-emerald-700' : 'text-red-600'
                }`}
              >
                {activeEntry.tag}
              </span>
            </div>
            <p className="font-body text-xs leading-relaxed text-slate-800">{activeEntry.analise}</p>
            <p
              className={`mt-2 rounded-lg px-2.5 py-1.5 text-center font-mono text-[10px] font-bold shadow-inner ${
                activeEntry.tipo === 'ok'
                  ? 'bg-gradient-to-r from-emerald-100/90 to-teal-100/80 text-emerald-900'
                  : 'bg-gradient-to-r from-red-100/90 to-rose-100/80 text-red-900'
              }`}
            >
              {activeEntry.calc}
            </p>
          </motion.div>
        ) : (
          <p className="mt-2 text-center font-body text-[11px] text-slate-400">
            Toque em qualquer alternativa para ver o veredito
          </p>
        )}

        {footerRule && stats.vistas >= entries.length ? (
          <p className="mt-2 rounded-xl border border-amber-200/60 bg-gradient-to-r from-amber-50/90 to-yellow-50/80 px-3 py-2 text-center font-body text-xs italic text-amber-900/80 shadow-sm">
            {footerRule}
          </p>
        ) : null}

        {stats.vistas > 0 ? (
          <button
            type="button"
            onClick={reiniciar}
            className="mt-2 self-center font-mono text-[10px] font-bold uppercase tracking-wide text-red-500"
          >
            ↺ Refazer
          </button>
        ) : null}
      </div>
    </div>
  );
}
