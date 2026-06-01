'use client';

import { memo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { SimuladoQuestaoItem } from '@/lib/simulado/types';
import { cn } from '@/lib/utils';

/** Acima deste limite o mapa usa scroll horizontal virtualizado. */
export const SIMULADO_MAP_VIRTUAL_THRESHOLD = 40;

const MAP_CELL_GAP_PX = 8;
const MAP_CELL_SIZE_PX = 32;

export type SimuladoMapVariant = 'treino' | 'prova';

export type SimuladoMapCellProps = {
  item: SimuladoQuestaoItem;
  isActive: boolean;
  variant: SimuladoMapVariant;
  onSelect: (slug: string) => void;
};

function mapCellPropsAreEqual(prev: SimuladoMapCellProps, next: SimuladoMapCellProps): boolean {
  if (prev.variant !== next.variant) return false;
  if (prev.isActive !== next.isActive) return false;
  if (prev.item.ordem !== next.item.ordem) return false;
  if (prev.item.modulo_slug !== next.item.modulo_slug) return false;
  if (prev.item.respondida !== next.item.respondida) return false;
  if (prev.variant === 'treino' && prev.item.respondida && next.item.respondida) {
    return prev.item.acertou === next.item.acertou;
  }
  return true;
}

export const SimuladoMapCell = memo(function SimuladoMapCell({
  item,
  isActive,
  variant,
  onSelect,
}: SimuladoMapCellProps) {
  const answeredNeutral =
    item.respondida && variant === 'prova' && !isActive;

  return (
    <button
      type="button"
      onClick={() => onSelect(item.modulo_slug)}
      className={cn(
        'h-8 min-w-8 shrink-0 rounded-lg border px-2 text-xs font-semibold',
        isActive
          ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300'
          : answeredNeutral
            ? 'border-white/15 bg-white/[0.06] text-slate-200'
            : item.respondida
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border-white/10 bg-white/[0.03] text-slate-300',
      )}
      aria-current={isActive ? 'step' : undefined}
      aria-label={`Questão ${item.ordem}${item.respondida ? ', respondida' : ', pendente'}`}
    >
      {item.ordem}
    </button>
  );
}, mapCellPropsAreEqual);

type SimuladoQuestionMapProps = {
  questoes: SimuladoQuestaoItem[];
  activeSlug: string | null;
  variant?: SimuladoMapVariant;
  onSelect: (slug: string) => void;
};

function SimuladoQuestionMapFlex({
  questoes,
  activeSlug,
  variant = 'treino',
  onSelect,
}: SimuladoQuestionMapProps) {
  return (
    <div
      className="flex flex-wrap gap-2"
      style={{ contentVisibility: 'auto' }}
      data-testid="simulado-question-map-flex"
    >
      {questoes.map((item) => (
        <SimuladoMapCell
          key={`${item.ordem}-${item.modulo_slug}`}
          item={item}
          isActive={activeSlug === item.modulo_slug}
          variant={variant}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

function SimuladoQuestionMapVirtual({
  questoes,
  activeSlug,
  variant = 'treino',
  onSelect,
}: SimuladoQuestionMapProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const stride = MAP_CELL_SIZE_PX + MAP_CELL_GAP_PX;

  const virtualizer = useVirtualizer({
    count: questoes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => stride,
    horizontal: true,
    overscan: 8,
  });

  return (
    <div
      ref={parentRef}
      className="overflow-x-auto pb-1"
      style={{ contentVisibility: 'auto' }}
      data-testid="simulado-question-map-virtual"
      role="list"
      aria-label="Mapa de questões"
    >
      <div
        className="relative h-8"
        style={{ width: virtualizer.getTotalSize(), minWidth: '100%' }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const item = questoes[virtualItem.index];
          if (!item) return null;

          return (
            <div
              key={`${item.ordem}-${item.modulo_slug}`}
              className="absolute top-0 left-0"
              style={{
                width: MAP_CELL_SIZE_PX,
                transform: `translateX(${virtualItem.start}px)`,
              }}
              role="listitem"
            >
              <SimuladoMapCell
                item={item}
                isActive={activeSlug === item.modulo_slug}
                variant={variant}
                onSelect={onSelect}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const SimuladoQuestionMap = memo(function SimuladoQuestionMap(props: SimuladoQuestionMapProps) {
  if (props.questoes.length > SIMULADO_MAP_VIRTUAL_THRESHOLD) {
    return <SimuladoQuestionMapVirtual {...props} />;
  }
  return <SimuladoQuestionMapFlex {...props} />;
});
