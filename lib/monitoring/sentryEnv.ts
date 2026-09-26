/**
 * Sentry Environment & Release Helper
 * 
 * Works across Browser, Node.js and Edge runtimes.
 * Deterministically derives environment and release identifiers
 * from platform variables (Vercel / standard Node).
 */

export type SentryEnvironment = 'production' | 'preview' | 'development' | 'test';

/**
 * Returns the active environment name for Sentry tagging.
 */
export function getSentryEnvironment(): string {
  const vercelEnv =
    process.env.NEXT_PUBLIC_VERCEL_ENV ||
    process.env.VERCEL_ENV;

  if (vercelEnv) {
    return vercelEnv;
  }

  if (process.env.NODE_ENV === 'production') {
    return 'production';
  }

  if (process.env.NODE_ENV === 'test') {
    return 'test';
  }

  return 'development';
}

/**
 * Returns the release commit SHA or identifier for Sentry tagging.
 */
export function getSentryRelease(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.NEXT_PUBLIC_SENTRY_RELEASE ||
    process.env.SENTRY_RELEASE ||
    undefined
  );
}

/**
 * Resolves the effective DSN based on runtime context.
 */
export function getEffectiveSentryDsn(isClient = false): string | null {
  if (isClient) {
    return process.env.NEXT_PUBLIC_SENTRY_DSN?.trim() || null;
  }
  return (
    process.env.SENTRY_DSN?.trim() ||
    process.env.NEXT_PUBLIC_SENTRY_DSN?.trim() ||
    null
  );
}

/**
 * Returns whether Sentry is configured with a valid DSN.
 */
export function isSentryConfigured(isClient = false): boolean {
  return getEffectiveSentryDsn(isClient) !== null;
}
