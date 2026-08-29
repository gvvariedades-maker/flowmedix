/**
 * @jest-environment node
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { findExfilViolations } from '@/lib/disasterRecovery/exfilGuard';

const WORKFLOW = resolve(process.cwd(), '.github/workflows/disaster-recovery-backup.yml');
const RUNNER = resolve(process.cwd(), 'scripts/dr-backup-runner.ts');
const LIB_RUNNER = resolve(process.cwd(), 'lib/disasterRecovery/runner.ts');

describe('DR workflow + runner — secret exfiltration review', () => {
  const workflow = readFileSync(WORKFLOW, 'utf8');
  const runner = readFileSync(RUNNER, 'utf8');
  const libRunner = readFileSync(LIB_RUNNER, 'utf8');

  it('não contém padrões de exfiltração', () => {
    expect(findExfilViolations(workflow)).toEqual([]);
    expect(findExfilViolations(runner)).toEqual([]);
    expect(findExfilViolations(libRunner)).toEqual([]);
  });

  it('tem workflow_dispatch e não tem cron', () => {
    expect(workflow).toMatch(/workflow_dispatch:/);
    expect(workflow).not.toMatch(/^\s*schedule:/m);
    expect(workflow).not.toMatch(/\bcron:/);
  });

  it('usa permissões mínimas, environment DR, timeout e concurrency', () => {
    expect(workflow).toMatch(/permissions:\s*\n\s*contents:\s*read/);
    expect(workflow).toMatch(/environment:\s*disaster-recovery/);
    expect(workflow).toMatch(/timeout-minutes:\s*20/);
    expect(workflow).toMatch(/concurrency:/);
    expect(workflow).not.toMatch(/continue-on-error:\s*true/);
  });

  it('não injeta secrets neste lote', () => {
    expect(workflow).not.toMatch(/\$\{\{\s*secrets\./);
    expect(workflow).toMatch(/GITHUB_SECRETS_CONFIGURED = NO/);
  });

  it('não faz upload-artifact nem curl', () => {
    expect(workflow).not.toMatch(/upload-artifact/);
    expect(workflow).not.toMatch(/\bcurl\b/);
    expect(runner).not.toMatch(/\bcurl\b/);
    expect(libRunner).not.toMatch(/\bcurl\b/);
  });
});
