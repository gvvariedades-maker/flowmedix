import {
  createHarnessFetch,
  mergeSetCookieIntoCookieHeader,
} from '@/lib/scale/authenticatedHarness/vercelProtectionHarness';

describe('vercelProtectionHarness fetch', () => {
  it('mergeSetCookieIntoCookieHeader combina cookies', () => {
    expect(
      mergeSetCookieIntoCookieHeader('a=1', ['_vercel_jwt=abc; Path=/; HttpOnly']),
    ).toBe('a=1; _vercel_jwt=abc');
  });

  it('createHarnessFetch faz segundo request após 307 com set-cookie', async () => {
    const calls: string[] = [];
    const baseFetch = async (url: string, init?: RequestInit) => {
      calls.push(String(init?.redirect ?? 'default'));
      if (calls.length === 1) {
        return {
          status: 307,
          headers: {
            get: (name: string) => (name === 'set-cookie' ? '_vercel_jwt=tok; Path=/' : null),
            getSetCookie: () => ['_vercel_jwt=tok; Path=/'],
          },
        } as Response;
      }
      return { status: 200, headers: { get: () => null } } as unknown as Response;
    };

    const wrapped = createHarnessFetch(baseFetch, {
      vercelProtectionBypass: 'secret',
      approvedAppHosts: ['flowmedix-git-staging-gvvariedades-makers-projects.vercel.app'],
    });
    const res = await wrapped(
      'https://flowmedix-git-staging-gvvariedades-makers-projects.vercel.app/api/vitrine',
      { headers: {} },
    );
    expect(res.status).toBe(200);
    expect(calls[0]).toBe('manual');
  });
});
