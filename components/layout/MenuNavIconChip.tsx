'use client';

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export const MENU_ICON_STROKE = 2 as const;

export type MenuAccentKey =
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
  cyan: {
    chip: 'bg-[#00f2ff]/10',
    chipActive: 'bg-[#00f2ff]/22',
    icon: 'text-cyan-400/80',
    iconActive: 'text-[#00f2ff]',
    glow: 'shadow-[0_0_14px_rgba(0,242,255,0.3)]',
    rowActive: 'bg-[#00f2ff]/[0.08]',
    bar: 'bg-[#00f2ff]',
    labelActive: 'text-[#00f2ff]',
  },
  sky: {
    chip: 'bg-sky-500/10',
    chipActive: 'bg-sky-500/22',
    icon: 'text-sky-400/80',
    iconActive: 'text-sky-300',
    glow: 'shadow-[0_0_14px_rgba(56,189,248,0.28)]',
    rowActive: 'bg-sky-500/[0.08]',
    bar: 'bg-sky-400',
    labelActive: 'text-sky-300',
  },
  violet: {
    chip: 'bg-violet-500/10',
    chipActive: 'bg-violet-500/22',
    icon: 'text-violet-400/80',
    iconActive: 'text-violet-300',
    glow: 'shadow-[0_0_14px_rgba(139,92,246,0.32)]',
    rowActive: 'bg-violet-500/[0.08]',
    bar: 'bg-violet-400',
    labelActive: 'text-violet-300',
  },
  emerald: {
    chip: 'bg-[#00ff88]/10',
    chipActive: 'bg-[#00ff88]/22',
    icon: 'text-emerald-400/80',
    iconActive: 'text-[#00ff88]',
    glow: 'shadow-[0_0_14px_rgba(0,255,136,0.28)]',
    rowActive: 'bg-[#00ff88]/[0.08]',
    bar: 'bg-[#00ff88]',
    labelActive: 'text-[#00ff88]',
  },
  amber: {
    chip: 'bg-amber-500/10',
    chipActive: 'bg-amber-500/22',
    icon: 'text-amber-400/80',
    iconActive: 'text-amber-300',
    glow: 'shadow-[0_0_14px_rgba(251,191,36,0.28)]',
    rowActive: 'bg-amber-500/[0.08]',
    bar: 'bg-amber-400',
    labelActive: 'text-amber-300',
  },
  rose: {
    chip: 'bg-rose-500/10',
    chipActive: 'bg-rose-500/22',
    icon: 'text-rose-400/80',
    iconActive: 'text-rose-300',
    glow: 'shadow-[0_0_14px_rgba(251,113,133,0.28)]',
    rowActive: 'bg-rose-500/[0.08]',
    bar: 'bg-rose-400',
    labelActive: 'text-rose-300',
  },
  teal: {
    chip: 'bg-teal-500/10',
    chipActive: 'bg-teal-500/22',
    icon: 'text-teal-400/80',
    iconActive: 'text-teal-300',
    glow: 'shadow-[0_0_14px_rgba(45,212,191,0.28)]',
    rowActive: 'bg-teal-500/[0.08]',
    bar: 'bg-teal-400',
    labelActive: 'text-teal-300',
  },
  indigo: {
    chip: 'bg-indigo-500/10',
    chipActive: 'bg-indigo-500/22',
    icon: 'text-indigo-400/80',
    iconActive: 'text-indigo-300',
    glow: 'shadow-[0_0_14px_rgba(129,140,248,0.28)]',
    rowActive: 'bg-indigo-500/[0.08]',
    bar: 'bg-indigo-400',
    labelActive: 'text-indigo-300',
  },
  slate: {
    chip: 'bg-white/[0.05]',
    chipActive: 'bg-white/[0.12]',
    icon: 'text-slate-400',
    iconActive: 'text-white',
    glow: 'shadow-[0_0_12px_rgba(255,255,255,0.12)]',
    rowActive: 'bg-white/[0.06]',
    bar: 'bg-slate-300',
    labelActive: 'text-white',
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
        'flex shrink-0 items-center justify-center border border-white/[0.04] transition-all duration-200',
        isBottom ? 'h-8 w-8 rounded-lg' : 'h-9 w-9 rounded-xl',
        active ? cn(styles.chipActive, styles.glow, 'border-white/10') : styles.chip,
      )}
      aria-hidden
    >
      <Icon
        size={isBottom ? 16 : 18}
        strokeWidth={MENU_ICON_STROKE}
        className={cn('transition-colors', active ? styles.iconActive : styles.icon)}
      />
    </span>
  );
}
