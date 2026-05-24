'use client';

import { Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePwaInstallContext } from '@/components/pwa/PwaInstallProvider';

const MENU_ICON_STROKE = 2 as const;

type PwaInstallNavButtonProps = {
  onNavigate?: () => void;
};

export function PwaInstallNavButton({ onNavigate }: PwaInstallNavButtonProps) {
  const { showNavItem, open } = usePwaInstallContext();

  if (!showNavItem) return null;

  return (
    <div className="mt-2 px-2">
      <button
        type="button"
        onClick={() => {
          open();
          onNavigate?.();
        }}
        className={cn(
          'group relative flex w-full items-center gap-3 rounded-xl border border-cyan-400/15 bg-cyan-400/5 py-3 pl-4 pr-3 text-sm font-semibold text-cyan-100 transition-colors hover:bg-cyan-400/10',
        )}
      >
        <Smartphone
          size={20}
          strokeWidth={MENU_ICON_STROKE}
          className="shrink-0 text-cyan-300 transition-colors group-hover:text-cyan-200"
          aria-hidden
        />
        Instalar no celular
      </button>
    </div>
  );
}
