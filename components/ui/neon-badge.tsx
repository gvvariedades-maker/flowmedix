import { cn } from '@/lib/utils';

type BadgeVariant = 'brand' | 'success' | 'warning' | 'danger' | 'violet' | 'neutral';

const variants: Record<BadgeVariant, string> = {
  brand: 'border-[rgba(34,197,94,0.35)] bg-[rgba(34,197,94,0.12)] text-[#166534]',
  success: 'border-green-200 bg-green-50 text-green-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  danger: 'border-red-200 bg-red-50 text-red-700',
  violet: 'border-violet-200 bg-violet-50 text-violet-700',
  neutral: 'border-slate-200 bg-slate-50 text-slate-600',
};

interface NeonBadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function NeonBadge({ children, variant = 'neutral', className }: NeonBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5',
        'text-[0.6rem] font-semibold uppercase tracking-wider',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
