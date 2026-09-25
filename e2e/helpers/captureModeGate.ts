import { test } from '@playwright/test';
import { isE2eCaptureModeEnabled } from '@/lib/e2e/captureMode';

export function skipUnlessE2eCaptureMode(reason?: string): void {
  if (!isE2eCaptureModeEnabled()) {
    test.skip(true, reason ?? 'Capture-only spec — set E2E_CAPTURE_MODE=true to run writers');
  }
}
