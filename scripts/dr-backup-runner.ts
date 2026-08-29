#!/usr/bin/env tsx
/**
 * Thin DR backup orchestrator (7F.3B.0D).
 * Only --synthetic. Canonical crypto lives in BackupEngine / AVANT_DR_SNAPSHOT_V1.
 * REAL_R2_CLIENT_IMPLEMENTATION_FOUND = YES (adapter; R2_REAL_CONNECTIONS = 0 neste lote)
 * REAL_R2_UPLOAD_IMPLEMENTED_IN_THIS_LOT = YES (putEncryptedSnapshot; não chamado pelo --synthetic)
 */
import { DrBackupFailClosedError, runDrBackup } from '@/lib/disasterRecovery/runner';

async function main(): Promise<void> {
  const result = await runDrBackup({ argv: process.argv.slice(2) });
  process.stdout.write(`${JSON.stringify(result)}\n`);
}

main().catch((error: unknown) => {
  const message =
    error instanceof DrBackupFailClosedError
      ? `${error.code}: ${error.message}`
      : error instanceof Error
        ? error.message
        : 'dr-backup-runner failed';
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
