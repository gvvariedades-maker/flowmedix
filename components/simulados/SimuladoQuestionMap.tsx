'use client';

import { memo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { SimuladoQuestaoItem } from '@/lib/simulado/types';
import { cn } from '@/lib/utils';

/** Acima deste limite o mapa usa scroll horizontal virtualizado. */
export const SIMULADO_MAP_VIRTUAL_THRESHOLD = 40;

const MAP_CELL_GAP_PX = 8;
const MAP_CELL_SIZE_PX = 44;

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
        'h-11 min-w-11 shrink-0 rounded-lg border px-2 text-sm font-semibold transition-colors',
        isActive
          ? 'border-[rgba(34, 197, 94,0.45)] bg-[rgba(34, 197, 94,0.12)] text-[#166534]'
          : answeredNeutral
            ? 'border-slate-300 bg-slate-100 text-slate-700'
            : item.respondida
              ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
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

  // TanStack Virtual expõe funções instáveis — uso intencional; React Compiler ignora memoização aqui.
  // eslint-disable-next-line react-hooks/incompatible-library -- API oficial da lib
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
        className="relative h-11"
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
