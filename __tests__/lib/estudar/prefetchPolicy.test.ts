import { shouldSkipEstudarPrefetch } from '@/lib/estudar/prefetchPolicy';

describe('prefetchPolicy', () => {
  const originalNavigator = global.navigator;

  afterEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      configurable: true,
    });
  });

  function mockConnection(connection: { saveData?: boolean; effectiveType?: string } | undefined) {
    Object.defineProperty(global, 'navigator', {
      value: { connection },
      configurable: true,
    });
  }

  it('não pula prefetch sem connection API', () => {
    mockConnection(undefined);
    expect(shouldSkipEstudarPrefetch()).toBe(false);
  });

  it('pula prefetch com saveData', () => {
    mockConnection({ saveData: true, effectiveType: '4g' });
    expect(shouldSkipEstudarPrefetch()).toBe(true);
  });

  it('pula prefetch em 2g e slow-2g', () => {
    mockConnection({ effectiveType: '2g' });
    expect(shouldSkipEstudarPrefetch()).toBe(true);
    mockConnection({ effectiveType: 'slow-2g' });
    expect(shouldSkipEstudarPrefetch()).toBe(true);
  });

  it('mantém prefetch em 3g/4g sem saveData', () => {
    mockConnection({ effectiveType: '3g' });
    expect(shouldSkipEstudarPrefetch()).toBe(false);
    mockConnection({ effectiveType: '4g' });
    expect(shouldSkipEstudarPrefetch()).toBe(false);
  });
});
