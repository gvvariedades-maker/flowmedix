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

const variantStyles = {
  brand: { icon: 'text-[#166534]', bg: 'bg-[rgba(34, 197, 94,0.12)]' },
  success: { icon: 'text-green-700', bg: 'bg-green-50' },
  warning: { icon: 'text-amber-700', bg: 'bg-amber-50' },
  danger: { icon: 'text-red-700', bg: 'bg-red-50' },
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
    <div className="card-elevated p-5">
      <div className="mb-3 flex items-start justify-between">
        <span className="text-[0.6875rem] font-medium uppercase tracking-wider text-slate-500">
          {label}
        </span>
        <div className={cn('rounded-lg p-1.5', v.bg)}>
          <Icon size={16} className={v.icon} />
        </div>
      </div>
      <p
        className="mb-1 text-[2rem] font-bold leading-none text-slate-900"
        style={{ fontFamily: 'var(--font-plus-jakarta-sans)' }}
      >
        {value}
      </p>
      {delta && (
        <p className={cn('text-xs', deltaPositive ? 'text-green-600' : 'text-red-600')}>
          {deltaPositive ? '↑' : '↓'} {delta}
        </p>
      )}
    </div>
  );
}
