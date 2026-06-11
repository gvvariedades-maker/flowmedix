'use client';

import { useEffect } from 'react';

/** Ativa tokens `html[data-theme='editorial']` (login + dashboard). */
export function useEditorialTheme(): void {
  useEffect(() => {
    document.documentElement.dataset.theme = 'editorial';
    return () => {
      delete document.documentElement.dataset.theme;
    };
  }, []);
}
