jest.mock('@/lib/env', () => ({
  validateEnv: jest.fn(),
}));

const mockNext = jest.fn((options) => ({
  cookies: { set: jest.fn() },
  options,
}));

jest.mock('next/server', () => ({
  NextResponse: {
    next: (options?: unknown) => mockNext(options),
  },
}));

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
  })),
}));

import { config, proxy } from '@/proxy';
import type { NextRequest } from 'next/server';

describe('proxy config', () => {
  it('inclui rotas do dashboard e admin que exigem refresh proativo de sessão', () => {
    const matcher = config.matcher;

    expect(matcher).toEqual(
      expect.arrayContaining([
        '/estudar/:path*',
        '/material/:path*',
        '/conta/:path*',
        '/progresso/:path*',
        '/desempenho/:path*',
        '/admin/:path*',
      ]),
    );
  });
});

describe('proxy handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('injeta x-pathname com base no request.nextUrl.pathname sobrescrevendo header spoofed', async () => {
    const req = {
      nextUrl: { pathname: '/admin/concursos' },
      headers: new Headers({ 'x-pathname': '/spoofed-path' }),
      cookies: {
        getAll: () => [],
      },
    } as unknown as NextRequest;

    await proxy(req);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        request: {
          headers: expect.any(Headers),
        },
      }),
    );

    const callArgs = mockNext.mock.calls[0][0];
    const headers = callArgs.request.headers as Headers;
    expect(headers.get('x-pathname')).toBe('/admin/concursos');
  });
});
