'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const STORAGE_KEY = 'avant.estudoReverso.welcomeShown';

function hasSeenWelcome(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function persistSeen() {
  try {
    window.localStorage.setItem(STORAGE_KEY, 'true');
  } catch {
    // Se o storage estiver indisponivel, o modal ainda funciona na sessão atual.
  }
}

export function useEstudoReversoWelcome({ enabled }: { enabled: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [seenThisSession, setSeenThisSession] = useState(false);

  const isManualIntro = pathname === '/ajuda/estudo-reverso' && searchParams.get('intro') === '1';

  const cleanIntroParam = useCallback(() => {
    if (!isManualIntro) return;
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete('intro');
    const query = nextParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [isManualIntro, pathname, router, searchParams]);

  const markSeenAndClose = useCallback(() => {
    persistSeen();
    setSeenThisSession(true);
    setIsOpen(false);
    cleanIntroParam();
  }, [cleanIntroParam]);

  const closeWithoutPersisting = useCallback(() => {
    setIsOpen(false);
    cleanIntroParam();
  }, [cleanIntroParam]);

  useEffect(() => {
    if (!enabled) return;
    if (isManualIntro) {
      const id = window.requestAnimationFrame(() => setIsOpen(true));
      return () => window.cancelAnimationFrame(id);
    }
    if (seenThisSession || hasSeenWelcome()) return;

    const id = window.setTimeout(() => setIsOpen(true), 800);
    return () => window.clearTimeout(id);
  }, [enabled, isManualIntro, seenThisSession]);

  return useMemo(
    () => ({
      isOpen,
      markSeenAndClose,
      closeWithoutPersisting,
    }),
    [closeWithoutPersisting, isOpen, markSeenAndClose],
  );
}
