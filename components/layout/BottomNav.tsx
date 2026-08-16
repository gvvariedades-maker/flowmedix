'use client';

import Link from 'next/link';
import { forwardRef, useRef } from 'react';
import {
  BarChart3,
  BookMarked,
  Library,
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
import { isCadernosHubHref } from '@/lib/cadernos/cadernosPendingMark';
import { isDesempenhoHubHref } from '@/lib/desempenho/desempenhoPendingMark';
import {
  MENU_ACCENT_STYLES,
  MenuNavIconChip,
} from '@/components/layout/MenuNavIconChip';

const NAV_ITEMS = [
  { label: 'Estudar', href: '/estudar', icon: Library },
  { label: 'Simulados', href: '/simulados', icon: ListChecks },
  { label: 'Desempenho', href: '/desempenho', icon: BarChart3 },
  { label: 'Cadernos', href: '/cadernos', icon: BookMarked },
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
  const brandLabel = MENU_ACCENT_STYLES.brand.labelActive;

  return (
      <nav
        ref={navRef}
        className={cn(
          MOBILE_BOTTOM_NAV_SHELL,
          'grid min-h-[5rem] grid-cols-5 border-t border-[rgba(242,101,34,0.14)] bg-white/95 pb-safe backdrop-blur-xl',
          MOBILE_BOTTOM_NAV_Z,
          mobileOverlayBlocksNav && 'pointer-events-none',
        )}
        aria-label="Navegação rápida"
        aria-hidden={navAriaHidden === true ? true : undefined}
      >
        {NAV_ITEMS.map(({ label, href, icon }) => {
          const isActive = isBottomNavItemActive(currentPath, href);

          return (
            <Link
              key={href}
              href={href}
              prefetch={
                isDesempenhoHubHref(href) || isCadernosHubHref(href) ? false : undefined
              }
              tabIndex={linkTabIndex}
              aria-hidden={mobileOverlayBlocksNav ? true : undefined}
              aria-current={isActive ? 'page' : undefined}
              className="flex min-h-[48px] flex-col items-center justify-center gap-0.5 px-1 py-1.5"
            >
              <MenuNavIconChip icon={icon} accent="brand" active={isActive} size="bottom" />
              <span
                className={cn(
                  'text-[11px] font-semibold leading-tight',
                  isActive ? brandLabel : 'text-slate-500',
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
            accent="brand"
            active={menuOpen || maisActive}
            size="bottom"
          />
          <span
            className={cn(
              'text-[11px] font-semibold leading-tight',
              menuOpen || maisActive ? brandLabel : 'text-slate-500',
            )}
          >
            Mais
          </span>
        </button>
      </nav>
  );
});
