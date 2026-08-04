'use client';

import { useCallback, type KeyboardEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { useDangerZoneCompareReveal } from './dangerZoneReveal';
import type { DangerZoneItem } from './DangerZone';
import { inferMamaTrapZones, MAMA_AGE_MARKERS } from '@/lib/slides/mulherMamaSlideUtils';
import {
  BoardChrome,
  PolarityPanel,
  boardTone,
  type BoardTone,
} from '../primitives';

/** Régua etária local — escala 40–69, pegadinha × correto (rastreio mama). */
function AgeTrapRuler({
  trapAge,
  correctAge,
  revealed,
}: {
  trapAge: number | null;
  correctAge: number | null;
  revealed: boolean;
}) {
  const min = 40;
  const max = 69;
  const toPct = (age: number) => `${Math.min(100, Math.max(0, ((age - min) / (max - min)) * 100))}%`;

  return (
    <div className="rounded-xl border border-pink-200/80 bg-pink-50/50 p-3">
      <div className="relative h-3 rounded-full bg-gradient-to-r from-slate-200 via-pink-300 to-slate-300">
        {trapAge !== null && !revealed ? (
          <span
            className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-500 ring-2 ring-rose-300/60"
            style={{ left: toPct(trapAge) }}
          />
        ) : null}
        {correctAge !== null && revealed ? (
          <span
            className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500 ring-2 ring-emerald-300/60"
            style={{ left: toPct(correctAge) }}
          />
        ) : null}
        <span className="absolute top-1/2 h-full w-0.5 -translate-y-1/2 bg-pink-600/30" style={{ left: toPct(50) }} />
        <span className="absolute top-1/2 h-full w-0.5 -translate-y-1/2 bg-pink-600/30" style={{ left: toPct(69) }} />
      </div>
      <div className="mt-2 flex justify-between">
        {MAMA_AGE_MARKERS.map((age) => (
          <span
            key={age}
            className={`font-mono text-[9px] font-bold ${
              trapAge === age && !revealed
                ? 'text-rose-700'
                : correctAge === age && revealed
                  ? 'text-emerald-700'
                  : 'text-slate-500'
            }`}
          >
            {age}
          </span>
        ))}
      </div>
    </div>
  );
}

function extractLetterFromLabel(label: string): string | null {
  const match = label.match(/^Letra\s+([A-E])\b/i);
  return match?.[1]?.toUpperCase() ?? null;
}

function LetterBadge({ letter, revealed }: { letter: string; revealed: boolean }) {
  const t = boardTone(revealed ? 'ok' : 'exception');
  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-display text-lg font-black shadow-sm ${t.badge} ${t.badgeText}`}
    >
      {letter}
    </div>
  );
}

function TrapCard({
  index,
  item,
  isRevealed,
  onReveal,
  prefersReducedMotion,
}: {
  index: number;
  item: DangerZoneItem;
  isRevealed: boolean;
  onReveal: () => void;
  prefersReducedMotion: boolean | null;
}) {
  const label = item.label || item.title || `Pegadinha ${index + 1}`;
  const letter = extractLetterFromLabel(label);
  const trapText = item.detail || item.description || '';
  const correctText = typeof item.correct === 'string' ? item.correct.trim() : '';
  const { trapAge, correctAge, hasRail } = inferMamaTrapZones(label, trapText, correctText);
  const tone: BoardTone = isRevealed ? 'ok' : 'exception';

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!isRevealed) onReveal();
    }
  };

  return (
    <motion.button
      type="button"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: prefersReducedMotion ? 0 : index * 0.06 }}
      onClick={() => !isRevealed && onReveal()}
      onKeyDown={handleKeyDown}
      aria-expanded={isRevealed}
      className="w-full text-left"
    >
      <PolarityPanel tone={tone} emphasized={!isRevealed} className="rounded-[1.25rem]">
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            {letter ? <LetterBadge letter={letter} revealed={isRevealed} /> : null}
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wide text-slate-600">
                Idade/intervalo errado
              </p>
              <p className="mt-1 font-display text-sm font-bold text-slate-900">
                {label.replace(/^Letra\s+[A-E]\s*[—–-]\s*/i, '')}
              </p>
              {trapText ? (
                <p className="mt-1 line-clamp-2 font-body text-sm text-slate-600">{trapText}</p>
              ) : null}
            </div>
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                isRevealed ? 'bg-emerald-500 text-white' : 'bg-rose-100 text-rose-600'
              }`}
            >
              {isRevealed ? (
                <Check className="h-4 w-4" strokeWidth={3} />
              ) : (
                <X className="h-4 w-4" strokeWidth={3} />
              )}
            </span>
          </div>

          {hasRail ? (
            <AgeTrapRuler trapAge={trapAge} correctAge={correctAge} revealed={isRevealed} />
          ) : null}

          {isRevealed && correctText ? (
            <PolarityPanel tone="ok" className="rounded-xl p-3">
              <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-emerald-800">
                INCA/MS — posição correta
              </p>
              <p className="mt-1 font-body text-sm leading-relaxed text-emerald-900">{correctText}</p>
            </PolarityPanel>
          ) : !isRevealed ? (
            <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-rose-500/80">
              Toque para revelar →
            </span>
          ) : null}
        </div>
      </PolarityPanel>
    </motion.button>
  );
}

interface DangerZoneMulherMamaTrapArenaProps {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  footerRule?: string;
  compareRevealMode?: LogicFlowRevealMode;
}

/** Arena mama — PolarityPanel trap×correto (Fábrica G2). */
export function DangerZoneMulherMamaTrapArena({
  content,
  items,
  theme,
  footerRule,
  compareRevealMode = 'tap',
}: DangerZoneMulherMamaTrapArenaProps) {
  const prefersReducedMotion = useReducedMotion();
  const { revealItem, isItemRevealed, isTapMode } = useDangerZoneCompareReveal(
    items.length,
    compareRevealMode,
  );

  const handleReveal = useCallback(
    (index: number) => {
      if (isTapMode) revealItem(index);
    },
    [isTapMode, revealItem],
  );

  return (
    <BoardChrome
      theme={theme}
      eyebrow={content || 'Mama · pegadinhas'}
      footerRule={footerRule}
      footerLabel="Transferência de prova"
      maxWidth="2xl"
      washOpacity={0.35}
    >
      <div className="flex flex-col gap-3">
        {items.map((item, index) => (
          <TrapCard
            key={index}
            index={index}
            item={item}
            isRevealed={isItemRevealed(index)}
            onReveal={() => handleReveal(index)}
            prefersReducedMotion={prefersReducedMotion}
          />
        ))}
      </div>
    </BoardChrome>
  );
}
