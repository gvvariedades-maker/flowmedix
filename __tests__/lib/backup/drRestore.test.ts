import { BackupEngine } from '../../../scripts/backup-automation';
import {
  assertNonProductionRestoreTarget,
  assertEnvelopeProjectBinding,
  buildRestorePlan,
} from '../../../lib/backup/drRestore';
import { PROD_PROJECT_REF } from '../../../scripts/dr-backup-runner';

describe('drRestore harness', () => {
  const kek = 'test-master-kek-passphrase-2026';

  test('assertNonProductionRestoreTarget rejects Production project ref in URL', () => {
    expect(() =>
      assertNonProductionRestoreTarget(`postgresql://u:p@db.${PROD_PROJECT_REF}.supabase.co:5432/postgres`),
    ).toThrow('[FAIL_CLOSED]');
  });

  test('buildRestorePlan from synthetic envelope', () => {
    const engine = new BackupEngine(kek);
    const items = engine.generateSyntheticBackupSet();
    const envelope = engine.createDrSnapshot(items, {
      projectId: PROD_PROJECT_REF,
      sequenceId: 99,
      gfsTier: 'daily',
    });
    const { manifest, components } = engine.decryptAndVerifyDrSnapshot(envelope);
    assertEnvelopeProjectBinding(envelope, manifest);
    const plan = buildRestorePlan(envelope, manifest, components);

    expect(plan.gates.ENVELOPE_PROJECT_BINDING).toBe('PASS');
    expect(plan.inventory.snapshot_id).toBe(envelope.snapshot_id);
    expect(plan.inventory.public_table_count).toBeGreaterThan(0);
    expect(plan.component_sha256.database_public_data).toMatch(/^[a-f0-9]{64}$/);
  });

  test('assertEnvelopeProjectBinding fails on project drift', () => {
    const engine = new BackupEngine(kek);
    const items = engine.generateSyntheticBackupSet();
    const envelope = engine.createDrSnapshot(items, {
      projectId: PROD_PROJECT_REF,
      sequenceId: 1,
      gfsTier: 'daily',
    });
    const { manifest, components } = engine.decryptAndVerifyDrSnapshot(envelope);
    const tampered = { ...manifest, project_id: 'evil-project' };
    expect(() => assertEnvelopeProjectBinding(envelope, tampered)).toThrow('[FAIL_CLOSED]');
    expect(() => buildRestorePlan(envelope, tampered, components)).toThrow('[FAIL_CLOSED]');
  });
});
