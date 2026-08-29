import { BackupEngine, DEFAULT_RETENTION_POLICY, R2_CANONICAL_CONFIG, R2_GFS_BUCKET_LOCK_POLICIES } from '../../../scripts/backup-automation';
import crypto from 'node:crypto';

describe('AVANT Backup Automation Engine — 7F.3.2 Hardened Tests', () => {
  const masterKek = 'avant-synthetic-test-master-kek-2026-passphrase';

  test('R2 Infrastructure Canonical Specification & GFS Policy Alignment', () => {
    expect(R2_CANONICAL_CONFIG.bucketName).toBe('avant-disaster-recovery-vault');
    expect(R2_CANONICAL_CONFIG.locationMode).toBe('Automatic');
    expect(R2_CANONICAL_CONFIG.jurisdiction).toBe('default');
    expect(R2_CANONICAL_CONFIG.jurisdictionGuarantee).toBe('NONE');
    expect(R2_CANONICAL_CONFIG.storageClass).toBe('Standard');
    expect(R2_CANONICAL_CONFIG.bucketPrivate).toBe(true);
    expect(R2_CANONICAL_CONFIG.publicAccess).toBe('DISABLED');
    expect(R2_CANONICAL_CONFIG.r2DevPublicAccess).toBe('DISABLED');
    expect(R2_CANONICAL_CONFIG.customPublicDomain).toBe('NONE');

    // GFS prefix contracts matching retention
    expect(R2_GFS_BUCKET_LOCK_POLICIES.daily.prefix).toBe('daily/');
    expect(R2_GFS_BUCKET_LOCK_POLICIES.daily.retentionDays).toBe(14);
    expect(R2_GFS_BUCKET_LOCK_POLICIES.weekly.prefix).toBe('weekly/');
    expect(R2_GFS_BUCKET_LOCK_POLICIES.weekly.retentionDays).toBeGreaterThanOrEqual(35);
    expect(R2_GFS_BUCKET_LOCK_POLICIES.monthly.prefix).toBe('monthly/');
    expect(R2_GFS_BUCKET_LOCK_POLICIES.monthly.retentionDays).toBeGreaterThanOrEqual(370);
  });

  test('FULL_OFFSITE_BACKUP_ENCRYPTION: creates and verifies unified AVANT_DR_SNAPSHOT_V1 envelope', () => {
    const engine = new BackupEngine(masterKek);
    const items = engine.generateSyntheticBackupSet();

    expect(items.length).toBe(4);
    items.forEach(item => expect(item.isSensitive).toBe(true));

    const envelope = engine.createDrSnapshot(items, { sequenceId: 1, gfsTier: 'daily' });

    expect(envelope.format_version).toBe('AVANT_DR_SNAPSHOT_V1');
    expect(envelope.magic).toBe('AVANT_DR_V1');
    expect(envelope.sequence_id).toBe(1);
    expect(envelope.gfs_tier).toBe('daily');
    expect(envelope.wrapped_dek.algorithm).toBe('AES-256-GCM');
    expect(envelope.payload_ciphertext_base64).toBeDefined();

    // Verify decryption and authentication
    const result = engine.decryptAndVerifyDrSnapshot(envelope);
    expect(result.manifest.format_version).toBe('AVANT_DR_SNAPSHOT_V1');
    expect(result.manifest.sequence_id).toBe(1);
    expect(result.manifest.gfs_tier).toBe('daily');
    expect(result.components.size).toBe(4);
    expect(result.components.get('database_public_data')?.toString('utf8')).toContain('CREATE TABLE public.synthetic_users');
  });

  describe('OFFSITE_SECURITY_ADVERSARIAL_TESTS & R2 SYNTHETIC LOCK', () => {
    test('1. Database/Public plaintext rejection: fails closed if any item marked unencrypted', () => {
      const engine = new BackupEngine(masterKek);
      const badItems: any = [
        { name: 'database_public_data', isSensitive: false, data: 'plain_data' }
      ];
      expect(() => {
        engine.createDrSnapshot(badItems, { sequenceId: 2 });
      }).toThrow('[FAIL_CLOSED] Unencrypted item detected');
    });

    test('2. Manifest and ciphertext replaced simultaneously: fails authentication tag', () => {
      const engine = new BackupEngine(masterKek);
      const items = engine.generateSyntheticBackupSet();
      const envelope = engine.createDrSnapshot(items, { sequenceId: 3 });

      // Attacker creates fake payload with fake manifest and tries to forge envelope without DEK authTag
      const forgedCiphertext = Buffer.from('FORGED_PAYLOAD_CIPHERTEXT').toString('base64');
      const forgedEnvelope = {
        ...envelope,
        payload_ciphertext_base64: forgedCiphertext,
        ciphertext_sha256: crypto.createHash('sha256').update(Buffer.from('FORGED_PAYLOAD_CIPHERTEXT')).digest('hex')
      };

      expect(() => {
        engine.decryptAndVerifyDrSnapshot(forgedEnvelope);
      }).toThrow('[FAIL_CLOSED] Payload authentication/decryption failed');
    });

    test('3. Stale valid snapshot replayed: fails monotonic sequence validation', () => {
      const engine = new BackupEngine(masterKek);
      const items = engine.generateSyntheticBackupSet();

      const lastKnownGood = { sequence_id: 10, created_at: '2026-08-27T03:00:00.000Z' };
      const staleEnvelope = engine.createDrSnapshot(items, {
        sequenceId: 9,
        createdAt: '2026-08-26T03:00:00.000Z'
      });

      expect(() => {
        engine.validateMonotonicSequence(staleEnvelope, lastKnownGood);
      }).toThrow('[FAIL_CLOSED] Stale valid snapshot replay detected');
    });

    test('4. Tampered timestamp: fails authenticated AAD check', () => {
      const engine = new BackupEngine(masterKek);
      const items = engine.generateSyntheticBackupSet();
      const envelope = engine.createDrSnapshot(items, { sequenceId: 4, createdAt: '2026-08-27T03:00:00.000Z' });

      // Attacker changes envelope timestamp header
      const tamperedEnvelope = {
        ...envelope,
        created_at: '2026-08-27T04:00:00.000Z'
      };

      expect(() => {
        engine.decryptAndVerifyDrSnapshot(tamperedEnvelope);
      }).toThrow('[FAIL_CLOSED] Payload authentication/decryption failed');
    });

    test('5. Incorrect DEK: fails closed when DEK is modified', () => {
      const engine = new BackupEngine(masterKek);
      const items = engine.generateSyntheticBackupSet();
      const envelope = engine.createDrSnapshot(items, { sequenceId: 5 });

      // Corrupt wrapped DEK ciphertext byte
      const rawWrappedCipher = Buffer.from(envelope.wrapped_dek.ciphertext_hex, 'hex');
      rawWrappedCipher[0] ^= 0xff;
      envelope.wrapped_dek.ciphertext_hex = rawWrappedCipher.toString('hex');

      expect(() => {
        engine.decryptAndVerifyDrSnapshot(envelope);
      }).toThrow('[FAIL_CLOSED] DEK unwrap failed');
    });

    test('6. Incorrect KEK: fails closed when master key is wrong', () => {
      const engine1 = new BackupEngine('correct-master-kek-2026');
      const engine2 = new BackupEngine('wrong-master-kek-2026');

      const items = engine1.generateSyntheticBackupSet();
      const envelope = engine1.createDrSnapshot(items, { sequenceId: 6 });

      expect(() => {
        engine2.decryptAndVerifyDrSnapshot(envelope);
      }).toThrow('[FAIL_CLOSED] DEK unwrap failed');
    });

    test('7. Tampered wrapped DEK authTag: fails closed', () => {
      const engine = new BackupEngine(masterKek);
      const items = engine.generateSyntheticBackupSet();
      const envelope = engine.createDrSnapshot(items, { sequenceId: 7 });

      const rawTag = Buffer.from(envelope.wrapped_dek.auth_tag_hex, 'hex');
      rawTag[0] ^= 0xff;
      envelope.wrapped_dek.auth_tag_hex = rawTag.toString('hex');

      expect(() => {
        engine.decryptAndVerifyDrSnapshot(envelope);
      }).toThrow('[FAIL_CLOSED] DEK unwrap failed');
    });

    test('8. Truncated envelope ciphertext: fails hash check', () => {
      const engine = new BackupEngine(masterKek);
      const items = engine.generateSyntheticBackupSet();
      const envelope = engine.createDrSnapshot(items, { sequenceId: 8 });

      const rawCipher = Buffer.from(envelope.payload_ciphertext_base64, 'base64');
      const truncated = rawCipher.subarray(0, rawCipher.length - 10);
      envelope.payload_ciphertext_base64 = truncated.toString('base64');

      expect(() => {
        engine.decryptAndVerifyDrSnapshot(envelope);
      }).toThrow('[FAIL_CLOSED] Ciphertext SHA-256 hash mismatch.');
    });

    test('9. Upload without remote readback verification: fails closed', () => {
      const engine = new BackupEngine(masterKek);
      const items = engine.generateSyntheticBackupSet();
      const envelope = engine.createDrSnapshot(items, { sequenceId: 9 });

      // Simulated corrupted readback buffer
      envelope.ciphertext_sha256 = '0000000000000000000000000000000000000000000000000000000000000000';

      expect(() => {
        engine.simulateR2VaultUpload('avant-disaster-recovery-vault', 'daily/backup.json', envelope, 'CI_BACKUP_JOB', 'PUT_OBJECT');
      }).toThrow('[FAIL_CLOSED] Ciphertext SHA-256 hash mismatch.');
    });

    test('10. Remote object divergent on readback: fails closed', () => {
      const engine = new BackupEngine(masterKek);
      const items = engine.generateSyntheticBackupSet();
      const envelope = engine.createDrSnapshot(items, { sequenceId: 10 });

      // Tamper ciphertext base64
      envelope.payload_ciphertext_base64 = Buffer.from('TAMPERED').toString('base64');

      expect(() => {
        engine.simulateR2VaultUpload('avant-disaster-recovery-vault', 'daily/backup.json', envelope, 'CI_BACKUP_JOB', 'PUT_OBJECT');
      }).toThrow('[FAIL_CLOSED] Ciphertext SHA-256 hash mismatch.');
    });

    test('11. CI token attempting to edit bucket config: blocked by least privilege', () => {
      const engine = new BackupEngine(masterKek);
      const items = engine.generateSyntheticBackupSet();
      const envelope = engine.createDrSnapshot(items, { sequenceId: 11 });

      expect(() => {
        engine.simulateR2VaultUpload('avant-disaster-recovery-vault', 'daily/backup.json', envelope, 'CI_BACKUP_JOB', 'EDIT_BUCKET_CONFIG');
      }).toThrow('[FAIL_CLOSED] CI token lacks permission for action: EDIT_BUCKET_CONFIG');
    });

    test('12. CI token attempting to delete bucket: blocked by least privilege', () => {
      const engine = new BackupEngine(masterKek);
      const items = engine.generateSyntheticBackupSet();
      const envelope = engine.createDrSnapshot(items, { sequenceId: 12 });

      expect(() => {
        engine.simulateR2VaultUpload('avant-disaster-recovery-vault', 'daily/backup.json', envelope, 'CI_BACKUP_JOB', 'DELETE_BUCKET');
      }).toThrow('[FAIL_CLOSED] CI token lacks permission for action: DELETE_BUCKET');
    });

    test('13. Unauthorized destination bucket: blocked by allowlist', () => {
      const engine = new BackupEngine(masterKek);
      const items = engine.generateSyntheticBackupSet();
      const envelope = engine.createDrSnapshot(items, { sequenceId: 13 });

      expect(() => {
        engine.simulateR2VaultUpload('unauthorized-malicious-bucket', 'daily/backup.json', envelope, 'CI_BACKUP_JOB', 'PUT_OBJECT');
      }).toThrow('[FAIL_CLOSED] Destination bucket unauthorized-malicious-bucket is not in the authorized allowlist.');
    });

    test('14. R2_SYNTHETIC_LOCK_ENFORCEMENT: blocked overwrite and delete under active lock', () => {
      const engine = new BackupEngine(masterKek);
      const items = engine.generateSyntheticBackupSet();
      const envelope = engine.createDrSnapshot(items, { sequenceId: 14, gfsTier: 'daily' });

      // Overwrite attempt under lock
      expect(() => {
        engine.simulateR2VaultUpload('avant-disaster-recovery-vault', 'daily/SYNTHETIC_LOCK_TEST_OBJECT.json', envelope, 'ADMIN_OPERATOR', 'OVERWRITE_LOCKED_OBJECT');
      }).toThrow('[FAIL_CLOSED] Cloudflare R2 Bucket Lock active');

      // Delete attempt under lock
      expect(() => {
        engine.simulateR2VaultUpload('avant-disaster-recovery-vault', 'daily/SYNTHETIC_LOCK_TEST_OBJECT.json', envelope, 'ADMIN_OPERATOR', 'DELETE_LOCKED_OBJECT');
      }).toThrow('[FAIL_CLOSED] Cloudflare R2 Bucket Lock active');
    });

    test('15. Valid synthetic write and readback succeeds', () => {
      const engine = new BackupEngine(masterKek);
      const items = engine.generateSyntheticBackupSet();
      const envelope = engine.createDrSnapshot(items, { sequenceId: 15, gfsTier: 'daily' });
      const objectKey = engine.resolveObjectKey('daily', 'SYNTHETIC_LOCK_TEST_OBJECT.json');

      const result = engine.simulateR2VaultUpload('avant-disaster-recovery-vault', objectKey, envelope, 'CI_BACKUP_JOB', 'PUT_OBJECT');
      expect(result.status).toBe('SUCCESS');
      expect(result.readbackVerified).toBe(true);
    });
  });

  describe('RETENTION_POLICY_SIMULATION & FRESHNESS', () => {
    test('Retains daily, weekly, and monthly snapshots over 90 days', () => {
      const engine = new BackupEngine(masterKek);
      const timestamps: string[] = [];
      const now = new Date('2026-08-27T03:00:00.000Z');

      for (let i = 0; i < 90; i++) {
        const d = new Date(now.getTime() - i * 24 * 3600 * 1000);
        timestamps.push(d.toISOString());
      }

      const { retained, pruned } = engine.applyRetentionPolicy(timestamps, DEFAULT_RETENTION_POLICY, now);
      expect(retained.length).toBeGreaterThanOrEqual(14);
      expect(retained.length + pruned.length).toBe(90);
    });

    test('Freshness gate calculates age correctly', () => {
      const engine = new BackupEngine(masterKek);
      const now = new Date('2026-08-27T12:00:00.000Z');

      const freshTs = new Date(now.getTime() - 2 * 3600 * 1000).toISOString();
      expect(engine.checkFreshness(freshTs, 26, now).isFresh).toBe(true);

      const staleTs = new Date(now.getTime() - 30 * 3600 * 1000).toISOString();
      expect(engine.checkFreshness(staleTs, 26, now).isFresh).toBe(false);
    });
  });
});
