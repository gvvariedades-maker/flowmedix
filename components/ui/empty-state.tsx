import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  /** `href` para RSC/Link; `onClick` para client components. */
  action?: { label: string; onClick?: () => void; href?: string };
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <Icon size={36} className="text-slate-400" />
      </div>
      <h3 className="mb-2 text-base font-semibold text-slate-900">{title}</h3>
      <p className="mb-6 max-w-xs text-sm leading-relaxed text-slate-500">{description}</p>
      {action?.href ? (
        <Link href={action.href} className="btn-editorial-primary">
          {action.label}
        </Link>
      ) : action?.onClick ? (
        <button type="button" onClick={action.onClick} className="btn-editorial-primary">
          {action.label}
        </button>
      ) : null}
    </div>
  );
}
