'use client';

import { Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePwaInstallContext } from '@/components/pwa/PwaInstallProvider';
import { MenuNavIconChip, MENU_NAV_ROW_IDLE } from '@/components/layout/MenuNavIconChip';

type PwaInstallNavButtonProps = {
  onNavigate?: () => void;
};

export function PwaInstallNavButton({ onNavigate }: PwaInstallNavButtonProps) {
  const { showNavItem, open } = usePwaInstallContext();

  if (!showNavItem) return null;

  return (
    <button
      type="button"
      title="Instalar o AVANT enf no celular"
      onClick={() => {
        open();
        onNavigate?.();
      }}
      className={cn(
        'group flex w-full items-center gap-2.5 rounded-xl py-2 pl-2.5 pr-2 text-sm transition-colors',
        MENU_NAV_ROW_IDLE,
      )}
    >
      <MenuNavIconChip icon={Smartphone} accent="slate" active={false} />
      Instalar app
    </button>
  );
}
