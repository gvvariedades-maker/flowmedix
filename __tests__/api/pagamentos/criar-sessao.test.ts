/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/pagamentos/criar-sessao/route';
import { getServerSession } from '@/lib/supabase/server-auth';
import { getConcursoBySlug } from '@/lib/concursos/entitlements';
import { getStripeClient } from '@/lib/stripe/client';

jest.mock('@/lib/supabase/server-auth', () => ({
  getServerSession: jest.fn(),
  createSupabaseServerClient: jest.fn(),
}));

jest.mock('@/lib/concursos/entitlements', () => ({
  CAMPINA_GRANDE_2026_SLUG: 'campina-grande-2026',
  CAMPINA_GRANDE_LANDING_HREF: '/campina-grande',
  GERAL_CONCURSO_SLUG: 'geral',
  getConcursoBySlug: jest.fn(),
  isActiveMatriculaRow: jest.fn(),
}));

jest.mock('@/lib/freemium', () => ({
  isUserPro: jest.fn(),
}));

jest.mock('@/lib/pro/env', () => ({
  requireStripePriceIdPro: jest.fn(),
}));

jest.mock('@/lib/stripe/client', () => ({
  getStripeClient: jest.fn(),
}));

jest.mock('@/lib/siteUrl', () => ({
  getAbsoluteUrl: (path: string) => `https://avant.test${path}`,
}));

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockGetConcursoBySlug = getConcursoBySlug as jest.MockedFunction<typeof getConcursoBySlug>;
const mockGetStripeClient = getStripeClient as jest.MockedFunction<typeof getStripeClient>;

describe('POST /api/pagamentos/criar-sessao', () => {
  const checkoutCreate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetServerSession.mockResolvedValue(null);
    mockGetConcursoBySlug.mockResolvedValue({
      id: 'concurso-1',
      slug: 'goianinha-rn',
      nome: 'Goianinha',
      status: 'ativo',
      price_cents: 3700,
    } as Awaited<ReturnType<typeof getConcursoBySlug>>);
    checkoutCreate.mockResolvedValue({ url: 'https://checkout.stripe.test/cs_guest' });
    mockGetStripeClient.mockReturnValue({
      checkout: { sessions: { create: checkoutCreate } },
    } as unknown as NonNullable<ReturnType<typeof getStripeClient>>);
  });

  it('cria sessão Stripe guest sem usuário logado e sem insert de compra', async () => {
    const request = new NextRequest('https://avant.test/api/pagamentos/criar-sessao', {
      method: 'POST',
      body: JSON.stringify({ concurso_slug: 'goianinha-rn' }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ url: 'https://checkout.stripe.test/cs_guest' });
    expect(checkoutCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'payment',
        metadata: {
          guest_checkout: '1',
          concurso_slug: 'goianinha-rn',
        },
        success_url: 'https://avant.test/concursos/goianinha-rn/comprar?compra=1',
        cancel_url: 'https://avant.test/concursos/goianinha-rn/comprar?cancelado=1',
      }),
    );
    expect(checkoutCreate.mock.calls[0][0].metadata).not.toHaveProperty('purchase_id');
    expect(checkoutCreate.mock.calls[0][0].client_reference_id).toBeUndefined();
  });

  it('exige autenticação para checkout Pro (geral)', async () => {
    mockGetServerSession.mockResolvedValue(null);

    const request = new NextRequest('https://avant.test/api/pagamentos/criar-sessao', {
      method: 'POST',
      body: JSON.stringify({ concurso_slug: 'geral' }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({ error: 'Não autenticado' });
    expect(checkoutCreate).not.toHaveBeenCalled();
  });
});
