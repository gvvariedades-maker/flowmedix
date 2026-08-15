import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export type ScoreCardVariant = 'neutral' | 'brand' | 'success' | 'warning' | 'danger';

interface ScoreCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaPositive?: boolean;
  icon: LucideIcon;
  variant?: ScoreCardVariant;
}

/** Tipografia canônica de KPI no dashboard (ScoreCard + analytics). */
export const KPI_VALUE_CLASS =
  'font-display text-[1.625rem] font-bold leading-none tracking-tight tabular-nums';

const variantStyles: Record<
  ScoreCardVariant,
  { icon: string; bg: string; value: string }
> = {
  neutral: {
    icon: 'text-slate-600',
    bg: 'bg-slate-100',
    value: 'text-slate-800',
  },
  brand: {
    icon: 'text-[var(--color-brand-text)]',
    bg: 'bg-[var(--color-brand-dim)]',
    value: 'text-[var(--color-brand-text)]',
  },
  success: {
    icon: 'text-[var(--color-success-text)]',
    bg: 'bg-[var(--color-success-dim)]',
    value: 'text-[var(--color-success-text)]',
  },
  warning: {
    icon: 'text-[var(--color-warning-text)]',
    bg: 'bg-[var(--color-warning-dim)]',
    value: 'text-[var(--color-warning-text)]',
  },
  danger: {
    icon: 'text-[var(--color-danger-text)]',
    bg: 'bg-[var(--color-danger-dim)]',
    value: 'text-[var(--color-danger-text)]',
  },
};

export function ScoreCard({
  label,
  value,
  delta,
  deltaPositive,
  icon: Icon,
  variant = 'brand',
}: ScoreCardProps) {
  const v = variantStyles[variant];
  return (
    <div className="metric-card p-5" data-variant={variant}>
      <div className="mb-3 flex items-start justify-between">
        <span className="text-[0.6875rem] font-medium uppercase tracking-wider text-slate-500">
          {label}
        </span>
        <div className={cn('rounded-lg p-1.5', v.bg)}>
          <Icon size={16} className={v.icon} />
        </div>
      </div>
      <p className={cn(KPI_VALUE_CLASS, 'mb-1', v.value)}>{value}</p>
      {delta && (
        <p
          className={cn(
            'text-xs',
            deltaPositive
              ? 'text-[var(--color-success-text)]'
              : 'text-[var(--color-danger)]',
          )}
        >
          {deltaPositive ? '↑' : '↓'} {delta}
        </p>
      )}
    </div>
  );
}
