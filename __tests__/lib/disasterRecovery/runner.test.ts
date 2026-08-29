/**
 * @jest-environment node
 */
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { BackupEngine, type AuthenticatedDrSnapshotEnvelope } from '@/scripts/backup-automation';
import { SNAPSHOT_FORMAT } from '@/lib/disasterRecovery/constants';
import { DrBackupFailClosedError } from '@/lib/disasterRecovery/errors';
import { parseDrBackupArgv, runDrBackup } from '@/lib/disasterRecovery/runner';
import { restoreStorageFiguresBytes, STORAGE_FIGURES_COMPONENT_NAME } from '@/lib/disasterRecovery/storageReader';

function expectFailClosed(fn: () => Promise<unknown> | unknown, code: string): Promise<void> {
  return (async () => {
    try {
      await fn();
      throw new Error(`esperava ${code}`);
    } catch (error) {
      expect(error).toBeInstanceOf(DrBackupFailClosedError);
      expect((error as DrBackupFailClosedError).code).toBe(code);
    }
  })();
}

describe('DR backup runner', () => {
  it('synthetic usa BackupEngine canônico e verifica AVANT_DR_SNAPSHOT_V1', async () => {
    const fetchSpy = jest.spyOn(globalThis, 'fetch');
    const engine = new BackupEngine('avant-synthetic-test-master-kek-2026-passphrase');
    const decryptSpy = jest.spyOn(engine, 'decryptAndVerifyDrSnapshot');
    const createSpy = jest.spyOn(engine, 'createDrSnapshot');

    const result = await runDrBackup({
      argv: ['--synthetic'],
      now: new Date('2026-08-29T12:00:00.000Z'),
      engine,
    });

    expect(createSpy).toHaveBeenCalled();
    expect(decryptSpy).toHaveBeenCalled();
    expect(result.ok).toBe(true);
    expect(result.mode).toBe('synthetic');
    expect(result.format).toBe(SNAPSHOT_FORMAT);
    expect(result.format).toBe('AVANT_DR_SNAPSHOT_V1');
    expect(result.envelopeVerified).toBe(true);
    expect(result.monotonicReplayCheck).toBe(true);
    expect(result.ciphertextSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(result.networkCalls).toBe(0);
    expect(result.productionConnections).toBe(0);
    expect(result.storageRealConnections).toBe(0);
    expect(result.r2RealConnections).toBe(0);
    expect(result.offsiteObjectsCreated).toBe(0);
    expect(result.productionMutations).toBe(0);
    expect(result.realR2ClientImplementationFound).toBe('YES');
    expect(result.storageObjectBytesCapture).toBe('NOT_PROVEN');
    expect(fetchSpy).not.toHaveBeenCalled();

    const sealed = createSpy.mock.results[0]?.value as AuthenticatedDrSnapshotEnvelope;
    expect(sealed).toBeDefined();
    const verified = engine.decryptAndVerifyDrSnapshot(sealed);
    const storageComponent = verified.components.get(STORAGE_FIGURES_COMPONENT_NAME);
    expect(storageComponent).toBeDefined();
    const restored = restoreStorageFiguresBytes(storageComponent!);
    expect(restored).toHaveLength(1);
    expect(restored[0].byte_sha256).toMatch(/^[a-f0-9]{64}$/);
    fetchSpy.mockRestore();
  });

  it('falha fechado em --production antes de I/O', async () => {
    const fetchSpy = jest.spyOn(globalThis, 'fetch');
    await expectFailClosed(() => runDrBackup({ argv: ['--production'] }), 'PRODUCTION_NOT_AUTHORIZED');
    await expectFailClosed(
      () => runDrBackup({ mode: 'production', productionAuthorized: false }),
      'PRODUCTION_NOT_AUTHORIZED',
    );
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it('falha fechado na ausência de configuração mesmo com autorização futura', async () => {
    const fetchSpy = jest.spyOn(globalThis, 'fetch');
    await expectFailClosed(
      () => runDrBackup({ mode: 'production', productionAuthorized: true }),
      'PRODUCTION_CONFIG_ABSENT',
    );
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it('rejeita sequência inválida e ausência de modo', async () => {
    expect(parseDrBackupArgv(['--synthetic', '--production'])).toEqual({
      synthetic: true,
      production: true,
      unknownFlags: [],
    });
    await expectFailClosed(
      () => runDrBackup({ argv: ['--synthetic', '--production'] }),
      'INVALID_SEQUENCE',
    );
    await expectFailClosed(() => runDrBackup({ argv: [] }), 'MISSING_MODE');
  });

  it('rejeita flag desconhecida', async () => {
    await expectFailClosed(
      () => runDrBackup({ argv: ['--synthetic', '--endpoint=https://evil.example/sql'] }),
      'UNKNOWN_FLAG',
    );
  });

  it('CLI tsx --synthetic conclui localmente', () => {
    const cli = spawnSync(
      process.execPath,
      [require.resolve('tsx/cli'), resolve(process.cwd(), 'scripts/dr-backup-runner.ts'), '--synthetic'],
      {
        cwd: process.cwd(),
        encoding: 'utf8',
      },
    );

    expect(cli.status).toBe(0);
    const payload = JSON.parse(cli.stdout.trim()) as {
      format: string;
      mode: string;
      envelopeVerified: boolean;
    };
    expect(payload.mode).toBe('synthetic');
    expect(payload.format).toBe('AVANT_DR_SNAPSHOT_V1');
    expect(payload.envelopeVerified).toBe(true);
    expect(cli.stderr).not.toMatch(/Authorization|DATABASE_URL|printenv/i);
  });
});
