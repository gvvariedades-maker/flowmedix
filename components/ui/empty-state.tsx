import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      <div className="mb-5 p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
        <Icon size={36} className="text-[#484f58]" />
      </div>
      <h3 className="text-[#e6edf3] text-base font-semibold mb-2">{title}</h3>
      <p className="text-[#8b949e] text-sm max-w-xs leading-relaxed mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-5 py-2.5 rounded-lg bg-[rgba(0,242,255,0.10)] border border-[rgba(0,242,255,0.30)]
            text-[#67e8f9] text-sm font-medium hover:bg-[rgba(0,242,255,0.18)] transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
