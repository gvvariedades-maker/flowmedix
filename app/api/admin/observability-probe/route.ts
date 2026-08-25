import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin/requireAdmin';
import { isAuthorizedCronRequest } from '@/lib/cron/authorizeCron';
import { logger } from '@/lib/logger';
import { getSentryEnvironment, getSentryRelease, isSentryConfigured } from '@/lib/monitoring/sentryEnv';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    const auth = await requireAdminApi();
    if ('error' in auth) {
      return auth.error;
    }
  }

  const url = new URL(request.url);
  const action = url.searchParams.get('action') || 'logger_error';

  const env = getSentryEnvironment();
  const release = getSentryRelease();
  const configured = isSentryConfigured(false);

  if (action === 'throw') {
    // Prova App Router onRequestError
    throw new Error('AVANT_OBSERVABILITY_PROBE_7E1B_APP_ROUTER_UNHANDLED');
  }

  // Prova Server Logger + Sanitizer
  logger.error(
    'AVANT_OBSERVABILITY_PROBE_7E1B_SERVER_LOGGER',
    new Error('AVANT_OBSERVABILITY_PROBE_7E1B_SYNTHETIC_EXCEPTION'),
    {
      probe: '7E.1B',
      testType: 'server_controlled',
      syntheticAuthorization: 'Bearer SYNTHETIC_TEST_TOKEN_XYZ',
      syntheticCookie: 'session=SYNTHETIC_SESSION_COOKIE_123',
      syntheticJwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.synthetic_signature',
      syntheticUserEmail: 'fake-probe@example.test',
      safeParameter: 'safe_operation_code_42',
      tags: {
        probe_id: '7E1B',
        environment_tag: env,
      },
    }
  );

  return NextResponse.json({
    status: 'PROBE_TRIGGERED',
    action,
    environment: env,
    release: release ?? 'undefined',
    sentryConfigured: configured,
    timestamp: new Date().toISOString(),
  });
}

export async function GET(request: NextRequest) {
  return POST(request);
}
