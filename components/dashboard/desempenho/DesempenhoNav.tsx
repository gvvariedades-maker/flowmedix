'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const SECTIONS = [
  {
    id: 'estudo',
    label: 'Estudo',
    href: '/desempenho',
    isActive: (pathname: string) =>
      pathname === '/desempenho' ||
      pathname.startsWith('/desempenho/mapa') ||
      pathname.startsWith('/desempenho/historico'),
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
    label: 'Hábitos',
    href: '/desempenho/atividade',
    isActive: (pathname: string) =>
      pathname === '/desempenho/atividade' || pathname.startsWith('/desempenho/atividade/'),
  },
] as const;

type DesempenhoNavProps = {
  className?: string;
};

/**
 * Navegação do hub `/desempenho` — três **páginas**, não abas de um widget.
 *
 * Por isso `<nav>` + links + `aria-current="page"`: `role="tablist"`/`role="tab"`
 * prometeria painéis controlados no mesmo documento (`aria-controls`, setas),
 * o que não existe aqui e engana leitor de tela.
 */
export function DesempenhoNav({ className }: DesempenhoNavProps) {
  const pathname = usePathname() ?? '';

  return (
    <nav aria-label="Seções de desempenho" className={cn('max-w-full', className)}>
      <ul className="inline-flex max-w-full rounded-xl border border-slate-200 bg-slate-50/80 p-1">
        {SECTIONS.map((section) => {
          const active = section.isActive(pathname);
          return (
            <li key={section.id} className="flex-1 sm:flex-none">
              <Link
                href={section.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex min-h-11 items-center justify-center rounded-lg px-3 py-2 text-center text-sm font-semibold transition-colors sm:px-4',
                  active
                    ? 'bg-white text-[var(--color-brand)] shadow-sm ring-1 ring-[var(--color-brand-ring)]'
                    : 'text-slate-600 hover:bg-white/70 hover:text-slate-900',
                )}
              >
                {section.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
