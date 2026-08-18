'use client';

import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, ShieldAlert, X } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { DangerZoneBulletStyle } from '../core/dangerZoneLayout';
import { dangerZoneHasCompareItems } from '../core/dangerZoneLayout';
import { getCompareBackFaceLabel } from '@/lib/slides/goldenRuleTypography';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import type { DangerZoneItemPolarity } from '../core/dangerZonePolarity';
import { getDangerZoneBespoke } from '../registry/dangerZone';
import { useDangerZoneCompareReveal } from './dangerZoneReveal';
import {
  AlertCallout,
  BoardChrome,
  CategoryStrip,
  PolarityPanel,
} from '../primitives';

export interface DangerZoneItem {
  id?: string;
  label?: string;
  title?: string;
  detail?: string;
  description?: string;
  correct?: string;
}

interface DangerZoneProps {
  content: string;
  theme: ThemeColors;
  items?: DangerZoneItem[];
  footerRule?: string;
  layoutVariant?: string;
  bulletStyle?: DangerZoneBulletStyle;
  compareRevealMode?: LogicFlowRevealMode;
  /** Polaridade por item derivada do enunciado (comando negativo × gabarito). */
  itemPolarities?: DangerZoneItemPolarity[];
  /** Face verde do compare (PT → «Resposta certa»; TE → «Conduta certa na prova»). */
  compareBackFaceDefault?: string;
}

function TrapBullet({
  bulletStyle,
  index,
  itemId,
}: {
  bulletStyle: DangerZoneBulletStyle;
  index: number;
  itemId?: string;
}) {
  if (bulletStyle === 'x_icon') {
    return (
      <span
        className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-600 text-white shadow-md"
        aria-hidden
      >
        <X className="h-5 w-5" strokeWidth={3} />
      </span>
    );
  }
  return (
    <span className="shrink-0 font-mono tabular-nums text-sm font-bold text-rose-700 md:text-lg">
      {itemId || `${index + 1}.`}
    </span>
  );
}

function ItemContent({
  item,
  index,
  bulletStyle,
}: {
  item: DangerZoneItem;
  index: number;
  bulletStyle: DangerZoneBulletStyle;
}) {
  return (
    <div className="flex items-start gap-3">
      <TrapBullet bulletStyle={bulletStyle} index={index} itemId={item.id} />
      <div className="min-w-0 flex-1">
        <h4 className="mb-1.5 font-body text-base font-bold text-rose-950 md:text-lg">
          {item.label || item.title || 'Pegadinha'}
        </h4>
        <p className="font-body text-sm leading-relaxed text-rose-900/90 md:text-base">
          {item.detail || item.description || ''}
        </p>
      </div>
    </div>
  );
}

function CompareItemPanel({
  index,
  label,
  trapText,
  correctText,
  bulletStyle,
  itemId,
  isTapMode,
  isRevealed,
  onReveal,
  compareBackFaceDefault,
}: {
  index: number;
  label: string;
  trapText: string;
  correctText: string;
  bulletStyle: DangerZoneBulletStyle;
  itemId?: string;
  isTapMode: boolean;
  isRevealed: boolean;
  onReveal: () => void;
  compareBackFaceDefault?: string;
}) {
  const backFaceLabel = getCompareBackFaceLabel(label, correctText, compareBackFaceDefault);
  const showCorrect = !isTapMode || isRevealed;

  return (
    <div className="flex flex-col gap-2">
      <PolarityPanel tone="exception" emphasized={!showCorrect}>
        <div className="flex items-start gap-3">
          <TrapBullet bulletStyle={bulletStyle} index={index} itemId={itemId} />
          <div className="min-w-0 flex-1">
            <CategoryStrip label={`${label} — Pegadinha`} tone="exception" />
            <p className="mt-2 font-body text-sm font-semibold leading-relaxed text-rose-950">
              {trapText}
            </p>
          </div>
        </div>
      </PolarityPanel>

      {showCorrect ? (
        <PolarityPanel tone="keep" emphasized>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" aria-hidden />
            <div className="min-w-0 flex-1">
              <CategoryStrip label={backFaceLabel} tone="keep" />
              <p className="mt-2 font-body text-sm font-semibold leading-relaxed text-emerald-950">
                {correctText || '—'}
              </p>
            </div>
          </div>
        </PolarityPanel>
      ) : (
        <button
          type="button"
          onClick={onReveal}
          className="min-h-[48px] w-full rounded-2xl border-2 border-rose-300 bg-white px-4 py-3 text-center font-body text-sm font-bold text-rose-800 shadow-sm transition-colors hover:bg-rose-50 active:bg-rose-100"
        >
          Ver resposta correta
        </button>
      )}
    </div>
  );
}

function DangerZoneCompare({
  content,
  theme,
  items,
  footerRule,
  bulletStyle,
  compareRevealMode = 'auto',
  compareBackFaceDefault,
}: {
  content: string;
  theme: ThemeColors;
  items: DangerZoneItem[];
  footerRule?: string;
  bulletStyle: DangerZoneBulletStyle;
  compareRevealMode?: LogicFlowRevealMode;
  compareBackFaceDefault?: string;
}) {
  const { revealItem, isTapMode } = useDangerZoneCompareReveal(items.length, compareRevealMode);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(() => new Set());

  const handleReveal = useCallback(
    (index: number) => {
      if (isTapMode) {
        revealItem(index);
      }
      setRevealedIndices((prev) => {
        const next = new Set(prev);
        next.add(index);
        return next;
      });
    },
    [isTapMode, revealItem],
  );

  const revealedCount = isTapMode ? revealedIndices.size : items.length;
  const allRevealed = revealedCount >= items.length;

  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.35}
      eyebrow="Arena da pegadinha"
      footerRule={footerRule}
      footerLabel={footerRule ? 'TRANSFERÊNCIA' : undefined}
      maxWidth="2xl"
    >
      {content ? (
        <AlertCallout tone="warn" icon={AlertTriangle}>
          {content}
        </AlertCallout>
      ) : null}

      <div className="space-y-3">
        {items.map((item, index) => {
          const trapText = item.detail || item.description || '';
          const correctText = typeof item.correct === 'string' ? item.correct.trim() : '';
          const label = item.label || item.title || `Ponto ${index + 1}`;
          const isRevealed = !isTapMode || revealedIndices.has(index);

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
            >
              <CompareItemPanel
                index={index}
                label={label}
                trapText={trapText}
                correctText={correctText}
                bulletStyle={bulletStyle}
                itemId={item.id}
                isTapMode={isTapMode}
                isRevealed={isRevealed}
                onReveal={() => handleReveal(index)}
                compareBackFaceDefault={compareBackFaceDefault}
              />
            </motion.div>
          );
        })}
      </div>

      {allRevealed ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2"
        >
          <CategoryStrip
            label={isTapMode ? 'Todas as pegadinhas mapeadas' : 'Domínio ativado — revise antes da prova'}
            tone="keep"
          />
        </motion.div>
      ) : null}
    </BoardChrome>
  );
}

function TrapListBoard({
  theme,
  content,
  items,
  footerRule,
  bulletStyle,
  dense = false,
}: {
  theme: ThemeColors;
  content: string;
  items?: DangerZoneItem[];
  footerRule?: string;
  bulletStyle: DangerZoneBulletStyle;
  dense?: boolean;
}) {
  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.35}
      eyebrow="Arena da pegadinha"
      footerRule={footerRule}
      footerLabel={footerRule ? 'TRANSFERÊNCIA' : undefined}
      maxWidth={dense ? '2xl' : '3xl'}
    >
      <div className="mb-1 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600" aria-hidden />
        <CategoryStrip label={dense ? 'Cuidado' : 'Cuidado com a pegadinha'} tone="exception" />
      </div>

      {content ? (
        <AlertCallout tone="warn" icon={ShieldAlert}>
          {content}
        </AlertCallout>
      ) : null}

      {items && items.length > 0 ? (
        <div className={dense ? 'space-y-2' : 'space-y-3'}>
          {items.map((item, index) => (
            <PolarityPanel key={index} tone="exception">
              <ItemContent item={item} index={index} bulletStyle={bulletStyle} />
            </PolarityPanel>
          ))}
        </div>
      ) : null}
    </BoardChrome>
  );
}

// ============================================================================
// DANGER ZONE: Pegadinhas — list | cards | compact | compare (trap × correct)
// Chassis G2: BoardChrome + PolarityPanel (+ AlertCallout)
// ============================================================================
export const DangerZone = ({
  content,
  theme,
  items,
  footerRule,
  layoutVariant = 'list',
  bulletStyle = 'numbered',
  compareRevealMode = 'auto',
  itemPolarities,
  compareBackFaceDefault,
}: DangerZoneProps) => {
  const explicitVariant = layoutVariant || 'list';

  const bespoke = getDangerZoneBespoke(explicitVariant);
  if (bespoke && (!bespoke.requiresItems || (items && items.length > 0))) {
    const Comp = bespoke.Component;
    return (
      <Comp
        content={content}
        items={items}
        theme={theme}
        footerRule={footerRule}
        compareRevealMode={compareRevealMode}
        revealMode={compareRevealMode}
        itemPolarities={itemPolarities}
      />
    );
  }

  const variant =
    explicitVariant === 'compare' || dangerZoneHasCompareItems(items)
      ? 'compare'
      : explicitVariant;

  if (variant === 'compare' && items && items.length > 0) {
    return (
      <DangerZoneCompare
        content={content}
        theme={theme}
        items={items}
        footerRule={footerRule}
        bulletStyle={bulletStyle}
        compareRevealMode={compareRevealMode}
        compareBackFaceDefault={compareBackFaceDefault}
      />
    );
  }

  if (variant === 'cards' && items && items.length > 0) {
    return (
      <BoardChrome
        theme={theme}
        washOpacity={0.35}
        eyebrow="Arena da pegadinha"
        footerRule={footerRule}
        footerLabel={footerRule ? 'TRANSFERÊNCIA' : undefined}
        maxWidth="5xl"
      >
        {content ? (
          <AlertCallout tone="warn" icon={AlertTriangle}>
            {content}
          </AlertCallout>
        ) : null}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <PolarityPanel tone="exception">
                <ItemContent item={item} index={index} bulletStyle={bulletStyle} />
              </PolarityPanel>
            </motion.div>
          ))}
        </div>
      </BoardChrome>
    );
  }

  if (variant === 'compact') {
    return (
      <TrapListBoard
        theme={theme}
        content={content}
        items={items}
        footerRule={footerRule}
        bulletStyle={bulletStyle}
        dense
      />
    );
  }

  // list + fallback
  return (
    <TrapListBoard
      theme={theme}
      content={content}
      items={items}
      footerRule={footerRule}
      bulletStyle={bulletStyle}
    />
  );
};
