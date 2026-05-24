const SW_URL = '/sw.js';

export function registerAvantServiceWorker(): void {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;

  void navigator.serviceWorker.register(SW_URL, { scope: '/' }).catch(() => {
    // Falha silenciosa — PWA ainda funciona como atalho manual.
  });
}
