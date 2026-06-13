'use client';

import { useCallback, useState, type KeyboardEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, ShieldAlert, X } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { DangerZoneBulletStyle } from '../core/dangerZoneLayout';
import { dangerZoneHasCompareItems } from '../core/dangerZoneLayout';
import { getCompareCorrectColumnTitle } from '@/lib/slides/goldenRuleTypography';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import { useDangerZoneCompareReveal } from './dangerZoneReveal';
import { DangerZoneTrapReveal } from './DangerZoneTrapReveal';
import { DangerZoneCalendarMismatch } from './DangerZoneCalendarMismatch';
import { DangerZoneNormReveal } from './DangerZoneNormReveal';
import { DangerZoneScopeTrap } from './DangerZoneScopeTrap';

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
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 ring-2 ring-red-200" aria-hidden>
        <X className="h-5 w-5 text-red-600" strokeWidth={3} />
      </span>
    );
  }
  return (
    <span className="shrink-0 font-mono tabular-nums text-sm text-red-600 md:text-lg">
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
    <motion.div layout className="flex items-start gap-3">
      <TrapBullet bulletStyle={bulletStyle} index={index} itemId={item.id} />
      <div className="min-w-0 flex-1">
        <h4 className="mb-2 font-display text-base font-bold text-red-800 md:text-lg">
          {item.label || item.title || 'Pegadinha'}
        </h4>
        <p className="font-body text-base leading-relaxed text-red-900/80">
          {item.detail || item.description || ''}
        </p>
      </div>
    </motion.div>
  );
}

function DangerZoneFlipCard({
  index,
  label,
  trapText,
  correctText,
  bulletStyle,
  itemId,
  isFlipped,
  onFlip,
  prefersReducedMotion,
}: {
  index: number;
  label: string;
  trapText: string;
  correctText: string;
  bulletStyle: DangerZoneBulletStyle;
  itemId?: string;
  isFlipped: boolean;
  onFlip: () => void;
  prefersReducedMotion: boolean | null;
}) {
  const backTitle = getCompareCorrectColumnTitle(label, correctText);
  const backFaceLabel =
    backTitle === 'Resposta certa' ? 'Resposta certa' : 'Resposta correta';

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!isFlipped) onFlip();
    }
  };

  if (prefersReducedMotion) {
    return (
      <button
        type="button"
        onClick={() => !isFlipped && onFlip()}
        onKeyDown={handleKeyDown}
        aria-pressed={isFlipped}
        className={`w-full rounded-xl border p-4 text-left shadow-md transition-all ${
          isFlipped
            ? 'border-green-300 border-l-4 border-l-green-600 bg-gradient-to-br from-green-50 to-emerald-100 hover:border-green-400'
            : 'border-red-200 border-l-4 border-l-red-500 bg-gradient-to-br from-white to-red-50 hover:border-red-300 hover:shadow-lg'
        }`}
      >
        {!isFlipped ? (
          <>
            <div className="mb-2 flex items-center gap-2">
              <TrapBullet bulletStyle={bulletStyle} index={index} itemId={itemId} />
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-red-600">
                {label} — Pegadinha
              </span>
            </div>
            <p className="font-body text-sm font-bold leading-relaxed text-slate-900">{trapText}</p>
            <span className="mt-2 block font-mono text-[9px] font-bold tracking-wide text-red-500">
              Toque para revelar →
            </span>
          </>
        ) : (
          <>
            <div className="mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-700" aria-hidden />
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-green-800">
                {backFaceLabel}
              </p>
            </div>
            <p className="font-body text-sm font-semibold leading-relaxed text-green-950">{correctText || '—'}</p>
          </>
        )}
      </button>
    );
  }

  return (
    <div
      className="min-h-[128px] w-full cursor-pointer [perspective:900px]"
      onClick={() => !isFlipped && onFlip()}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-pressed={isFlipped}
      aria-label={isFlipped ? `Pegadinha ${label} revelada` : `Virar card da pegadinha ${label}`}
    >
      <div
        className={`relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] ${
          isFlipped ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        <div className="absolute inset-0 flex flex-col justify-center rounded-xl border border-red-200 border-l-4 border-l-red-500 bg-gradient-to-br from-white via-red-50/40 to-red-50 p-4 shadow-md transition-shadow hover:shadow-lg [backface-visibility:hidden]">
          <div className="mb-2 flex items-center gap-2">
            <TrapBullet bulletStyle={bulletStyle} index={index} itemId={itemId} />
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-red-600">
              {label} — Pegadinha
            </span>
          </div>
          <p className="line-clamp-4 font-body text-sm font-bold leading-relaxed text-slate-900">{trapText}</p>
          <span className="mt-2 font-mono text-[9px] font-bold tracking-wide text-red-500">
            Toque para virar →
          </span>
        </div>
        <div className="absolute inset-0 flex flex-col justify-start rounded-xl border border-green-300 border-l-4 border-l-green-600 bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 p-3.5 shadow-md [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="mb-2 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-green-700" aria-hidden />
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-green-800">
              {backFaceLabel}
            </p>
          </div>
          <p className="line-clamp-5 font-body text-sm font-semibold leading-relaxed text-green-950">
            {correctText || '—'}
          </p>
        </div>
      </div>
    </div>
  );
}

function DangerZoneCompare({
  content,
  items,
  footerRule,
  bulletStyle,
  compareRevealMode = 'auto',
}: {
  content: string;
  items: DangerZoneItem[];
  footerRule?: string;
  bulletStyle: DangerZoneBulletStyle;
  compareRevealMode?: LogicFlowRevealMode;
}) {
  const prefersReducedMotion = useReducedMotion();
  const { revealItem, isTapMode } = useDangerZoneCompareReveal(
    items.length,
    compareRevealMode,
  );
  const [flippedIndices, setFlippedIndices] = useState<Set<number>>(() => new Set());

  const handleFlip = useCallback(
    (index: number) => {
      if (isTapMode) {
        revealItem(index);
      }
      setFlippedIndices((prev) => {
        const next = new Set(prev);
        next.add(index);
        return next;
      });
    },
    [isTapMode, revealItem],
  );

  const flippedCount = flippedIndices.size;
  const allFlipped = flippedCount >= items.length;

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col items-stretch justify-start p-4 pb-6 md:p-6 md:pb-8">
      {content ? (
        <div className="mb-3 rounded-xl border border-red-300 border-l-4 border-l-red-600 bg-gradient-to-r from-red-100 to-red-50 px-4 py-3 text-center shadow-sm md:mb-4 md:px-5 md:py-3.5">
          <p className="font-display text-xs font-extrabold uppercase tracking-wide text-red-900 md:text-sm">
            {content}
          </p>
        </div>
      ) : null}

      <p className="mb-3 flex justify-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs shadow-sm">
          <span className="font-body text-slate-600">Cards virados:</span>
          <strong className="font-mono text-sm font-black tabular-nums text-red-700">{flippedCount}</strong>
          <span className="font-body text-slate-500">de {items.length}</span>
        </span>
      </p>

      <div className="space-y-3">
        {items.map((item, index) => {
          const trapText = item.detail || item.description || '';
          const correctText = typeof item.correct === 'string' ? item.correct.trim() : '';
          const label = item.label || item.title || `Ponto ${index + 1}`;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
            >
              <DangerZoneFlipCard
                index={index}
                label={label}
                trapText={trapText}
                correctText={correctText}
                bulletStyle={bulletStyle}
                itemId={item.id}
                isFlipped={flippedIndices.has(index)}
                onFlip={() => handleFlip(index)}
                prefersReducedMotion={prefersReducedMotion}
              />
            </motion.div>
          );
        })}
      </div>

      {footerRule ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 md:p-5">
          <p className="font-body text-sm italic text-red-800 md:text-base">💡 {footerRule}</p>
        </div>
      ) : null}

      {allFlipped ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-center"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" aria-hidden />
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-green-800">
            {isTapMode ? 'Todas as pegadinhas mapeadas' : 'Domínio ativado — revise antes da prova'}
          </span>
        </motion.div>
      ) : null}
    </div>
  );
}

// ============================================================================
// DANGER ZONE: Pegadinhas — list | cards | compact | compare (trap × correct)
// layout_variant compare: automático quando ≥1 item tem `correct` (string)
// bullet_style: numbered (padrão) | x_icon
// compare + reveal_mode tap: coluna correta revelada por item
// ============================================================================
export const DangerZone = ({
  content,
  theme,
  items,
  footerRule,
  layoutVariant = 'list',
  bulletStyle = 'numbered',
  compareRevealMode = 'auto',
}: DangerZoneProps) => {
  const explicitVariant = layoutVariant || 'list';

  if (explicitVariant === 'trap-reveal' && items && items.length > 0) {
    return (
      <DangerZoneTrapReveal
        content={content}
        items={items}
        theme={theme}
        footerRule={footerRule}
        bulletStyle={bulletStyle}
        compareRevealMode={compareRevealMode}
      />
    );
  }

  if (explicitVariant === 'calendar-mismatch' && items && items.length > 0) {
    return (
      <DangerZoneCalendarMismatch
        content={content}
        items={items}
        theme={theme}
        footerRule={footerRule}
        compareRevealMode={compareRevealMode}
      />
    );
  }

  if (explicitVariant === 'norm-reveal' && items && items.length > 0) {
    return (
      <DangerZoneNormReveal
        content={content}
        items={items}
        theme={theme}
        footerRule={footerRule}
        compareRevealMode={compareRevealMode}
      />
    );
  }

  if (explicitVariant === 'scope-trap' && items && items.length > 0) {
    return (
      <DangerZoneScopeTrap
        content={content}
        items={items}
        theme={theme}
        footerRule={footerRule}
        compareRevealMode={compareRevealMode}
      />
    );
  }

  const variant =
    explicitVariant === 'compare' || dangerZoneHasCompareItems(items)
      ? 'compare'
      : explicitVariant;

  // VARIANTE COMPARE — duas colunas: pegadinha × correto
  if (variant === 'compare' && items && items.length > 0) {
    return (
      <DangerZoneCompare
        content={content}
        items={items}
        footerRule={footerRule}
        bulletStyle={bulletStyle}
        compareRevealMode={compareRevealMode}
      />
    );
  }

  // VARIANTE 1: LIST (padrão) - Lista com borda vermelha
  if (variant === 'list') {
    return (
      <motion.div layout className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col items-stretch justify-start p-4 pb-8 md:p-6 md:pb-10 lg:p-8 lg:pb-12">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50/80 via-white to-red-50/50" />
        <div
          className="danger-zone-container relative z-10 mt-2 mb-4 w-full rounded-2xl border border-red-200 border-l-4 border-l-red-500 bg-red-50/40 p-5 md:mt-4 md:mb-6 md:rounded-3xl md:border-l-8 md:p-7 lg:p-9"
          style={{ minHeight: '200px' }}
        >
          <div className="danger-zone-alert-icon absolute top-4 right-4 opacity-20">
            <AlertTriangle size={100} className="text-red-500" />
          </div>
          <div className="relative z-10 space-y-4">
            <h3 className="danger-zone-title flex items-center gap-3 font-mono text-sm font-black text-red-700 md:text-2xl">
              <AlertTriangle className="h-6 w-6 shrink-0 animate-pulse md:h-7 md:w-7" strokeWidth={2} /> CUIDADO COM A PEGADINHA
            </h3>
            {content && (
              <div className="danger-zone-content rounded-xl border border-red-200 bg-white p-4 md:p-5">
                <p className="font-body text-base font-semibold leading-relaxed text-slate-900 md:text-2xl">{content}</p>
              </div>
            )}
            {items && items.length > 0 && (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="danger-zone-item rounded-xl border border-red-200 border-l-4 border-l-red-500 bg-white p-4 shadow-sm">
                    <ItemContent item={item} index={index} bulletStyle={bulletStyle} />
                  </div>
                ))}
              </div>
            )}
            {footerRule && (
              <div className="danger-zone-footer rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="font-body text-sm italic text-red-800 md:text-base">💡 {footerRule}</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // VARIANTE 2: CARDS - Itens em cards separados
  if (variant === 'cards') {
    return (
      <div className="w-full min-h-full min-w-0 flex items-center justify-center p-4 relative">
        <motion.div className="absolute inset-0 bg-gradient-to-br from-red-50/80 via-white to-red-50/50" aria-hidden />
        <div className="relative z-10 w-full max-w-5xl flex flex-col gap-6 py-5">
          {content && (
            <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-6">
              <p className="font-body text-lg font-semibold leading-relaxed text-red-900 md:text-xl">{content}</p>
            </div>
          )}
          {items && items.length > 0 && (
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-xl border-2 border-red-200 bg-white p-4 shadow-sm transition-colors hover:border-red-300"
                >
                  <ItemContent item={item} index={index} bulletStyle={bulletStyle} />
                </motion.div>
              ))}
            </motion.div>
          )}
          {footerRule && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="font-body text-sm italic text-red-800 md:text-sm">💡 {footerRule}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // VARIANTE 3: COMPACT - Layout condensado
  if (variant === 'compact') {
    return (
      <div className="w-full min-h-full min-w-0 flex items-center justify-center p-4 md:p-6 relative">
        <div className="absolute inset-0 bg-slate-50" />
        <motion.div className="relative z-10 w-full max-w-3xl space-y-4">
          <div className="flex items-center gap-2 font-mono text-sm text-red-700 md:text-lg">
            <ShieldAlert size={24} className="shrink-0" /> CUIDADO
          </div>
          {content && <p className="font-body text-base text-slate-800 md:text-lg">{content}</p>}
          {items && items.length > 0 && (
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex gap-3 border-b border-slate-200 py-2 last:border-0">
                  {bulletStyle === 'x_icon' ? (
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-red-600" strokeWidth={3} aria-hidden />
                  ) : (
                    <span className="shrink-0 font-mono tabular-nums text-sm text-red-600 md:text-base">
                      {item.id || `${index + 1}.`}
                    </span>
                  )}
                  <div className="min-w-0 text-slate-700">
                    <span className="font-display text-base font-bold text-red-800">{item.label || item.title || 'Pegadinha'}: </span>
                    <span className="font-body text-base md:text-sm">{item.detail || item.description || ''}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {footerRule && <p className="pt-2 font-body text-sm italic text-red-800">💡 {footerRule}</p>}
        </motion.div>
      </div>
    );
  }

  // Fallback: list
  return (
    <div className="relative flex min-h-full w-full min-w-0 flex-col items-center justify-start p-4 pb-8">
      <div className="absolute inset-0 bg-gradient-to-br from-red-50/80 via-white to-red-50/50" />
      <div className="relative z-10 my-4 w-full max-w-4xl rounded-2xl border border-red-200 border-l-4 border-l-red-500 bg-red-50/40 p-5">
        <h3 className="mb-4 flex items-center gap-2 font-mono text-sm font-black text-red-700 md:text-2xl">
          <AlertTriangle size={24} className="shrink-0" /> CUIDADO
        </h3>
        {content && <p className="mb-4 font-body text-base font-semibold text-slate-900 md:text-lg">{content}</p>}
        {items && items.length > 0 && items.map((item, index) => (
          <motion.div key={index} className="mb-2 rounded-lg border border-red-200 border-l-4 border-l-red-500 bg-white p-4 shadow-sm">
            <ItemContent item={item} index={index} bulletStyle={bulletStyle} />
          </motion.div>
        ))}
        {footerRule && <p className="mt-4 font-body text-sm italic text-red-800">💡 {footerRule}</p>}
      </div>
    </div>
  );
};
