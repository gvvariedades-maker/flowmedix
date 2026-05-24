import {
  hasDismissedPwaInstallPrompt,
  isIosSafari,
  isMobileUserAgent,
  isStandaloneDisplayMode,
  persistPwaInstallDismissed,
  PWA_INSTALL_DISMISSED_KEY,
} from '@/lib/pwa/platform';

describe('lib/pwa/platform', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('detecta dismiss persistido', () => {
    expect(hasDismissedPwaInstallPrompt()).toBe(false);
    persistPwaInstallDismissed();
    expect(hasDismissedPwaInstallPrompt()).toBe(true);
    expect(window.localStorage.getItem(PWA_INSTALL_DISMISSED_KEY)).toBe('true');
  });

  it('isStandaloneDisplayMode usa matchMedia', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query: string) => ({
        matches: query === '(display-mode: standalone)',
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      })),
    });

    expect(isStandaloneDisplayMode()).toBe(true);
  });

  it('isMobileUserAgent reconhece iPhone', () => {
    Object.defineProperty(window.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      configurable: true,
    });
    expect(isMobileUserAgent()).toBe(true);
  });

  it('isIosSafari exclui Chrome no iOS', () => {
    Object.defineProperty(window.navigator, 'userAgent', {
      value:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.0.0 Mobile/15E148 Safari/604.1',
      configurable: true,
    });
    expect(isIosSafari()).toBe(false);
  });
});
