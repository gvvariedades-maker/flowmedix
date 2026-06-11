'use client';

import { useClientMounted } from '@/lib/hooks/useClientMounted';
import { createPortal } from 'react-dom';
import { type ReactNode, type RefObject } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  MOBILE_BOTTOM_NAV_FIXED_BOTTOM,
  MOBILE_DRAWER_ABOVE_OVERLAYS_OVERLAY_Z,
  MOBILE_DRAWER_ABOVE_OVERLAYS_PANEL_Z,
  MOBILE_DRAWER_OVERLAY_Z,
  MOBILE_DRAWER_PANEL_Z,
} from '@/lib/layout/mobileBottomNav';

const drawerSpring = { type: 'spring' as const, stiffness: 300, damping: 30 };

export type MobileDashboardDrawerProps = {
  open: boolean;
  drawerAboveOverlays: boolean;
  onClose: () => void;
  panelRef: RefObject<HTMLDivElement | null>;
  closeButtonRef: RefObject<HTMLButtonElement | null>;
  children: ReactNode;
};

export function MobileDashboardDrawer({
  open,
  drawerAboveOverlays,
  onClose,
  panelRef,
  closeButtonRef,
  children,
}: MobileDashboardDrawerProps) {
  const mounted = useClientMounted();

  const drawer = (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            key="dashboard-drawer-overlay"
            className={cn(
              'fixed inset-x-0 top-0 bg-black/35 backdrop-blur-sm md:hidden',
              MOBILE_BOTTOM_NAV_FIXED_BOTTOM,
              drawerAboveOverlays
                ? MOBILE_DRAWER_ABOVE_OVERLAYS_OVERLAY_Z
                : MOBILE_DRAWER_OVERLAY_Z,
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
            data-testid="dashboard-drawer-overlay"
          />
          <motion.div
            key="dashboard-drawer-panel"
            ref={panelRef}
            id="dashboard-mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegação"
            className={cn(
              'fixed left-0 top-0 flex h-full w-[16rem] shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white outline-none md:hidden',
              drawerAboveOverlays
                ? MOBILE_DRAWER_ABOVE_OVERLAYS_PANEL_Z
                : MOBILE_DRAWER_PANEL_Z,
            )}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={drawerSpring}
          >
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="absolute right-2 top-[max(0px,env(safe-area-inset-top,0px))] z-10 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Fechar menu"
            >
              <X size={18} />
            </button>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-safe">{children}</div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );

  if (!mounted) return null;
  return createPortal(drawer, document.body);
}
