'use client';

import Link from 'next/link';
import { createPortal } from 'react-dom';
import { forwardRef, useEffect, useState } from 'react';
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
import { MOBILE_BOTTOM_NAV_FIXED, MOBILE_BOTTOM_NAV_Z } from '@/lib/layout/mobileBottomNav';

const NAV_ITEMS = [
  { label: 'Estudar', href: '/estudar', icon: LayoutGrid },
  { label: 'Simulados', href: '/simulados', icon: ClipboardList },
  { label: 'Progresso', href: '/progresso', icon: BarChart2 },
  { label: 'Cadernos', href: '/cadernos', icon: BookOpen },
] satisfies { label: string; href: string; icon: LucideIcon }[];

export type BottomNavProps = {
  currentPath: string;
  onMenuToggle: () => void;
  menuOpen: boolean;
  /** Modal de questão sobre a vitrine — isola nav do leitor de tela e da ordem de tab. */
  questaoModalOpen?: boolean;
};

export const BottomNav = forwardRef<HTMLButtonElement, BottomNavProps>(function BottomNav(
  { currentPath, onMenuToggle, menuOpen, questaoModalOpen = false },
  ref,
) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const nav = (
    <LayoutGroup id="bottom-nav">
      <nav
        className={cn(
          MOBILE_BOTTOM_NAV_FIXED,
          'grid grid-cols-5 border-t border-white/[0.08] bg-[#06090f]/95 pb-safe backdrop-blur-xl',
          MOBILE_BOTTOM_NAV_Z,
        )}
        aria-label="Navegação principal"
        aria-hidden={questaoModalOpen ? true : undefined}
      >
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = currentPath.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              tabIndex={questaoModalOpen ? -1 : undefined}
              aria-current={isActive ? 'page' : undefined}
              className="flex min-h-[48px] flex-col items-center justify-center gap-0.5 px-1 py-2"
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
          ref={ref}
          type="button"
          onClick={onMenuToggle}
          tabIndex={questaoModalOpen ? -1 : undefined}
          className="flex min-h-[48px] flex-col items-center justify-center gap-0.5 px-1 py-2"
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

  if (!mounted) {
    return (
      <nav
        className={cn(
          MOBILE_BOTTOM_NAV_FIXED,
          MOBILE_BOTTOM_NAV_Z,
          'min-h-[5rem]',
          'border-t border-white/[0.08] bg-[#06090f]/95 pb-safe backdrop-blur-xl pointer-events-none md:hidden',
        )}
        aria-hidden="true"
      />
    );
  }

  return createPortal(nav, document.body);
});
