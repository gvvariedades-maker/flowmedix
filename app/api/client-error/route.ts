import { NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

const ClientErrorSchema = z.object({
  message: z.string().min(1).max(2000),
  stack: z.string().max(8000).optional(),
  digest: z.string().max(200).optional(),
  source: z.string().max(80).optional(),
  url: z.string().max(2000).optional(),
  userAgent: z.string().max(500).optional(),
});

/**
 * Captura erros do client (error boundaries, window.onerror, unhandledrejection)
 * e os registra server-side via logger (visivel nos logs da Vercel).
 *
 * Seam para observabilidade externa: para enviar a um servico como Sentry,
 * encaminhe `parsed.data` aqui (gated por env opcional) sem mudar o client.
 */
export async function POST(req: Request) {
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

  const { message, stack, digest, source, url, userAgent } = parsed.data;
  logger.error('Client-side error reported', new Error(message), {
    stack,
    digest,
    source: source ?? 'unknown',
    url,
    userAgent,
  });

  return new NextResponse(null, { status: 204 });
}
