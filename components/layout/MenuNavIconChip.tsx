'use client';

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export const MENU_ICON_STROKE = 2 as const;

export const MENU_NAV_ACTIVE = {
  row: 'bg-[var(--color-brand)]/10',
  bar: 'bg-[var(--color-brand)]',
  label: 'text-[var(--color-brand-text)]',
} as const;

/** Linha de nav inativa — hover mais legível que slate-100 sobre branco. */
export const MENU_NAV_ROW_IDLE =
  'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900';

/** Chip/ícone inativo — monocromático; cor do accent só no item ativo. */
const MENU_CHIP_IDLE = {
  chip: 'bg-slate-100',
  icon: 'text-slate-500',
} as const;

export type MenuAccentKey =
  | 'brand'
  | 'cyan'
  | 'sky'
  | 'violet'
  | 'emerald'
  | 'amber'
  | 'rose'
  | 'teal'
  | 'indigo'
  | 'slate';

export const MENU_ACCENT_STYLES: Record<
  MenuAccentKey,
  {
    chip: string;
    chipActive: string;
    icon: string;
    iconActive: string;
    glow: string;
    rowActive: string;
    bar: string;
    labelActive: string;
  }
> = {
  brand: {
    chip: 'bg-slate-100',
    chipActive: 'bg-[var(--color-brand)]/18',
    icon: 'text-slate-500',
    iconActive: 'text-[var(--color-brand-text)]',
    glow: 'shadow-sm',
    rowActive: 'bg-[var(--color-brand)]/10',
    bar: 'bg-[var(--color-brand)]',
    labelActive: 'text-[var(--color-brand-text)]',
  },
  cyan: {
    chip: 'bg-cyan-50',
    chipActive: 'bg-cyan-100',
    icon: 'text-cyan-600/75',
    iconActive: 'text-cyan-700',
    glow: 'shadow-sm',
    rowActive: 'bg-cyan-50',
    bar: 'bg-cyan-500',
    labelActive: 'text-cyan-700',
  },
  sky: {
    chip: 'bg-sky-50',
    chipActive: 'bg-sky-100',
    icon: 'text-sky-600/75',
    iconActive: 'text-sky-700',
    glow: 'shadow-sm',
    rowActive: 'bg-sky-50',
    bar: 'bg-sky-500',
    labelActive: 'text-sky-700',
  },
  violet: {
    chip: 'bg-violet-50',
    chipActive: 'bg-violet-100',
    icon: 'text-violet-600/75',
    iconActive: 'text-violet-700',
    glow: 'shadow-sm',
    rowActive: 'bg-violet-50',
    bar: 'bg-violet-500',
    labelActive: 'text-violet-700',
  },
  emerald: {
    chip: 'bg-emerald-50',
    chipActive: 'bg-emerald-100',
    icon: 'text-emerald-600/75',
    iconActive: 'text-emerald-700',
    glow: 'shadow-sm',
    rowActive: 'bg-emerald-50',
    bar: 'bg-emerald-500',
    labelActive: 'text-emerald-700',
  },
  amber: {
    chip: 'bg-amber-50',
    chipActive: 'bg-amber-100',
    icon: 'text-amber-600/75',
    iconActive: 'text-amber-700',
    glow: 'shadow-sm',
    rowActive: 'bg-amber-50',
    bar: 'bg-amber-500',
    labelActive: 'text-amber-700',
  },
  rose: {
    chip: 'bg-rose-50',
    chipActive: 'bg-rose-100',
    icon: 'text-rose-600/75',
    iconActive: 'text-rose-700',
    glow: 'shadow-sm',
    rowActive: 'bg-rose-50',
    bar: 'bg-rose-500',
    labelActive: 'text-rose-700',
  },
  teal: {
    chip: 'bg-teal-50',
    chipActive: 'bg-teal-100',
    icon: 'text-teal-600/75',
    iconActive: 'text-teal-700',
    glow: 'shadow-sm',
    rowActive: 'bg-teal-50',
    bar: 'bg-teal-500',
    labelActive: 'text-teal-700',
  },
  indigo: {
    chip: 'bg-indigo-50',
    chipActive: 'bg-indigo-100',
    icon: 'text-indigo-600/75',
    iconActive: 'text-indigo-700',
    glow: 'shadow-sm',
    rowActive: 'bg-indigo-50',
    bar: 'bg-indigo-500',
    labelActive: 'text-indigo-700',
  },
  slate: {
    chip: 'bg-slate-100',
    chipActive: 'bg-slate-200',
    icon: 'text-slate-500',
    iconActive: 'text-slate-800',
    glow: 'shadow-sm',
    rowActive: 'bg-slate-100',
    bar: 'bg-slate-400',
    labelActive: 'text-slate-800',
  },
};

type MenuNavIconChipProps = {
  icon: LucideIcon;
  accent: MenuAccentKey;
  active: boolean;
  size?: 'sidebar' | 'bottom';
};

export function MenuNavIconChip({
  icon: Icon,
  accent,
  active,
  size = 'sidebar',
}: MenuNavIconChipProps) {
  const styles = MENU_ACCENT_STYLES[accent];
  const isBottom = size === 'bottom';

  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center border transition-all duration-200',
        isBottom ? 'h-8 w-8 rounded-xl' : 'h-9 w-9 rounded-xl',
        active
          ? cn(
              styles.chipActive,
              styles.glow,
              accent === 'brand' ? 'border-[var(--color-brand)]/40' : 'border-slate-300',
            )
          : cn(MENU_CHIP_IDLE.chip, 'border-slate-200/90'),
      )}
      aria-hidden
    >
      <Icon
        size={isBottom ? 16 : 18}
        strokeWidth={MENU_ICON_STROKE}
        className={cn(
          'transition-colors',
          active ? styles.iconActive : MENU_CHIP_IDLE.icon,
        )}
      />
    </span>
  );
}
