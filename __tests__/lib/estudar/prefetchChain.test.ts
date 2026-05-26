jest.mock('@/lib/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

import { buildEstudarCacheKeyFromSlugComQuery } from '@/lib/estudar/navigation';
import {
  getEstudarNavSessionSnapshot,
  resetEstudarNavSession,
} from '@/lib/estudar/navigationTelemetry';
import { warmForwardChain } from '@/lib/estudar/prefetchChain';
import { logger } from '@/lib/logger';

describe('warmForwardChain', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    resetEstudarNavSession();
    process.env = { ...originalEnv, NODE_ENV: 'development' };
    (logger.debug as unknown as jest.Mock).mockClear();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('retorna vazio quando depth=0 (sem disparar telemetria)', async () => {
    const fetchPayloadIntoCache = jest.fn(async () => ({ proximaSlug: 'B' }));
    const prefetchRoute = jest.fn();
    const buildHref = jest.fn((slug: string) => `href:${slug}`);

    const result = await warmForwardChain('A?ctx=1', 0, {
      fetchPayloadIntoCache,
      prefetchRoute,
      buildHref,
    });

    expect(result).toEqual([]);
    expect(fetchPayloadIntoCache).not.toHaveBeenCalled();
    expect(prefetchRoute).not.toHaveBeenCalled();
    expect(getEstudarNavSessionSnapshot().prefetchChainRuns).toBe(0);
    expect(
      (logger.debug as unknown as jest.Mock).mock.calls.some(([msg]) => String(msg).includes('prefetch_chain')),
    ).toBe(false);
  });

  it('prefetch até depth e para por depth', async () => {
    // A -> B -> C
    const fetchPayloadIntoCache = jest.fn(async (slugComQuery: string) => {
      const proximaMap: Record<string, string | null> = {
        'A?ctx=1': 'B',
        B: 'C',
        C: null,
      };
      return { proximaSlug: proximaMap[slugComQuery] ?? null };
    });

    const prefetchRoute = jest.fn();
    const buildHref = jest.fn((slug: string) => `href:${slug}`);

    const result = await warmForwardChain('A?ctx=1', 2, {
      fetchPayloadIntoCache,
      prefetchRoute,
      buildHref,
    });

    expect(result).toEqual(['B', 'C']);
    expect(fetchPayloadIntoCache.mock.calls.map((c) => c[0])).toEqual(['A?ctx=1', 'B']);
    expect(buildHref.mock.calls.map((c) => c[0])).toEqual(['B', 'C']);
    expect(prefetchRoute.mock.calls.map((c) => c[0])).toEqual(['href:B', 'href:C']);

    const snap = getEstudarNavSessionSnapshot();
    expect(snap.prefetchChainRuns).toBe(1);

    const prefetchChainLog = (logger.debug as unknown as jest.Mock).mock.calls.find(([msg]) =>
      String(msg).includes('prefetch_chain'),
    );
    expect(prefetchChainLog).toBeDefined();
    const ctx = prefetchChainLog?.[1] as any;
    expect(ctx.depth).toBe(2);
    expect(ctx.stoppedReason).toBe('depth');
    expect(ctx.slugsPrefetched).toEqual(['B', 'C']);
    expect(ctx.startCacheKey).toBe(buildEstudarCacheKeyFromSlugComQuery('A?ctx=1'));
  });

  it('prefetch para por ausência de proximaSlug (no_proxima)', async () => {
    // A -> B -> null
    const fetchPayloadIntoCache = jest.fn(async (slugComQuery: string) => {
      const proximaMap: Record<string, string | null> = {
        'A?ctx=1': 'B',
        B: null,
      };
      return { proximaSlug: proximaMap[slugComQuery] ?? null };
    });

    const prefetchRoute = jest.fn();
    const buildHref = jest.fn((slug: string) => `href:${slug}`);

    const result = await warmForwardChain('A?ctx=1', 2, {
      fetchPayloadIntoCache,
      prefetchRoute,
      buildHref,
    });

    expect(result).toEqual(['B']);
    expect(fetchPayloadIntoCache.mock.calls.map((c) => c[0])).toEqual(['A?ctx=1', 'B']);
    expect(prefetchRoute.mock.calls.map((c) => c[0])).toEqual(['href:B']);

    const snap = getEstudarNavSessionSnapshot();
    expect(snap.prefetchChainRuns).toBe(1);

    const prefetchChainLog = (logger.debug as unknown as jest.Mock).mock.calls.find(([msg]) =>
      String(msg).includes('prefetch_chain'),
    );
    expect(prefetchChainLog).toBeDefined();
    const ctx = prefetchChainLog?.[1] as any;
    expect(ctx.depth).toBe(2);
    expect(ctx.stoppedReason).toBe('no_proxima');
    expect(ctx.slugsPrefetched).toEqual(['B']);
  });

  it('prefetch para por loop quando proximaSlug aponta para o slug atual (loop)', async () => {
    const fetchPayloadIntoCache = jest.fn(async () => ({ proximaSlug: 'A?ctx=1' }));
    const prefetchRoute = jest.fn();
    const buildHref = jest.fn((slug: string) => `href:${slug}`);

    const result = await warmForwardChain('A?ctx=1', 2, {
      fetchPayloadIntoCache,
      prefetchRoute,
      buildHref,
    });

    expect(result).toEqual([]);
    expect(fetchPayloadIntoCache).toHaveBeenCalledTimes(1);
    expect(prefetchRoute).not.toHaveBeenCalled();

    const prefetchChainLog = (logger.debug as unknown as jest.Mock).mock.calls.find(([msg]) =>
      String(msg).includes('prefetch_chain'),
    );
    expect(prefetchChainLog?.[1]).toMatchObject({
      stoppedReason: 'loop',
      slugsPrefetched: [],
    });
  });

  it('prefetch para por loop (nextSlug já visitado) (loop)', async () => {
    // A -> B -> A
    const fetchPayloadIntoCache = jest.fn(async (slugComQuery: string) => {
      const proximaMap: Record<string, string | null> = {
        'A?ctx=1': 'B',
        B: 'A?ctx=1',
      };
      return { proximaSlug: proximaMap[slugComQuery] ?? null };
    });

    const prefetchRoute = jest.fn();
    const buildHref = jest.fn((slug: string) => `href:${slug}`);

    const result = await warmForwardChain('A?ctx=1', 2, {
      fetchPayloadIntoCache,
      prefetchRoute,
      buildHref,
    });

    expect(result).toEqual(['B']);
    expect(fetchPayloadIntoCache.mock.calls.map((c) => c[0])).toEqual(['A?ctx=1', 'B']);
    expect(prefetchRoute.mock.calls.map((c) => c[0])).toEqual(['href:B']);

    const snap = getEstudarNavSessionSnapshot();
    expect(snap.prefetchChainRuns).toBe(1);

    const prefetchChainLog = (logger.debug as unknown as jest.Mock).mock.calls.find(([msg]) =>
      String(msg).includes('prefetch_chain'),
    );
    expect(prefetchChainLog).toBeDefined();
    const ctx = prefetchChainLog?.[1] as any;
    expect(ctx.depth).toBe(2);
    expect(ctx.stoppedReason).toBe('loop');
    expect(ctx.slugsPrefetched).toEqual(['B']);
  });
});

