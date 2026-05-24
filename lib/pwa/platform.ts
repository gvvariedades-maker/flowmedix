export const PWA_INSTALL_DISMISSED_KEY = 'avant.pwa.installDismissed';

/** Instalado como app (standalone / iOS home screen). */
export function isStandaloneDisplayMode(): boolean {
  if (typeof window === 'undefined') return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  if (nav.standalone) return true;
  return window.matchMedia('(display-mode: standalone)').matches;
}

export function isIosSafari(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|Chrome/.test(ua);
  return isIos && isSafari;
}

export function isMobileUserAgent(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(window.navigator.userAgent);
}

export function hasDismissedPwaInstallPrompt(): boolean {
  try {
    return window.localStorage.getItem(PWA_INSTALL_DISMISSED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function persistPwaInstallDismissed(): void {
  try {
    window.localStorage.setItem(PWA_INSTALL_DISMISSED_KEY, 'true');
  } catch {
    // Storage indisponível — banner pode reaparecer na próxima sessão.
  }
}
