'use client';

import { useCallback, type KeyboardEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { useDangerZoneCompareReveal } from './dangerZoneReveal';
import type { DangerZoneItem } from './DangerZone';
import {
  inferFunnelStage,
  stageBadge,
  stageChips,
  type PtCraseChip,
} from '@/lib/slides/ptCraseSlideUtils';
import {
  BoardChrome,
  PolarityPanel,
  CategoryStrip,
  boardTone,
  type BoardTone,
} from '../primitives';

const CHIP_TONE: Record<PtCraseChip['tone'], BoardTone> = {
  amber: 'transfer',
  rose: 'exception',
  emerald: 'ok',
  slate: 'neutral',
};

function extractLetter(label: string): string | null {
  const match = label.match(/^([A-E])\b/);
  return match ? match[1].toUpperCase() : null;
}

function ChipsRow({ chips, revealed }: { chips: PtCraseChip[]; revealed: boolean }) {
  if (chips.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {chips.map((chip) => (
        <CategoryStrip
          key={chip.label}
          label={chip.label}
          tone={revealed ? 'ok' : CHIP_TONE[chip.tone]}
        />
      ))}
    </div>
  );
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
  const letter = extractLetter(label);
  const trapText = item.detail || item.description || '';
  const correctText = typeof item.correct === 'string' ? item.correct.trim() : '';
  const stage = inferFunnelStage(`${label} ${trapText} ${correctText}`);
  const chips = stageChips(stage);
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
                {stageBadge(stage)} · pegadinha
              </p>
              <p className="mt-1 font-display text-sm font-bold text-slate-900">
                {label.replace(/^[A-E]\s*[—–-]\s*/, '')}
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

          <ChipsRow chips={chips} revealed={isRevealed} />

          {isRevealed && correctText ? (
            <PolarityPanel tone="ok" className="rounded-xl p-3">
              <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-emerald-800">
                O funil exige
              </p>
              <p className="mt-1 font-body text-sm leading-relaxed text-emerald-900">{correctText}</p>
            </PolarityPanel>
          ) : !isRevealed ? (
            <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-rose-500/80">
              Toque para ver o que o funil exige →
            </span>
          ) : null}
        </div>
      </PolarityPanel>
    </motion.button>
  );
}

interface DangerZonePtCraseTrapArenaProps {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  footerRule?: string;
  compareRevealMode?: LogicFlowRevealMode;
}

/** Arena crase — PolarityPanel trap×funil (Onda 4); mantém reveal tap. */
export function DangerZonePtCraseTrapArena({
  content,
  items,
  theme,
  footerRule,
  compareRevealMode = 'tap',
}: DangerZonePtCraseTrapArenaProps) {
  const prefersReducedMotion = useReducedMotion();
  const { revealItem, isItemRevealed } = useDangerZoneCompareReveal(
    items.length,
    compareRevealMode,
  );

  const reveal = useCallback(
    (index: number) => {
      revealItem(index);
    },
    [revealItem],
  );

  return (
    <BoardChrome
      theme={theme}
      eyebrow={content || 'Funil · pegadinhas'}
      footerRule={footerRule}
      maxWidth="2xl"
      washOpacity={0.25}
    >
      <div className="flex flex-col gap-3">
        {items.map((item, index) => (
          <TrapCard
            key={index}
            index={index}
            item={item}
            isRevealed={isItemRevealed(index)}
            onReveal={() => reveal(index)}
            prefersReducedMotion={prefersReducedMotion}
          />
        ))}
      </div>
    </BoardChrome>
  );
}
