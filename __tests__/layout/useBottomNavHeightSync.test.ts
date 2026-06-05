/** @jest-environment jsdom */

import { createRef } from 'react';
import { renderHook } from '@testing-library/react';
import { useBottomNavHeightSync } from '@/lib/layout/useBottomNavHeightSync';

describe('useBottomNavHeightSync', () => {
  let resizeCallback: (() => void) | undefined;

  beforeEach(() => {
    resizeCallback = undefined;
    document.documentElement.style.removeProperty('--bottom-nav-height');

    global.ResizeObserver = class ResizeObserver {
      constructor(cb: ResizeObserverCallback) {
        resizeCallback = () => cb([], this);
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    } as typeof ResizeObserver;
  });

  afterEach(() => {
    document.documentElement.style.removeProperty('--bottom-nav-height');
  });

  it('escreve --bottom-nav-height com offsetHeight do nav', () => {
    const navRef = createRef<HTMLElement>();
    const el = document.createElement('nav');
    Object.defineProperty(el, 'offsetHeight', { configurable: true, value: 84 });
    navRef.current = el;
    document.body.appendChild(el);

    renderHook(() => useBottomNavHeightSync(navRef, true));

    expect(document.documentElement.style.getPropertyValue('--bottom-nav-height')).toBe('84px');
  });

  it('atualiza a variável quando ResizeObserver dispara', () => {
    const navRef = createRef<HTMLElement>();
    const el = document.createElement('nav');
    Object.defineProperty(el, 'offsetHeight', { configurable: true, value: 72, writable: true });
    navRef.current = el;
    document.body.appendChild(el);

    renderHook(() => useBottomNavHeightSync(navRef, true));
    expect(document.documentElement.style.getPropertyValue('--bottom-nav-height')).toBe('72px');

    Object.defineProperty(el, 'offsetHeight', { configurable: true, value: 96 });
    resizeCallback?.();
    expect(document.documentElement.style.getPropertyValue('--bottom-nav-height')).toBe('96px');
  });

  it('remove --bottom-nav-height no cleanup', () => {
    const navRef = createRef<HTMLElement>();
    const el = document.createElement('nav');
    Object.defineProperty(el, 'offsetHeight', { configurable: true, value: 80 });
    navRef.current = el;
    document.body.appendChild(el);

    const { unmount } = renderHook(() => useBottomNavHeightSync(navRef, true));
    expect(document.documentElement.style.getPropertyValue('--bottom-nav-height')).toBe('80px');

    unmount();
    expect(document.documentElement.style.getPropertyValue('--bottom-nav-height')).toBe('');
  });

  it('não observa quando enabled é false', () => {
    const navRef = createRef<HTMLElement>();
    const el = document.createElement('nav');
    Object.defineProperty(el, 'offsetHeight', { configurable: true, value: 80 });
    navRef.current = el;
    document.body.appendChild(el);

    renderHook(() => useBottomNavHeightSync(navRef, false));
    expect(document.documentElement.style.getPropertyValue('--bottom-nav-height')).toBe('');
  });

  it('re-sincroniza quando remountKey muda (placeholder → portal)', () => {
    const navRef = createRef<HTMLElement>();
    const placeholder = document.createElement('nav');
    Object.defineProperty(placeholder, 'offsetHeight', { configurable: true, value: 80 });
    navRef.current = placeholder;
    document.body.appendChild(placeholder);

    const { rerender } = renderHook(
      ({ mounted }: { mounted: boolean }) => useBottomNavHeightSync(navRef, true, mounted),
      { initialProps: { mounted: false } },
    );
    expect(document.documentElement.style.getPropertyValue('--bottom-nav-height')).toBe('80px');

    const portaled = document.createElement('nav');
    Object.defineProperty(portaled, 'offsetHeight', { configurable: true, value: 92 });
    navRef.current = portaled;
    document.body.appendChild(portaled);

    rerender({ mounted: true });
    expect(document.documentElement.style.getPropertyValue('--bottom-nav-height')).toBe('92px');
  });
});
