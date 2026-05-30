import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

type SimuladosBackLinkProps = {
  className?: string;
  /** Texto do link (padrão: hub). */
  label?: string;
};

export function SimuladosBackLink({ className, label = 'Simulados' }: SimuladosBackLinkProps) {
  return (
    <Link
      href="/simulados"
      className={cn(
        'inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-slate-400 transition-colors hover:text-slate-200',
        className,
      )}
    >
      <ArrowLeft className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
      {label}
    </Link>
  );
}
