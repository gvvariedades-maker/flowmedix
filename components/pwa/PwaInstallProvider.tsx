'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { PwaInstallPanel } from '@/components/pwa/PwaInstallPanel';
import { usePwaInstall } from '@/components/pwa/usePwaInstall';

type PwaInstallContextValue = ReturnType<typeof usePwaInstall>;

const PwaInstallContext = createContext<PwaInstallContextValue | null>(null);

export function usePwaInstallContext(): PwaInstallContextValue {
  const ctx = useContext(PwaInstallContext);
  if (!ctx) {
    throw new Error('usePwaInstallContext must be used within PwaInstallProvider');
  }
  return ctx;
}

type PwaInstallProviderProps = {
  enabled: boolean;
  blocked?: boolean;
  children: ReactNode;
};

export function PwaInstallProvider({ enabled, blocked, children }: PwaInstallProviderProps) {
  const value = usePwaInstall({ enabled, blocked });

  return (
    <PwaInstallContext.Provider value={value}>
      {children}
      {value.visible ? (
        <div
          className="fixed inset-x-0 bottom-0 z-[60] px-3 pb-safe md:hidden"
          role="dialog"
          aria-labelledby="pwa-install-title"
          aria-describedby="pwa-install-desc"
        >
          <PwaInstallPanel
            isIos={value.isIos}
            canNativeInstall={value.canNativeInstall}
            onInstall={value.install}
            onDismiss={value.dismiss}
            onClose={value.manualVisible ? value.close : value.dismiss}
            showDismissAction={value.autoVisible}
          />
        </div>
      ) : null}
    </PwaInstallContext.Provider>
  );
}
