import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  buildManualCaptureWrapperEnv,
  CAPTURE_ONLY_E2E_SPECS,
  E2E_CAPTURE_MODE_ENV,
  isE2eCaptureModeEnabled,
  withE2eCaptureModeEnv,
} from '@/lib/e2e/captureMode';

describe('captureMode', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('default capture mode is off', () => {
    delete process.env.E2E_CAPTURE_MODE;
    expect(isE2eCaptureModeEnabled()).toBe(false);
  });

  it('E2E_CAPTURE_MODE=true enables capture writers', () => {
    process.env.E2E_CAPTURE_MODE = 'true';
    expect(isE2eCaptureModeEnabled()).toBe(true);
  });

  it('withE2eCaptureModeEnv sets capture flag for entrypoints', () => {
    const child = withE2eCaptureModeEnv({} as NodeJS.ProcessEnv);
    expect(child[E2E_CAPTURE_MODE_ENV]).toBe('true');
  });

  it('buildManualCaptureWrapperEnv enables capture and unsets inherited CI', () => {
    const child = buildManualCaptureWrapperEnv({ CI: 'true' } as unknown as NodeJS.ProcessEnv);
    expect(child[E2E_CAPTURE_MODE_ENV]).toBe('true');
    expect(child.CI).toBeUndefined();
  });

  it('official capture npm wrappers use buildManualCaptureWrapperEnv', () => {
    const cwd = process.cwd();
    const wrappers = [
      'scripts/capture-t3-vitrine.ts',
      'scripts/capture-desempenho-hub.ts',
      'scripts/capture-hero-mockups.ts',
      'scripts/capture-questao-review.ts',
    ];
    for (const rel of wrappers) {
      const source = readFileSync(resolve(cwd, rel), 'utf8');
      expect(source).toMatch(/buildManualCaptureWrapperEnv/);
    }
    const questao = readFileSync(resolve(cwd, 'scripts/capture-questao-review.ts'), 'utf8');
    expect(questao).toMatch(/findNewOrModifiedPngs/);
    expect(questao).toMatch(/snapshotPngFiles/);
    const pkg = readFileSync(resolve(cwd, 'package.json'), 'utf8');
    expect(pkg).toMatch(/capture:hero-mockups.*capture-hero-mockups\.ts/);
  });

  it('capture-only specs reference capture mode gate', () => {
    const cwd = process.cwd();
    for (const specRel of CAPTURE_ONLY_E2E_SPECS) {
      const source = readFileSync(resolve(cwd, specRel), 'utf8');
      expect(source).toMatch(/skipUnlessE2eCaptureMode|isE2eCaptureModeEnabled/);
    }
  });
});
