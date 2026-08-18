'use client';

import type { ComponentType, CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import { resolveLucideIcon } from '../core/lucideIcon';
import {
  ADOLESCENTE_GENERIC_ICON_MAP,
  type AgIconTone,
  type AdolescentGenericIconName,
} from '../icons/adolescente/AdolescentGenericIcons';

export type SoftRealIconTone = AgIconTone;

const TONE: Record<
  SoftRealIconTone,
  { disc: string; ink: string; ring: string }
> = {
  emerald: {
    disc: 'from-emerald-50 via-white to-emerald-100/80',
    ink: 'text-emerald-600',
    ring: 'ring-emerald-200/80',
  },
  sky: {
    disc: 'from-sky-50 via-white to-sky-100/80',
    ink: 'text-sky-600',
    ring: 'ring-sky-200/80',
  },
  indigo: {
    disc: 'from-indigo-50 via-white to-indigo-100/80',
    ink: 'text-indigo-700',
    ring: 'ring-indigo-200/80',
  },
  orange: {
    disc: 'from-orange-50 via-white to-orange-100/90',
    ink: 'text-orange-600',
    ring: 'ring-orange-200/80',
  },
  rose: {
    disc: 'from-rose-50 via-white to-rose-100/80',
    ink: 'text-rose-600',
    ring: 'ring-rose-200/80',
  },
  teal: {
    disc: 'from-teal-50 via-white to-teal-100/80',
    ink: 'text-teal-700',
    ring: 'ring-teal-200/80',
  },
  navy: {
    disc: 'from-slate-100 via-white to-sky-100',
    ink: 'text-[#0B3A6E]',
    ring: 'ring-slate-200',
  },
  amber: {
    disc: 'from-amber-50 via-white to-amber-100/80',
    ink: 'text-amber-700',
    ring: 'ring-amber-200/80',
  },
  white: {
    disc: 'from-white/20 via-white/10 to-white/5',
    ink: 'text-emerald-200',
    ring: 'ring-white/20',
  },
};

export interface SoftRealIconProps {
  /** Nome Lucide / alias do set Adolescente. */
  name?: string;
  /** Fallback Lucide (só se não houver SVG custom). */
  icon?: ComponentType<{
    className?: string;
    strokeWidth?: number;
    absoluteStrokeWidth?: boolean;
    fill?: string;
    style?: CSSProperties;
  }>;
  tone?: SoftRealIconTone;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Sem disco — só o glyph (chips escuros). */
  bare?: boolean;
}

const SIZE = {
  sm: { disc: 'h-9 w-9 rounded-xl', glyph: 'h-6 w-6' },
  md: { disc: 'h-12 w-12 rounded-2xl', glyph: 'h-8 w-8' },
  lg: { disc: 'h-14 w-14 rounded-2xl', glyph: 'h-9 w-9' },
} as const;

/**
 * Disco glanceable + SVG soft-3D do set Adolescente (fallback Lucide).
 */
export function SoftRealIcon({
  name,
  icon,
  tone = 'navy',
  size = 'md',
  className,
  bare = false,
}: SoftRealIconProps) {
  const dim = SIZE[size];
  const t = TONE[tone];
  const customKey = name as AdolescentGenericIconName | undefined;
  const CustomIcon = customKey ? ADOLESCENTE_GENERIC_ICON_MAP[customKey] : undefined;

  const glyph = CustomIcon ? (
    <CustomIcon tone={tone} className={dim.glyph} />
  ) : (
    (() => {
      const Icon =
        icon ??
        (resolveLucideIcon(name) as ComponentType<{
          className?: string;
          strokeWidth?: number;
          fill?: string;
          style?: CSSProperties;
        }>);
      return (
        <Icon
          className={cn(dim.glyph, t.ink)}
          strokeWidth={2}
          fill="currentColor"
          style={{ fillOpacity: 0.35 } as CSSProperties}
          aria-hidden
        />
      );
    })()
  );

  if (bare) {
    return <span className={cn('inline-flex items-center justify-center', className)}>{glyph}</span>;
  }

  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center bg-gradient-to-br shadow-md shadow-slate-900/10 ring-1',
        dim.disc,
        t.disc,
        t.ring,
        className,
      )}
    >
      <span
        className="pointer-events-none absolute inset-[2px] rounded-[inherit] bg-gradient-to-b from-white/70 to-transparent opacity-80"
        aria-hidden
      />
      <span className="relative z-[1]">{glyph}</span>
    </span>
  );
}
