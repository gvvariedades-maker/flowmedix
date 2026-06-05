'use client';

import Link from 'next/link';
import { createPortal } from 'react-dom';
import { forwardRef, useEffect, useRef, useState } from 'react';
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
import { isBottomNavItemActive, isBottomNavMaisActive } from '@/lib/layout/bottomNavActive';
import { MOBILE_BOTTOM_NAV_FIXED, MOBILE_BOTTOM_NAV_Z } from '@/lib/layout/mobileBottomNav';
import { useBottomNavHeightSync } from '@/lib/layout/useBottomNavHeightSync';
import { useDashboardDesktop } from '@/lib/layout/useDashboardDesktop';

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
  /** Drawer mobile aberto — nav inerte exceto botão Mais. */
  drawerOpen?: boolean;
  /** Welcome de estudo reverso — nav totalmente inerte (toggle Mais bloqueado no shell). */
  welcomeOpen?: boolean;
};

export const BottomNav = forwardRef<HTMLButtonElement, BottomNavProps>(function BottomNav(
  {
    currentPath,
    onMenuToggle,
    menuOpen,
    questaoModalOpen = false,
    drawerOpen = false,
    welcomeOpen = false,
  },
  ref,
) {
  const [mounted, setMounted] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const isDesktop = useDashboardDesktop();

  useEffect(() => setMounted(true), []);
  useBottomNavHeightSync(navRef, true, mounted);

  const mobileOverlayBlocksNav =
    !isDesktop && (drawerOpen || welcomeOpen || questaoModalOpen);
  const maisInteractive =
    drawerOpen && !welcomeOpen && !questaoModalOpen && !isDesktop;
  /** Welcome/modal isolam o nav inteiro; com drawer aberto só os links ficam inertes — Mais permanece no SR. */
  const navAriaHidden = questaoModalOpen || welcomeOpen || undefined;
  const linkTabIndex = mobileOverlayBlocksNav ? -1 : undefined;
  const maisTabIndex = maisInteractive ? 0 : mobileOverlayBlocksNav || questaoModalOpen ? -1 : undefined;
  const maisActive = !menuOpen && isBottomNavMaisActive(currentPath);

  const nav = (
    <LayoutGroup id="bottom-nav">
      <nav
        ref={navRef}
        className={cn(
          MOBILE_BOTTOM_NAV_FIXED,
          'grid grid-cols-5 border-t border-white/[0.08] bg-[#06090f]/95 pb-safe backdrop-blur-xl',
          MOBILE_BOTTOM_NAV_Z,
          mobileOverlayBlocksNav && 'pointer-events-none',
        )}
        aria-label="Navegação rápida"
        aria-hidden={navAriaHidden === true ? true : undefined}
      >
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = isBottomNavItemActive(currentPath, href);

          return (
            <Link
              key={href}
              href={href}
              tabIndex={linkTabIndex}
              aria-hidden={mobileOverlayBlocksNav ? true : undefined}
              aria-current={isActive ? 'page' : undefined}
              className="flex min-h-[48px] flex-col items-center justify-center gap-0.5 px-1 py-2"
            >
              <Icon
                size={20}
                className={cn(
                  isActive
                    ? 'text-[#00f2ff] drop-shadow-[0_0_6px_rgba(0,242,255,0.6)]'
                    : 'text-slate-400',
                )}
                aria-hidden
              />
              <span
                className={cn(
                  'text-[10px] font-semibold tracking-wide',
                  isActive ? 'text-[#00f2ff]' : 'text-slate-400',
                )}
              >
                {label}
              </span>
              {isActive ? (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="mt-0.5 h-[2px] w-6 rounded-full bg-[#00f2ff] shadow-[0_0_6px_#00f2ff]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
              ) : null}
            </Link>
          );
        })}

        <button
          ref={ref}
          type="button"
          onClick={onMenuToggle}
          tabIndex={maisTabIndex}
          className={cn(
            'flex min-h-[48px] flex-col items-center justify-center gap-0.5 px-1 py-2',
            maisInteractive && 'pointer-events-auto',
          )}
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuOpen}
          aria-controls={menuOpen ? 'dashboard-mobile-drawer' : undefined}
          aria-current={maisActive ? 'page' : undefined}
        >
          {menuOpen ? (
            <X size={20} className="text-white" aria-hidden />
          ) : (
            <Menu
              size={20}
              className={cn(
                maisActive
                  ? 'text-[#00f2ff] drop-shadow-[0_0_6px_rgba(0,242,255,0.6)]'
                  : 'text-slate-400',
              )}
              aria-hidden
            />
          )}
          <span
            className={cn(
              'text-[10px] font-semibold tracking-wide',
              menuOpen ? 'text-white' : maisActive ? 'text-[#00f2ff]' : 'text-slate-400',
            )}
          >
            Mais
          </span>
          {maisActive ? (
            <motion.div
              layoutId="bottom-nav-indicator"
              className="mt-0.5 h-[2px] w-6 rounded-full bg-[#00f2ff] shadow-[0_0_6px_#00f2ff]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
          ) : null}
        </button>
      </nav>
    </LayoutGroup>
  );

  if (!mounted) {
    return (
      <nav
        ref={navRef}
        className={cn(
          MOBILE_BOTTOM_NAV_FIXED,
          MOBILE_BOTTOM_NAV_Z,
          'grid min-h-[5rem] grid-cols-5',
          'border-t border-white/[0.08] bg-[#06090f]/95 pb-safe backdrop-blur-xl pointer-events-none md:hidden',
        )}
        aria-hidden="true"
      />
    );
  }

  return createPortal(nav, document.body);
});
