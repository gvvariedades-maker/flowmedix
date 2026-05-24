'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  hasDismissedPwaInstallPrompt,
  isIosSafari,
  isMobileUserAgent,
  isStandaloneDisplayMode,
  persistPwaInstallDismissed,
} from '@/lib/pwa/platform';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

export function usePwaInstall({
  enabled,
  blocked,
}: {
  enabled: boolean;
  blocked?: boolean;
}) {
  const [autoVisible, setAutoVisible] = useState(false);
  const [manualVisible, setManualVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [showNavItem, setShowNavItem] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === 'undefined') return;

    const standalone = isStandaloneDisplayMode();
    const mobile = isMobileUserAgent();
    setShowNavItem(mobile && !standalone);
    setIsIos(isIosSafari());

    if (standalone || !mobile) return;

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, [enabled]);

  useEffect(() => {
    if (!enabled || blocked) return;
    if (typeof window === 'undefined') return;
    if (isStandaloneDisplayMode() || hasDismissedPwaInstallPrompt()) return;
    if (!isMobileUserAgent()) return;

    const canShowAuto = deferredPrompt !== null || isIosSafari();
    if (!canShowAuto) return;

    const id = window.setTimeout(() => setAutoVisible(true), 1500);
    return () => window.clearTimeout(id);
  }, [enabled, blocked, deferredPrompt]);

  const open = useCallback(() => {
    setManualVisible(true);
  }, []);

  const close = useCallback(() => {
    setAutoVisible(false);
    setManualVisible(false);
  }, []);

  const dismiss = useCallback(() => {
    persistPwaInstallDismissed();
    close();
  }, [close]);

  const install = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    close();
    persistPwaInstallDismissed();
  }, [close, deferredPrompt]);

  const visible = autoVisible || manualVisible;

  return useMemo(
    () => ({
      visible,
      autoVisible,
      manualVisible,
      showNavItem: enabled && showNavItem,
      isIos,
      canNativeInstall: deferredPrompt !== null,
      open,
      close,
      dismiss,
      install,
    }),
    [
      autoVisible,
      close,
      deferredPrompt,
      dismiss,
      enabled,
      install,
      isIos,
      manualVisible,
      open,
      showNavItem,
      visible,
    ],
  );
}
