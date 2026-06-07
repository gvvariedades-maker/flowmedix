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

/** Vercel Cron / jobs externos: `Authorization: Bearer <CRON_SECRET>`. */
export function isAuthorizedCronRequest(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (!cronSecret) {
    return false;
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return false;
  }

  const provided = authHeader.slice('Bearer '.length);
  return timingSafeEqualString(provided, cronSecret);
}
