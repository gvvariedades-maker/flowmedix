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
  brand:   { icon: 'text-[#67e8f9]', bg: 'bg-[rgba(0,242,255,0.08)]' },
  success: { icon: 'text-[#6ee7b7]', bg: 'bg-[rgba(0,255,136,0.08)]' },
  warning: { icon: 'text-[#fbbf24]', bg: 'bg-[rgba(255,184,0,0.08)]' },
  danger:  { icon: 'text-[#fda4af]', bg: 'bg-[rgba(255,0,85,0.08)]' },
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
    <div className="rounded-xl bg-[#0d1117] border border-white/10 p-5">
      <div className="flex items-start justify-between mb-3">
        <span className="text-[0.6875rem] font-medium uppercase tracking-wider text-[#8b949e]">
          {label}
        </span>
        <div className={cn('p-1.5 rounded-lg', v.bg)}>
          <Icon size={16} className={v.icon} />
        </div>
      </div>
      <p
        className="text-[2rem] font-bold leading-none text-[#e6edf3] mb-1"
        style={{ fontFamily: 'var(--font-plus-jakarta-sans)' }}
      >
        {value}
      </p>
      {delta && (
        <p className={cn('text-xs', deltaPositive ? 'text-[#6ee7b7]' : 'text-[#fda4af]')}>
          {deltaPositive ? '↑' : '↓'} {delta}
        </p>
      )}
    </div>
  );
}
