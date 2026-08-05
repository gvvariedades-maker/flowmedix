'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { DangerZoneItem } from './DangerZone';
import { BoardChrome, CategoryStrip, PolarityPanel } from '../primitives';
import { cn } from '@/lib/utils';

interface DangerZonePniViaTrapArenaProps {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  footerRule?: string;
  compareRevealMode?: unknown;
}

function extractLetter(label: string): string | null {
  return label.match(/^Letra\s+([A-E])\b/i)?.[1]?.toUpperCase() ?? null;
}

function isTransfer(label: string): boolean {
  return /transfer|similares/i.test(label);
}

function shortTitle(label: string, letter: string | null): string {
  if (!letter) return label.replace(/^Transferência\s*[—–-]?\s*/i, '').trim() || label;
  return label.replace(new RegExp(`^Letra\\s+${letter}\\s*[—–-]\\s*`, 'i'), '').trim() || label;
}

/**
 * Arena via/técnica PNI — lista glanceable ✗×✓ (0 taps).
 */
export function DangerZonePniViaTrapArena({
  content,
  items,
  theme,
  footerRule,
}: DangerZonePniViaTrapArenaProps) {
  const reduceMotion = useReducedMotion();

  const { traps, transfers } = useMemo(() => {
    const rows = items.map((item, index) => {
      const label = item.label || item.title || `Pegadinha ${index + 1}`;
      const detail = item.detail || item.description || '';
      const correct = typeof item.correct === 'string' ? item.correct.trim() : '';
      const letter = extractLetter(label);
      const transfer = isTransfer(label);
      return { label, detail, correct, letter, transfer, title: shortTitle(label, letter) };
    });
    return {
      traps: rows.filter((r) => !r.transfer),
      transfers: rows.filter((r) => r.transfer),
    };
  }, [items]);

  if (items.length === 0) return null;

  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.35}
      eyebrow="Arena da pegadinha"
      footerRule={footerRule}
      footerLabel={footerRule ? 'TRANSFERÊNCIA' : undefined}
      maxWidth="2xl"
      className="gap-3"
    >
      {content ? (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-center">
          <p className="font-body text-sm font-bold text-amber-950 md:text-base">⚠️ {content}</p>
        </div>
      ) : null}

      <div className="space-y-3">
        {traps.map((row, index) => (
          <motion.div
            key={`${row.label}-${index}`}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduceMotion ? 0 : index * 0.03 }}
            className="space-y-2"
          >
            <PolarityPanel tone="exception" emphasized>
              <div className="flex items-start gap-3">
                {row.letter ? (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 font-body text-lg font-black text-white shadow-sm">
                    {row.letter}
                  </span>
                ) : (
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-600 text-white">
                    <X className="h-5 w-5" strokeWidth={3} aria-hidden />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <CategoryStrip
                    label={`${row.title.toUpperCase()} — PEGADINHA`}
                    tone="exception"
                  />
                  <p className="mt-1.5 font-body text-sm font-semibold leading-snug text-rose-950">
                    {row.detail}
                  </p>
                </div>
              </div>
            </PolarityPanel>
            {row.correct ? (
              <PolarityPanel tone="ok" emphasized>
                <div className="flex items-start gap-2">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" aria-hidden />
                  <div>
                    <CategoryStrip label="Conduta certa na prova" tone="ok" />
                    <p className="mt-1.5 font-body text-sm font-semibold leading-snug text-emerald-950">
                      {row.correct}
                    </p>
                  </div>
                </div>
              </PolarityPanel>
            ) : null}
          </motion.div>
        ))}

        {transfers.map((row, index) => (
          <PolarityPanel
            key={`tr-${row.label}-${index}`}
            tone="transfer"
            className={cn(index === 0 && 'mt-1')}
          >
            <CategoryStrip label={`Transferência — ${row.title}`} tone="transfer" />
            <p className="mt-1.5 font-body text-sm font-semibold leading-snug text-slate-800">
              {row.detail}
            </p>
            {row.correct ? (
              <p className="mt-2 font-body text-sm font-bold leading-snug text-teal-900">
                {row.correct}
              </p>
            ) : null}
          </PolarityPanel>
        ))}
      </div>
    </BoardChrome>
  );
}
