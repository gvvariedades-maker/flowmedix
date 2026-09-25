/** Explicit opt-in for Playwright suites that write golden/evidence screenshots to tracked paths. */
export const E2E_CAPTURE_MODE_ENV = 'E2E_CAPTURE_MODE';

export function isE2eCaptureModeEnabled(): boolean {
  return process.env[E2E_CAPTURE_MODE_ENV] === 'true';
}

/** Child env for official capture entrypoints (`npm run capture:*`) — must opt in writers. */
export function withE2eCaptureModeEnv(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  return {
    ...env,
    [E2E_CAPTURE_MODE_ENV]: 'true',
  };
}

/**
 * Manual capture wrappers: capture mode on, CI unset so gated specs are not skipped by inherited CI=true.
 */
export function buildManualCaptureWrapperEnv(
  parent: NodeJS.ProcessEnv,
  extra: Partial<NodeJS.ProcessEnv> = {},
): NodeJS.ProcessEnv {
  const next = withE2eCaptureModeEnv({ ...parent, ...extra } as NodeJS.ProcessEnv);
  delete next.CI;
  return next;
}

/** Capture-only specs gated by {@link isE2eCaptureModeEnabled} — default `npm run test:e2e` must not mutate tracked assets. */
export const CAPTURE_ONLY_E2E_SPECS = [
  'e2e/audit-visual-baseline.spec.ts',
  'e2e/audit-visual-editorial-v2.spec.ts',
  'e2e/audit-visual-external.spec.ts',
  'e2e/capture-desempenho-hub.spec.ts',
  'e2e/capture-editorial-premium-after.spec.ts',
  'e2e/capture-editorial-premium-before.spec.ts',
  'e2e/capture-hero-mockups.spec.ts',
  'e2e/capture-questao-review.spec.ts',
  'e2e/capture-t3-vitrine.spec.ts',
] as const;
