'use client';

import { useCallback, useState, type ComponentType, type ReactNode, type SVGProps } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CategoryStrip } from './CategoryStrip';
import { boardTone, type BoardTone } from './boardTokens';

type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { className?: string }>;

export interface PillarDeckItem {
  id?: string;
  icon?: IconComponent | null;
  title: string;
  detail?: string;
  /** Chip acima do título (ex.: rótulo do pilar). */
  category?: string;
  tone?: BoardTone;
}

export interface PillarDeckProps {
  items: PillarDeckItem[];
  /** Índice ativo controlado; omitir = interno. */
  activeIndex?: number | null;
  onActiveChange?: (index: number | null) => void;
  /** Tap só destaca (default true). Se false, cards estáticos. */
  interactive?: boolean;
  className?: string;
  /** Conteúdo extra sob o título (ex.: ícone custom). */
  renderLeading?: (item: PillarDeckItem, index: number) => ReactNode;
}

/**
 * Deck de pilares (3–4 colunas / grid) — care-pillars, CF 3 eixos.
 * Barra G2: fill saturado + barra lateral + sombra (sem branco-no-branco).
 */
export function PillarDeck({
  items,
  activeIndex: controlledActive,
  onActiveChange,
  interactive = true,
  className,
  renderLeading,
}: PillarDeckProps) {
  const reduceMotion = useReducedMotion();
  const [internalActive, setInternalActive] = useState<number | null>(null);
  const active = controlledActive !== undefined ? controlledActive : internalActive;

  const select = useCallback(
    (index: number) => {
      if (!interactive) return;
      const next = active === index ? null : index;
      if (controlledActive === undefined) setInternalActive(next);
      onActiveChange?.(next);
    },
    [active, controlledActive, interactive, onActiveChange],
  );

  if (items.length === 0) return null;

  return (
    <div className={cn('grid grid-cols-1 gap-3 min-[380px]:grid-cols-2', className)}>
      {items.map((item, index) => {
        const tone = item.tone ?? 'accent';
        const t = boardTone(tone);
        const Icon = item.icon;
        const isActive = active === index;
        const Comp = interactive ? motion.button : motion.div;
        const interactiveProps = interactive
          ? {
              type: 'button' as const,
              onClick: () => select(index),
              'aria-pressed': isActive,
            }
          : {};

        return (
          <Comp
            key={item.id ?? index}
            {...interactiveProps}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduceMotion ? 0 : index * 0.05 }}
            className={cn(
              'relative overflow-hidden rounded-2xl border-2 p-3.5 text-left shadow-md transition-shadow',
              t.panel,
              interactive && 'min-h-[44px]',
              isActive ? cn(t.heroRing) : interactive && 'hover:shadow-lg',
            )}
          >
            <span
              className={cn('pointer-events-none absolute inset-y-0 left-0 w-1.5', t.accent)}
              aria-hidden
            />
            <span
              className="pointer-events-none absolute right-2 top-1 font-mono text-3xl font-black leading-none opacity-[0.12]"
              aria-hidden
            >
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="relative pl-1.5">
              {(item.category || renderLeading) && (
                <div className="mb-2 flex items-center gap-2">
                  {item.category ? <CategoryStrip label={item.category} tone={tone} /> : null}
                  {renderLeading?.(item, index)}
                </div>
              )}
              <div className="flex gap-2">
                {Icon ? (
                  <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', t.columnLabel)} aria-hidden />
                ) : null}
                <div className="min-w-0">
                  <p className={cn('font-body text-sm font-bold leading-snug', t.text)}>
                    {item.title}
                  </p>
                  {item.detail ? (
                    <p className="mt-1 font-body text-xs font-medium leading-relaxed text-slate-700">
                      {item.detail}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </Comp>
        );
      })}
    </div>
  );
}
