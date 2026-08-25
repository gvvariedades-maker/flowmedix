import { NextResponse } from 'next/server';
import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { logger } from '@/lib/logger';
import { isSentryServerEnabled } from '@/lib/env';
import { sanitizeString, sanitizeUrl } from '@/lib/monitoring/sentrySanitizer';
import { apiRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const ClientErrorSchema = z.object({
  message: z.string().min(1).max(2000),
  stack: z.string().max(8000).optional(),
  digest: z.string().max(200).optional(),
  source: z.string().max(80).optional(),
  url: z.string().max(2000).optional(),
  userAgent: z.string().max(500).optional(),
  clientSentryReported: z.boolean().optional(),
});

/**
 * Captura erros do client (error boundaries, window.onerror, unhandledrejection)
 * e os registra server-side via logger (visível nos logs da Vercel).
 *
 * Seam para observabilidade externa: encaminha ao Sentry como fallback quando
 * o browser não tiver despachado diretamente.
 */
export async function POST(req: Request) {
  if (!apiRateLimit(req, 30, 60000)) {
    return new NextResponse(null, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const parsed = ClientErrorSchema.safeParse(body);
  if (!parsed.success) {
    return new NextResponse(null, { status: 400 });
  }

  const { message, stack, digest, source, url, userAgent, clientSentryReported } = parsed.data;
  const safeMessage = sanitizeString(message);
  const safeStack = stack ? sanitizeString(stack) : undefined;
  const safeUrl = url ? sanitizeUrl(url) : undefined;

  logger.error('Client-side error reported', new Error(safeMessage), {
    skipSentry: true, // Evita duplicação já tratada explicitamente abaixo
    stack: safeStack,
    digest,
    source: source ?? 'unknown',
    url: safeUrl,
    userAgent,
    clientSentryReported,
  });

  // Encaminha para o Sentry do servidor apenas se o cliente ainda NÃO reportou diretamente
  if (!clientSentryReported && isSentryServerEnabled()) {
    const error = new Error(safeMessage);
    if (safeStack) error.stack = safeStack;
    Sentry.captureException(error, {
      tags: { source: source ?? 'unknown', origin: 'client-error-route' },
      extra: { digest, url: safeUrl, userAgent },
    });
  }

  return new NextResponse(null, { status: 204 });
}
