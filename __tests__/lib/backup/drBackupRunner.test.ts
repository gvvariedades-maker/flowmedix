import {
  validateAllowlist,
  validateRequiredSecrets,
  signS3Request,
  runDrBackup,
  PROD_PROJECT_REF,
  CANONICAL_VAULT_BUCKET,
  ALLOWED_MANAGEMENT_SQL_PATH,
  RunnerConfig
} from '../../../scripts/dr-backup-runner';
import { BackupEngine } from '../../../scripts/backup-automation';
import crypto from 'node:crypto';

describe('AVANT Disaster Recovery — 7F.3B.1 Runner & Fail-Closed Gates', () => {
  const validConfig: RunnerConfig = {
    supabaseToken: 'test_token',
    cloudflareAccountId: '0123456789abcdef0123456789abcdef',
    r2AccessKeyId: 'test_r2_key',
    r2SecretAccessKey: 'test_r2_secret',
    masterKek: 'test-master-kek-passphrase-2026',
    synthetic: true,
    sequenceId: 2
  };

  test('1. Secret ausente: fails closed when any mandatory secret is missing', () => {
    const requiredKeys: (keyof RunnerConfig)[] = [
      'supabaseToken',
      'cloudflareAccountId',
      'r2AccessKeyId',
      'r2SecretAccessKey',
      'masterKek'
    ];

    for (const key of requiredKeys) {
      const brokenConfig = { ...validConfig, [key]: '' };
      expect(() => validateRequiredSecrets(brokenConfig)).toThrow('[FAIL_CLOSED] Missing mandatory secret(s)');
    }
  });

  test('2. Project ref incorreto: fails closed when project ref is not canonical ozgouenqrofnvgrlgfwd', () => {
    expect(() => {
      validateAllowlist('attacker-project-id', ALLOWED_MANAGEMENT_SQL_PATH, CANONICAL_VAULT_BUCKET, 'daily/test.avantdr');
    }).toThrow('[FAIL_CLOSED] Target project "attacker-project-id" does not match canonical project "ozgouenqrofnvgrlgfwd"');
  });

  test('3. Endpoint SQL não-read-only / write: fails closed on non-read-only SQL path', () => {
    const forbiddenPaths = [
      '/v1/projects/ozgouenqrofnvgrlgfwd/database/query',
      '/v1/projects/ozgouenqrofnvgrlgfwd/database/migrations',
      '/v1/projects/ozgouenqrofnvgrlgfwd/database/query/write',
      '/v1/projects/ozgouenqrofnvgrlgfwd/restore'
    ];

    for (const badPath of forbiddenPaths) {
      expect(() => {
        validateAllowlist(PROD_PROJECT_REF, badPath, CANONICAL_VAULT_BUCKET, 'daily/test.avantdr');
      }).toThrow('[FAIL_CLOSED] SQL endpoint');
    }
  });

  test('4. Bucket/destino não autorizado: fails closed when bucket is not avant-disaster-recovery-vault', () => {
    expect(() => {
      validateAllowlist(PROD_PROJECT_REF, ALLOWED_MANAGEMENT_SQL_PATH, 'exfiltration-bucket', 'daily/test.avantdr');
    }).toThrow('[FAIL_CLOSED] Destination bucket "exfiltration-bucket" does not match allowlisted DR vault');
  });

  test('5. Prefixo GFS não autorizado: fails closed when key does not match GFS tier prefix', () => {
    expect(() => {
      validateAllowlist(PROD_PROJECT_REF, ALLOWED_MANAGEMENT_SQL_PATH, CANONICAL_VAULT_BUCKET, 'root-folder/test.avantdr');
    }).toThrow('[FAIL_CLOSED] Destination key "root-folder/test.avantdr" does not match authorized GFS prefixes');
  });

  test('6. AWS SigV4 signer produces valid authorization header and date tags', () => {
    const url = new URL('https://0123456789abcdef0123456789abcdef.r2.cloudflarestorage.com/avant-disaster-recovery-vault/daily/test.avantdr');
    const signed = signS3Request({
      method: 'PUT',
      url,
      accessKeyId: 'test_access_key',
      secretAccessKey: 'test_secret_key',
      body: 'test-ciphertext-payload'
    });

    expect(signed.authorization).toMatch(/^AWS4-HMAC-SHA256 Credential=test_access_key\//);
    expect(signed['x-amz-date']).toBeDefined();
    expect(signed['x-amz-content-sha256']).toBe(crypto.createHash('sha256').update('test-ciphertext-payload').digest('hex'));
    expect(signed.host).toBe('0123456789abcdef0123456789abcdef.r2.cloudflarestorage.com');
  });

  test('7. Synthetic end-to-end run: seals, encrypts, uploads to simulation, verifies readback and hash', async () => {
    const res = await runDrBackup(validConfig);
    expect(res.status).toBe('PASS');
    expect(res.sequenceId).toBe(2);
    expect(res.readbackVerified).toBe(true);
    expect(res.ciphertextSizeBytes).toBeGreaterThan(500);
    expect(res.ciphertextSha256).toMatch(/^[0-9a-f]{64}$/);
    expect(res.productionDbWriteCount).toBe(0);
    expect(res.productionSchemaChangeCount).toBe(0);
    expect(res.productionPolicyChangeCount).toBe(0);
    expect(res.secretDisclosureCount).toBe(0);
  });

  test('8. Falha de encryption / KEK inválida: fails closed when KEK is corrupted or tampered', () => {
    const engine1 = new BackupEngine('kek-alpha-12345678');
    const engine2 = new BackupEngine('kek-beta-87654321');

    const items = engine1.generateSyntheticBackupSet();
    const envelope = engine1.createDrSnapshot(items, { sequenceId: 3 });

    // Attempting to decrypt with wrong KEK must throw fail-closed
    expect(() => {
      engine2.decryptAndVerifyDrSnapshot(envelope);
    }).toThrow('[FAIL_CLOSED]');
  });

  test('9. Hash divergente: fails closed if ciphertext SHA-256 header does not match payload', () => {
    const engine = new BackupEngine('master-kek-2026');
    const items = engine.generateSyntheticBackupSet();
    const envelope = engine.createDrSnapshot(items, { sequenceId: 4 });

    // Tamper with hash
    const tampered = { ...envelope, ciphertext_sha256: '0000000000000000000000000000000000000000000000000000000000000000' };
    expect(() => {
      engine.decryptAndVerifyDrSnapshot(tampered);
    }).toThrow('[FAIL_CLOSED] Ciphertext SHA-256 hash mismatch');
  });

  test('10. Metadata incompatível / AAD tampering: fails closed if sequence or project id modified in header', () => {
    const engine = new BackupEngine('master-kek-2026');
    const items = engine.generateSyntheticBackupSet();
    const envelope = engine.createDrSnapshot(items, { sequenceId: 5, projectId: PROD_PROJECT_REF });

    // Tamper with sequence_id in envelope without modifying payload ciphertext
    const tamperedSeq = { ...envelope, sequence_id: 999 };
    expect(() => {
      engine.decryptAndVerifyDrSnapshot(tamperedSeq);
    }).toThrow('[FAIL_CLOSED]');
  });
});
