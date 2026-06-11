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
          'group relative flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 py-3 pl-4 pr-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100',
        )}
      >
        <Smartphone
          size={20}
          strokeWidth={MENU_ICON_STROKE}
          className="shrink-0 text-slate-500 transition-colors group-hover:text-slate-700"
          aria-hidden
        />
        Instalar no celular
      </button>
    </div>
  );
}
