/**
 * @jest-environment node
 */

jest.mock('@/lib/supabase/server-auth', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@/lib/freemium', () => ({
  userHasUnlimitedStudyAccess: jest.fn(),
}));

jest.mock('@/lib/constants', () => ({
  ...jest.requireActual('@/lib/constants'),
  isAdminSessionEmail: jest.fn(),
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

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/pagamentos/criar-sessao/route';
import { getServerSession } from '@/lib/supabase/server-auth';
import { isAdminSessionEmail } from '@/lib/constants';
import { userHasUnlimitedStudyAccess } from '@/lib/freemium';
import { requireStripePriceIdPro } from '@/lib/pro/env';
import { getStripeClient } from '@/lib/stripe/client';

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockUserHasUnlimitedStudyAccess = userHasUnlimitedStudyAccess as jest.MockedFunction<
  typeof userHasUnlimitedStudyAccess
>;
const mockIsAdminSessionEmail = isAdminSessionEmail as jest.MockedFunction<typeof isAdminSessionEmail>;
const mockRequireStripePriceIdPro = requireStripePriceIdPro as jest.MockedFunction<
  typeof requireStripePriceIdPro
>;
const mockGetStripeClient = getStripeClient as jest.MockedFunction<typeof getStripeClient>;

describe('POST /api/pagamentos/criar-sessao', () => {
  const checkoutCreate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetServerSession.mockResolvedValue(null);
    checkoutCreate.mockResolvedValue({ url: 'https://checkout.stripe.test/cs_pro' });
    mockGetStripeClient.mockReturnValue({
      checkout: { sessions: { create: checkoutCreate } },
    } as unknown as NonNullable<ReturnType<typeof getStripeClient>>);
    mockRequireStripePriceIdPro.mockReturnValue('price_pro_test');
    mockUserHasUnlimitedStudyAccess.mockResolvedValue(false);
    mockIsAdminSessionEmail.mockReturnValue(false);
  });

  it('rejeita slug de edital e aponta para /assinar-pro', async () => {
    const request = new NextRequest('https://avant.test/api/pagamentos/criar-sessao', {
      method: 'POST',
      body: JSON.stringify({ concurso_slug: 'campina-grande-2026' }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.redirectUrl).toBe('/assinar-pro');
    expect(checkoutCreate).not.toHaveBeenCalled();
  });

  it('cria sessão Stripe Pro (geral) para visitante sem login', async () => {
    const request = new NextRequest('https://avant.test/api/pagamentos/criar-sessao', {
      method: 'POST',
      body: JSON.stringify({ concurso_slug: 'geral' }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ url: 'https://checkout.stripe.test/cs_pro' });
    expect(checkoutCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'subscription',
        metadata: {
          produto: 'avant-pro',
          user_id: '',
        },
        line_items: [{ price: 'price_pro_test', quantity: 1 }],
        success_url: 'https://avant.test/checkout/sucesso?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'https://avant.test/',
      }),
    );
  });

  it('redireciona admin logado sem abrir Stripe', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'admin-1', email: 'admin@avant.test' },
    } as Awaited<ReturnType<typeof getServerSession>>);
    mockUserHasUnlimitedStudyAccess.mockResolvedValue(true);
    mockIsAdminSessionEmail.mockReturnValue(true);

    const request = new NextRequest('https://avant.test/api/pagamentos/criar-sessao', {
      method: 'POST',
      body: JSON.stringify({ concurso_slug: 'geral' }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.redirectUrl).toBe('/admin');
    expect(checkoutCreate).not.toHaveBeenCalled();
  });

  it('cria sessão Pro com customer_email quando usuário está logado', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user-1', email: 'aluno@test.com' },
    } as Awaited<ReturnType<typeof getServerSession>>);

    const request = new NextRequest('https://avant.test/api/pagamentos/criar-sessao', {
      method: 'POST',
      body: JSON.stringify({ concurso_slug: 'geral' }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(checkoutCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        customer_email: 'aluno@test.com',
        metadata: expect.objectContaining({ user_id: 'user-1' }),
      }),
    );
  });
});
