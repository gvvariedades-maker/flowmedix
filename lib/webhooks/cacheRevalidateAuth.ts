import { timingSafeEqual } from 'node:crypto';

import type { NextRequest } from 'next/server';

function timingSafeEqualString(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

/** Canonical secret for Supabase → /api/cache/revalidate (and related DB GUC). */
export function resolveCacheRevalidateWebhookSecret(): string | undefined {
  const primary = process.env.SUPABASE_WEBHOOK_SECRET?.trim();
  if (primary) {
    return primary;
  }
  return process.env.WEBHOOK_SECRET?.trim() || undefined;
}

export function isCacheRevalidateWebhookAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return false;
  }
  const provided = authHeader.slice('Bearer '.length);
  const expected = resolveCacheRevalidateWebhookSecret();

  if (process.env.NODE_ENV === 'production') {
    if (!expected) {
      return false;
    }
    return timingSafeEqualString(provided, expected);
  }

  if (!expected) {
    return true;
  }
  return timingSafeEqualString(provided, expected);
}
