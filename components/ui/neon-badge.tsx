import { cn } from '@/lib/utils';

type BadgeVariant = 'brand' | 'success' | 'warning' | 'danger' | 'violet' | 'neutral';

const variants: Record<BadgeVariant, string> = {
  brand:   'bg-[rgba(0,242,255,0.08)] border-[rgba(0,242,255,0.25)] text-[#67e8f9]',
  success: 'bg-[rgba(0,255,136,0.08)] border-[rgba(0,255,136,0.25)] text-[#6ee7b7]',
  warning: 'bg-[rgba(255,184,0,0.08)] border-[rgba(255,184,0,0.30)] text-[#fbbf24]',
  danger:  'bg-[rgba(255,0,85,0.08)]  border-[rgba(255,0,85,0.30)]  text-[#fda4af]',
  violet:  'bg-[rgba(139,92,246,0.10)] border-[rgba(139,92,246,0.30)] text-[#c4b5fd]',
  neutral: 'bg-white/[0.06] border-white/[0.12] text-[#8b949e]',
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
        'inline-flex items-center px-2 py-0.5 rounded-full',
        'text-[0.6rem] font-semibold uppercase tracking-wider border',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
