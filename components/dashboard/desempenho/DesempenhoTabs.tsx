'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const TABS = [
  {
    id: 'estudo',
    label: 'Estudo',
    href: '/desempenho',
    isActive: (pathname: string) => pathname === '/desempenho',
  },
  {
    id: 'simulados',
    label: 'Simulados',
    href: '/desempenho/simulados',
    isActive: (pathname: string) =>
      pathname === '/desempenho/simulados' || pathname.startsWith('/desempenho/simulados/'),
  },
  {
    id: 'atividade',
    label: 'Atividade',
    href: '/desempenho/atividade',
    isActive: (pathname: string) =>
      pathname === '/desempenho/atividade' || pathname.startsWith('/desempenho/atividade/'),
  },
] as const;

type DesempenhoTabsProps = {
  className?: string;
};

/** Abas por link do hub `/desempenho` (Estudo · Simulados · Atividade). */
export function DesempenhoTabs({ className }: DesempenhoTabsProps) {
  const pathname = usePathname() ?? '';

  return (
    <div
      role="tablist"
      aria-label="Seções de desempenho"
      className={cn(
        'inline-flex max-w-full rounded-xl border border-slate-200 bg-slate-50/80 p-1',
        className,
      )}
    >
      {TABS.map((tab) => {
        const active = tab.isActive(pathname);
        return (
          <Link
            key={tab.id}
            href={tab.href}
            role="tab"
            aria-selected={active}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'min-h-11 flex-1 rounded-lg px-3 py-2 text-center text-sm font-semibold transition-colors sm:flex-none sm:px-4',
              active
                ? 'bg-white text-[var(--color-brand)] shadow-sm ring-1 ring-[var(--color-brand-ring)]'
                : 'text-slate-600 hover:bg-white/70 hover:text-slate-900',
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
