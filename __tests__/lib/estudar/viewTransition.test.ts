import { prefersReducedMotion, runEstudarViewTransition } from '@/lib/estudar/viewTransition';

describe('runEstudarViewTransition', () => {
  const originalRaf = global.requestAnimationFrame;

  beforeEach(() => {
    global.requestAnimationFrame = (cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    };
  });

  afterEach(() => {
    global.requestAnimationFrame = originalRaf;
    jest.restoreAllMocks();
  });

  it('executa o callback direto quando startViewTransition não existe', () => {
    const fn = jest.fn();
    runEstudarViewTransition(fn);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('usa startViewTransition quando disponível', () => {
    const fn = jest.fn();
    const startViewTransition = jest.fn((cb: () => void) => {
      cb();
      return { finished: Promise.resolve() };
    });
    Object.defineProperty(document, 'startViewTransition', {
      configurable: true,
      value: startViewTransition,
    });

    runEstudarViewTransition(fn);
    expect(startViewTransition).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('ignora view transition com prefers-reduced-motion', () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: jest.fn((query: string) => ({
      matches: query.includes('reduce'),
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
      })),
    });

    const fn = jest.fn();
    const startViewTransition = jest.fn();
    Object.defineProperty(document, 'startViewTransition', {
      configurable: true,
      value: startViewTransition,
    });

    runEstudarViewTransition(fn);
    expect(startViewTransition).not.toHaveBeenCalled();
    expect(fn).toHaveBeenCalledTimes(1);
    expect(prefersReducedMotion()).toBe(true);
  });
});
