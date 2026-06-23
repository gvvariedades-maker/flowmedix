'use client';

import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
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
import { DangerZoneRouteTrap } from './DangerZoneRouteTrap';
import { DangerZoneDoseTrap } from './DangerZoneDoseTrap';
import { DangerZoneCatheterArena } from './DangerZoneCatheterArena';
import { DangerZoneLabPrepTrap } from './DangerZoneLabPrepTrap';
import { DangerZoneLabSpecimenArena } from './DangerZoneLabSpecimenArena';
import { DangerZoneDressingChoiceArena } from './DangerZoneDressingChoiceArena';
import { DangerZonePniTrapChips } from './DangerZonePniTrapChips';
import { DangerZoneIstTrapChips } from './DangerZoneIstTrapChips';
import { DangerZoneAdolescentConsentGate } from './DangerZoneAdolescentConsentGate';
import { DangerZoneVitalsClassifyArena } from './DangerZoneVitalsClassifyArena';

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
}) {
  const backTitle = getCompareCorrectColumnTitle(label, correctText);
  const backFaceLabel =
    backTitle === 'Resposta certa' ? 'Resposta certa' : 'Resposta correta';
  const showCorrect = !isTapMode || isRevealed;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-l-4 border-l-red-500 bg-gradient-to-br from-red-50 to-white p-4">
        <div className="flex items-start gap-3">
          <TrapBullet bulletStyle={bulletStyle} index={index} itemId={itemId} />
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-red-600">
              {label} — Pegadinha
            </p>
            <p className="mt-1.5 font-body text-sm font-semibold leading-relaxed text-slate-900">
              {trapText}
            </p>
          </div>
        </div>
      </div>

      {showCorrect ? (
        <div className="border-t border-slate-100 border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-50 to-white p-4">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-800">
                {backFaceLabel}
              </p>
              <p className="mt-1 font-body text-sm font-semibold leading-relaxed text-emerald-950">
                {correctText || '—'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={onReveal}
          className="w-full border-t border-red-100 bg-white px-4 py-3 text-center font-body text-sm font-semibold text-red-700 transition-colors hover:bg-red-50 active:bg-red-100"
        >
          Ver resposta correta
        </button>
      )}
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
  const { revealItem, isTapMode } = useDangerZoneCompareReveal(
    items.length,
    compareRevealMode,
  );
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

  const revealedCount = isTapMode
    ? revealedIndices.size
    : items.length;
  const allRevealed = revealedCount >= items.length;

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col items-stretch justify-start p-4 pb-6 md:p-6 md:pb-8">
      {content ? (
        <div className="mb-3 rounded-xl border border-red-300 border-l-4 border-l-red-600 bg-gradient-to-r from-red-100 to-red-50 px-4 py-3 text-center shadow-sm md:mb-4 md:px-5 md:py-3.5">
          <p className="font-display text-xs font-extrabold uppercase tracking-wide text-red-900 md:text-sm">
            {content}
          </p>
        </div>
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

      {allRevealed ? (
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

  if (explicitVariant === 'catheter-danger-arena' && items && items.length > 0) {
    return (
      <DangerZoneCatheterArena
        content={content}
        items={items}
        theme={theme}
        footerRule={footerRule}
      />
    );
  }

  if (explicitVariant === 'lab-prep-trap' && items && items.length > 0) {
    return (
      <DangerZoneLabPrepTrap
        content={content}
        items={items}
        theme={theme}
        footerRule={footerRule}
        compareRevealMode={compareRevealMode}
      />
    );
  }

  if (explicitVariant === 'lab-specimen-arena' && items && items.length > 0) {
    return (
      <DangerZoneLabSpecimenArena
        content={content}
        items={items}
        theme={theme}
        footerRule={footerRule}
      />
    );
  }

  if (explicitVariant === 'dressing-choice-arena' && items && items.length > 0) {
    return (
      <DangerZoneDressingChoiceArena
        content={content}
        items={items}
        theme={theme}
        footerRule={footerRule}
      />
    );
  }

  if (explicitVariant === 'pni-trap-chips' && items && items.length > 0) {
    return (
      <DangerZonePniTrapChips
        content={content}
        items={items}
        theme={theme}
        footerRule={footerRule}
        compareRevealMode={compareRevealMode}
      />
    );
  }

  if (explicitVariant === 'ist-trap-chips' && items && items.length > 0) {
    return (
      <DangerZoneIstTrapChips
        content={content}
        items={items}
        theme={theme}
        footerRule={footerRule}
        compareRevealMode={compareRevealMode}
      />
    );
  }

  if (explicitVariant === 'adolescent-consent-gate' && items && items.length > 0) {
    return (
      <DangerZoneAdolescentConsentGate
        content={content}
        items={items}
        theme={theme}
        footerRule={footerRule}
        compareRevealMode={compareRevealMode}
      />
    );
  }

  if (explicitVariant === 'vitals-classify-arena' && items && items.length > 0) {
    return (
      <DangerZoneVitalsClassifyArena
        content={content}
        items={items}
        theme={theme}
        footerRule={footerRule}
      />
    );
  }

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

  if (explicitVariant === 'route-trap' && items && items.length > 0) {
    return (
      <DangerZoneRouteTrap
        content={content}
        items={items}
        theme={theme}
        footerRule={footerRule}
        compareRevealMode={compareRevealMode}
      />
    );
  }

  if (explicitVariant === 'dose-trap' && items && items.length > 0) {
    return (
      <DangerZoneDoseTrap
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
