'use client';

import Link from 'next/link';
import { forwardRef, useRef } from 'react';
import { LayoutGroup, motion } from 'framer-motion';
import {
  BarChart3,
  BookMarked,
  LayoutDashboard,
  ListChecks,
  Menu,
  X,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { isBottomNavItemActive, isBottomNavMaisActive } from '@/lib/layout/bottomNavActive';
import { MOBILE_BOTTOM_NAV_SHELL, MOBILE_BOTTOM_NAV_Z } from '@/lib/layout/mobileBottomNav';
import { useBottomNavHeightSync } from '@/lib/layout/useBottomNavHeightSync';
import { useDashboardDesktop } from '@/lib/layout/useDashboardDesktop';
import { useEstudarQuestaoImmersive } from '@/lib/layout/useEstudarQuestaoImmersive';
import {
  MENU_ACCENT_STYLES,
  MenuNavIconChip,
  type MenuAccentKey,
} from '@/components/layout/MenuNavIconChip';

const NAV_ITEMS = [
  { label: 'Estudar', href: '/estudar', icon: LayoutDashboard, accent: 'cyan' },
  { label: 'Simulados', href: '/simulados', icon: ListChecks, accent: 'rose' },
  { label: 'Progresso', href: '/progresso', icon: BarChart3, accent: 'emerald' },
  { label: 'Cadernos', href: '/cadernos', icon: BookMarked, accent: 'indigo' },
] satisfies { label: string; href: string; icon: LucideIcon; accent: MenuAccentKey }[];

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
  const navRef = useRef<HTMLElement>(null);
  const isDesktop = useDashboardDesktop();
  const estudarQuestaoImmersive = useEstudarQuestaoImmersive();

  useBottomNavHeightSync(navRef, !isDesktop && !estudarQuestaoImmersive);

  const mobileOverlayBlocksNav =
    !isDesktop && (drawerOpen || welcomeOpen || questaoModalOpen);
  const maisInteractive =
    drawerOpen && !welcomeOpen && !questaoModalOpen && !isDesktop;
  /** Welcome/modal isolam o nav inteiro; com drawer aberto só os links ficam inertes — Mais permanece no SR. */
  const navAriaHidden = questaoModalOpen || welcomeOpen || undefined;
  const linkTabIndex = mobileOverlayBlocksNav ? -1 : undefined;
  const maisTabIndex = maisInteractive ? 0 : mobileOverlayBlocksNav || questaoModalOpen ? -1 : undefined;
  const maisActive = !menuOpen && isBottomNavMaisActive(currentPath);
  const maisAccent = MENU_ACCENT_STYLES.slate;

  return (
    <LayoutGroup id="bottom-nav">
      <nav
        ref={navRef}
        className={cn(
          MOBILE_BOTTOM_NAV_SHELL,
          'grid min-h-[5rem] grid-cols-5 border-t border-white/[0.08] bg-[#06090f]/95 pb-safe backdrop-blur-xl',
          MOBILE_BOTTOM_NAV_Z,
          mobileOverlayBlocksNav && 'pointer-events-none',
        )}
        aria-label="Navegação rápida"
        aria-hidden={navAriaHidden === true ? true : undefined}
      >
        {NAV_ITEMS.map(({ label, href, icon, accent }) => {
          const isActive = isBottomNavItemActive(currentPath, href);
          const styles = MENU_ACCENT_STYLES[accent];

          return (
            <Link
              key={href}
              href={href}
              tabIndex={linkTabIndex}
              aria-hidden={mobileOverlayBlocksNav ? true : undefined}
              aria-current={isActive ? 'page' : undefined}
              className="flex min-h-[48px] flex-col items-center justify-center gap-0.5 px-1 py-1.5"
            >
              <MenuNavIconChip icon={icon} accent={accent} active={isActive} size="bottom" />
              <span
                className={cn(
                  'text-[10px] font-semibold tracking-wide',
                  isActive ? styles.labelActive : 'text-slate-400',
                )}
              >
                {label}
              </span>
              {isActive ? (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className={cn('mt-0.5 h-[2px] w-6 rounded-full shadow-[0_0_6px_currentColor]', styles.bar)}
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
            'flex min-h-[48px] flex-col items-center justify-center gap-0.5 px-1 py-1.5',
            maisInteractive && 'pointer-events-auto',
          )}
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuOpen}
          aria-controls={menuOpen ? 'dashboard-mobile-drawer' : undefined}
          aria-current={maisActive ? 'page' : undefined}
        >
          <MenuNavIconChip
            icon={menuOpen ? X : Menu}
            accent="slate"
            active={menuOpen || maisActive}
            size="bottom"
          />
          <span
            className={cn(
              'text-[10px] font-semibold tracking-wide',
              menuOpen || maisActive ? maisAccent.labelActive : 'text-slate-400',
            )}
          >
            Mais
          </span>
          {maisActive ? (
            <motion.div
              layoutId="bottom-nav-indicator"
              className={cn('mt-0.5 h-[2px] w-6 rounded-full shadow-[0_0_6px_currentColor]', maisAccent.bar)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
          ) : null}
        </button>
      </nav>
    </LayoutGroup>
  );
});
