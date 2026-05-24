/**
 * @jest-environment node
 */

jest.mock('@/lib/supabase/api-request-user', () => ({
  getUserAndClientFromBearer: jest.fn(),
}));

jest.mock('@/lib/supabase/server-auth', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@/lib/freemium', () => ({
  getActiveProInfoForUser: jest.fn(),
}));

jest.mock('@/lib/pro/stripeCustomer', () => ({
  findStripeCustomerIdByEmail: jest.fn(),
}));

jest.mock('@/lib/stripe/client', () => ({
  getStripeClient: jest.fn(),
}));

jest.mock('@/lib/siteUrl', () => ({
  getAbsoluteUrl: (path: string) => `https://avant.test${path}`,
}));

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/pro/billing-portal/route';
import { getUserAndClientFromBearer } from '@/lib/supabase/api-request-user';
import { getServerSession } from '@/lib/supabase/server-auth';
import { getActiveProInfoForUser } from '@/lib/freemium';
import { findStripeCustomerIdByEmail } from '@/lib/pro/stripeCustomer';
import { getStripeClient } from '@/lib/stripe/client';

const mockGetUserAndClientFromBearer = getUserAndClientFromBearer as jest.MockedFunction<
  typeof getUserAndClientFromBearer
>;
const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockGetActiveProInfoForUser = getActiveProInfoForUser as jest.MockedFunction<
  typeof getActiveProInfoForUser
>;
const mockFindStripeCustomerIdByEmail = findStripeCustomerIdByEmail as jest.MockedFunction<
  typeof findStripeCustomerIdByEmail
>;
const mockGetStripeClient = getStripeClient as jest.MockedFunction<typeof getStripeClient>;

describe('POST /api/pro/billing-portal', () => {
  const portalCreate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserAndClientFromBearer.mockResolvedValue(null);
    mockGetServerSession.mockResolvedValue(null);
    mockGetActiveProInfoForUser.mockResolvedValue({ proSource: 'stripe', proExpiresAt: null });
    mockFindStripeCustomerIdByEmail.mockResolvedValue('cus_test');
    portalCreate.mockResolvedValue({ url: 'https://billing.stripe.test/portal' });
    mockGetStripeClient.mockReturnValue({
      billingPortal: { sessions: { create: portalCreate } },
    } as unknown as NonNullable<ReturnType<typeof getStripeClient>>);
  });

  it('retorna 401 sem autenticação', async () => {
    const request = new NextRequest('https://avant.test/api/pro/billing-portal', {
      method: 'POST',
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
    expect(portalCreate).not.toHaveBeenCalled();
  });

  it('retorna 403 quando Pro não é via Stripe', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user-1', email: 'aluno@teste.com' },
    } as Awaited<ReturnType<typeof getServerSession>>);
    mockGetActiveProInfoForUser.mockResolvedValue({ proSource: 'invite', proExpiresAt: null });

    const request = new NextRequest('https://avant.test/api/pro/billing-portal', {
      method: 'POST',
    });

    const response = await POST(request);
    expect(response.status).toBe(403);
    expect(portalCreate).not.toHaveBeenCalled();
  });

  it('cria sessão do Billing Portal para assinante Stripe', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user-1', email: 'aluno@teste.com' },
    } as Awaited<ReturnType<typeof getServerSession>>);

    const request = new NextRequest('https://avant.test/api/pro/billing-portal', {
      method: 'POST',
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.url).toBe('https://billing.stripe.test/portal');
    expect(mockFindStripeCustomerIdByEmail).toHaveBeenCalledWith(
      expect.anything(),
      'aluno@teste.com',
    );
    expect(portalCreate).toHaveBeenCalledWith({
      customer: 'cus_test',
      return_url: 'https://avant.test/conta/assinatura',
    });
  });
});
