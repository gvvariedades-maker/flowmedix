'use client';

import { useEffect } from 'react';

/** Cor da barra de status / theme-color no PWA editorial (slate-100). */
export const EDITORIAL_THEME_COLOR = '#f1f5f9';

function setThemeColorMeta(color: string): void {
  document
    .querySelectorAll('meta[name="theme-color"]')
    .forEach((node) => node.setAttribute('content', color));
}

function setAppleStatusBarStyle(style: 'default' | 'black' | 'black-translucent'): void {
  let meta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'apple-mobile-web-app-status-bar-style');
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', style);
}

/** Ativa tokens `html[data-theme='editorial']` (login + dashboard). */
export function useEditorialTheme(): void {
  useEffect(() => {
    document.documentElement.dataset.theme = 'editorial';
    setThemeColorMeta(EDITORIAL_THEME_COLOR);
    setAppleStatusBarStyle('default');

    return () => {
      delete document.documentElement.dataset.theme;
    };
  }, []);
}
