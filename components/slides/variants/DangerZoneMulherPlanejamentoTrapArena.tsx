'use client';

import { useCallback, type KeyboardEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { useDangerZoneCompareReveal } from './dangerZoneReveal';
import type { DangerZoneItem } from './DangerZone';
import {
  inferPlanejamentoTrapZones,
  planejamentoZoneLabel,
  type PlanejamentoMethodZone,
} from '@/lib/slides/mulherPlanejamentoSlideUtils';
import {
  BoardChrome,
  PolarityPanel,
  boardTone,
  type BoardTone,
} from '../primitives';

const TRAP_RAIL_ZONES: PlanejamentoMethodZone[] = ['behavioral', 'hormonal', 'trap_oral'];

function MethodZoneRail({
  trapZones,
  correctZones,
  revealed,
}: {
  trapZones: PlanejamentoMethodZone[];
  correctZones: PlanejamentoMethodZone[];
  revealed: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between gap-1 rounded-xl border border-pink-200/80 bg-pink-50/50 px-2 py-2"
      aria-hidden
    >
      {TRAP_RAIL_ZONES.map((zone) => {
        const isTrap = trapZones.includes(zone);
        const isCorrect = correctZones.includes(zone);
        const showTrap = isTrap && !revealed;
        const showCorrect = isCorrect && revealed;

        return (
          <div
            key={zone}
            className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-0.5 py-1 transition-all duration-300 ${
              showTrap
                ? 'bg-rose-200/90 ring-2 ring-rose-400/60'
                : showCorrect
                  ? 'bg-emerald-200/90 ring-2 ring-emerald-400/60'
                  : 'bg-white/60 opacity-60'
            }`}
          >
            <span
              className={`text-center font-mono text-[7px] font-black leading-tight sm:text-[8px] ${
                showTrap ? 'text-rose-900' : showCorrect ? 'text-emerald-900' : 'text-slate-500'
              }`}
            >
              {planejamentoZoneLabel(zone)}
            </span>
          </div>
        );
      })}
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
  const { trapZones, correctZones, hasRail } = inferPlanejamentoTrapZones(
    label,
    trapText,
    correctText,
  );
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
                Pegadinha
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
            <MethodZoneRail trapZones={trapZones} correctZones={correctZones} revealed={isRevealed} />
          ) : null}

          {isRevealed && correctText ? (
            <PolarityPanel tone="ok" className="rounded-xl p-3">
              <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-emerald-800">
                Correto
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

interface DangerZoneMulherPlanejamentoTrapArenaProps {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  footerRule?: string;
  compareRevealMode?: LogicFlowRevealMode;
}

/** Arena planejamento — PolarityPanel trap×correto (Fábrica G2). */
export function DangerZoneMulherPlanejamentoTrapArena({
  content,
  items,
  theme,
  footerRule,
  compareRevealMode = 'tap',
}: DangerZoneMulherPlanejamentoTrapArenaProps) {
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
      eyebrow={content || 'Planejamento · pegadinhas'}
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
