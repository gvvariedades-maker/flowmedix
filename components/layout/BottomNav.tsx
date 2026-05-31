'use client';

import Link from 'next/link';
import { LayoutGroup, motion } from 'framer-motion';
import {
  BarChart2,
  BookOpen,
  ClipboardList,
  LayoutGrid,
  Menu,
  X,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOBILE_BOTTOM_NAV_Z } from '@/lib/layout/mobileBottomNav';

const NAV_ITEMS = [
  { label: 'Estudar', href: '/estudar', icon: LayoutGrid },
  { label: 'Simulados', href: '/simulados', icon: ClipboardList },
  { label: 'Progresso', href: '/progresso', icon: BarChart2 },
  { label: 'Cadernos', href: '/cadernos', icon: BookOpen },
] satisfies { label: string; href: string; icon: LucideIcon }[];

export type BottomNavProps = {
  currentPath: string;
  onMenuOpen: () => void;
  menuOpen: boolean;
};

export function BottomNav({ currentPath, onMenuOpen, menuOpen }: BottomNavProps) {
  return (
    <LayoutGroup id="bottom-nav">
      <nav
        className={cn(
          'shrink-0 inset-x-0 grid grid-cols-5 border-t border-white/[0.08] bg-[#06090f]/95 pb-safe backdrop-blur-xl md:hidden',
          MOBILE_BOTTOM_NAV_Z,
        )}
        aria-label="Navegação principal"
      >
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = currentPath.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className="flex flex-col items-center gap-0.5 px-1 py-2.5"
            >
              <Icon
                size={20}
                className={cn(
                  isActive
                    ? 'text-[#00f2ff] drop-shadow-[0_0_6px_rgba(0,242,255,0.6)]'
                    : 'text-slate-500',
                )}
                aria-hidden
              />
              {isActive ? (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="mb-0.5 h-[2px] w-6 rounded-full bg-[#00f2ff] shadow-[0_0_6px_#00f2ff]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
              ) : null}
              <span
                className={cn(
                  'text-[10px] font-semibold tracking-wide',
                  isActive ? 'text-[#00f2ff]' : 'text-slate-500',
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={onMenuOpen}
          className="flex flex-col items-center gap-0.5 px-1 py-2.5"
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuOpen}
          aria-controls={menuOpen ? 'dashboard-mobile-drawer' : undefined}
        >
          {menuOpen ? (
            <X size={20} className="text-white" aria-hidden />
          ) : (
            <Menu size={20} className="text-slate-500" aria-hidden />
          )}
          <span
            className={cn(
              'text-[10px] font-semibold tracking-wide',
              menuOpen ? 'text-white' : 'text-slate-500',
            )}
          >
            Mais
          </span>
        </button>
      </nav>
    </LayoutGroup>
  );
}
