import { timingSafeEqual } from 'node:crypto';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { sendWelcomeEmail } from '@/lib/actions/email-actions';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

const AuthUsersWebhookPayloadSchema = z
  .object({
    type: z.string().optional(),
    event: z.string().optional(),
    table: z.string().optional(),
    schema: z.string().optional(),
    record: z
      .object({
        id: z.string().uuid(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

function isValidWebhookSecret(provided: string | null, expected: string | undefined): boolean {
  if (!provided || !expected?.trim()) {
    return false;
  }
  const a = Buffer.from(provided);
  const b = Buffer.from(expected.trim());
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(a, b);
}

function isAuthUsersInsert(payload: z.infer<typeof AuthUsersWebhookPayloadSchema>): boolean {
  const eventType = (payload.type ?? payload.event ?? '').toUpperCase();
  if (eventType !== 'INSERT') {
    return false;
  }
  if (payload.schema && payload.schema !== 'auth') {
    return false;
  }
  if (payload.table && payload.table !== 'users') {
    return false;
  }
  return true;
}

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-webhook-secret');
  const expectedSecret = process.env.SUPABASE_WEBHOOK_SECRET;

  if (!isValidWebhookSecret(secret, expectedSecret)) {
    logger.warn('Webhook Auth: secret inválido ou ausente', {
      hasHeader: Boolean(secret),
      configured: Boolean(expectedSecret?.trim()),
    });
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    logger.warn('Webhook Auth: JSON inválido');
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
  }

  const parsed = AuthUsersWebhookPayloadSchema.safeParse(body);
  if (!parsed.success) {
    logger.warn('Webhook Auth: payload não reconhecido', {
      issues: parsed.error.issues,
    });
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
  }

  if (!isAuthUsersInsert(parsed.data)) {
    return NextResponse.json({ received: true, handled: false });
  }

  const userId = parsed.data.record?.id;
  if (!userId) {
    logger.warn('Webhook Auth: INSERT sem record.id');
    return NextResponse.json({ error: 'userId ausente no payload' }, { status: 400 });
  }

  const result = await sendWelcomeEmail(userId);
  if (!result.success) {
    logger.error('Webhook Auth: falha ao enviar boas-vindas', undefined, {
      userId,
      error: result.error,
    });
    return NextResponse.json(
      { error: result.error ?? 'Falha ao enviar e-mail de boas-vindas' },
      { status: 500 },
    );
  }

  logger.info('Webhook Auth: e-mail de boas-vindas enviado', { userId });
  return NextResponse.json({ received: true, handled: true });
}
