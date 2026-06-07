jest.mock('@/lib/env', () => ({
  validateEnv: jest.fn(),
}));

jest.mock('next/server', () => ({
  NextResponse: {
    next: jest.fn(() => ({
      cookies: { set: jest.fn() },
    })),
  },
}));

import { config } from '@/proxy';

describe('proxy config', () => {
  it('inclui rotas do dashboard que exigem refresh proativo de sessão', () => {
    const matcher = config.matcher;

    expect(matcher).toEqual(
      expect.arrayContaining([
        '/estudar/:path*',
        '/material/:path*',
        '/conta/:path*',
        '/progresso/:path*',
        '/desempenho/:path*',
      ]),
    );
  });
});
