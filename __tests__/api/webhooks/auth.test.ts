/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

import { POST } from '@/app/api/webhooks/auth/route';
import { sendWelcomeEmail } from '@/lib/actions/email-actions';

jest.mock('@/lib/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/lib/actions/email-actions', () => ({
  sendWelcomeEmail: jest.fn(),
}));

const mockSendWelcomeEmail = sendWelcomeEmail as jest.MockedFunction<typeof sendWelcomeEmail>;

const WEBHOOK_SECRET = 'a3f9c2e1b8d7046f5a2c9e0b7d4f1a8c6e3b0d9f2a5c8e1b4d7f0a3c6e9b2d5f8';
const TEST_USER_ID = '550e8400-e29b-41d4-a716-446655440000';

describe('POST /api/webhooks/auth', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, SUPABASE_WEBHOOK_SECRET: WEBHOOK_SECRET };
    mockSendWelcomeEmail.mockResolvedValue({ success: true });
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  function makeRequest(body: object, secret?: string) {
    const headers: Record<string, string> = { 'content-type': 'application/json' };
    if (secret !== undefined) {
      headers['x-webhook-secret'] = secret;
    }
    return new NextRequest('https://avant.test/api/webhooks/auth', {
      method: 'POST',
      body: JSON.stringify(body),
      headers,
    });
  }

  it('retorna 401 quando x-webhook-secret está ausente', async () => {
    const response = await POST(
      makeRequest({
        type: 'INSERT',
        schema: 'auth',
        table: 'users',
        record: { id: TEST_USER_ID },
      }),
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Não autorizado' });
    expect(mockSendWelcomeEmail).not.toHaveBeenCalled();
  });

  it('retorna 401 quando x-webhook-secret é inválido', async () => {
    const response = await POST(
      makeRequest(
        {
          type: 'INSERT',
          schema: 'auth',
          table: 'users',
          record: { id: TEST_USER_ID },
        },
        'secret-errado',
      ),
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Não autorizado' });
    expect(mockSendWelcomeEmail).not.toHaveBeenCalled();
  });

  it('retorna 200 e chama sendWelcomeEmail quando type=INSERT com secret válido', async () => {
    const response = await POST(
      makeRequest(
        {
          type: 'INSERT',
          schema: 'auth',
          table: 'users',
          record: { id: TEST_USER_ID },
        },
        WEBHOOK_SECRET,
      ),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ received: true, handled: true });
    expect(mockSendWelcomeEmail).toHaveBeenCalledTimes(1);
    expect(mockSendWelcomeEmail).toHaveBeenCalledWith(TEST_USER_ID);
  });

  it('retorna 200 sem chamar sendWelcomeEmail quando type != INSERT', async () => {
    const response = await POST(
      makeRequest(
        {
          type: 'UPDATE',
          schema: 'auth',
          table: 'users',
          record: { id: TEST_USER_ID },
        },
        WEBHOOK_SECRET,
      ),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ received: true, handled: false });
    expect(mockSendWelcomeEmail).not.toHaveBeenCalled();
  });
});
