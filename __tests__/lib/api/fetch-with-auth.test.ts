const mockGetSession = jest.fn();

jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
    },
  },
}));

describe('fetchWithAuth', () => {
  const originalEnv = process.env;
  const mockFetch = jest.fn().mockResolvedValue({ ok: true });

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    global.fetch = mockFetch as typeof fetch;
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: 'test-token' } },
    });
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('ignora bypass E2E em produção mesmo com NEXT_PUBLIC_E2E_DASHBOARD_BYPASS', async () => {
    process.env.NODE_ENV = 'production';
    process.env.NEXT_PUBLIC_E2E_DASHBOARD_BYPASS = 'true';

    const { fetchWithAuth } = await import('@/lib/api/fetch-with-auth');
    await fetchWithAuth('/api/test');

    expect(mockGetSession).toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/test',
      expect.objectContaining({
        headers: expect.any(Headers),
      }),
    );
    const headers = mockFetch.mock.calls[0][1].headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer test-token');
  });

  it('usa bypass E2E sem Bearer fora de produção', async () => {
    process.env.NODE_ENV = 'test';
    process.env.NEXT_PUBLIC_E2E_DASHBOARD_BYPASS = 'true';

    const { fetchWithAuth } = await import('@/lib/api/fetch-with-auth');
    await fetchWithAuth('/api/test');

    expect(mockGetSession).not.toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/test',
      expect.objectContaining({
        credentials: 'same-origin',
      }),
    );
  });

  it('envia Bearer quando bypass E2E está desligado', async () => {
    process.env.NODE_ENV = 'test';
    delete process.env.NEXT_PUBLIC_E2E_DASHBOARD_BYPASS;

    const { fetchWithAuth } = await import('@/lib/api/fetch-with-auth');
    await fetchWithAuth('/api/test');

    expect(mockGetSession).toHaveBeenCalled();
    const headers = mockFetch.mock.calls[0][1].headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer test-token');
  });
});
