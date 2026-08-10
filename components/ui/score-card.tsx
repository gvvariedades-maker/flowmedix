import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface ScoreCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaPositive?: boolean;
  icon: LucideIcon;
  variant?: 'brand' | 'success' | 'warning' | 'danger';
}

/** Tipografia canônica de KPI no dashboard (ScoreCard + analytics). */
export const KPI_VALUE_CLASS =
  'font-display text-[1.625rem] font-bold leading-none tracking-tight tabular-nums';

const variantStyles = {
  brand: {
    icon: 'text-[var(--color-brand-text)]',
    bg: 'bg-[var(--color-brand-dim)]',
  },
  success: {
    icon: 'text-[var(--color-success-text)]',
    bg: 'bg-[var(--color-success-dim)]',
  },
  warning: {
    icon: 'text-[var(--color-warning-text)]',
    bg: 'bg-[var(--color-warning-dim)]',
  },
  danger: {
    icon: 'text-[var(--color-danger-text)]',
    bg: 'bg-[var(--color-danger-dim)]',
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
    <div className="metric-card p-5">
      <div className="mb-3 flex items-start justify-between">
        <span className="text-[0.6875rem] font-medium uppercase tracking-wider text-slate-500">
          {label}
        </span>
        <div className={cn('rounded-lg p-1.5', v.bg)}>
          <Icon size={16} className={v.icon} />
        </div>
      </div>
      <p className={cn(KPI_VALUE_CLASS, 'mb-1 text-slate-900')}>{value}</p>
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
