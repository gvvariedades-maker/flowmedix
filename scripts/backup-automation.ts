import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export interface BackupSetItem {
  name: string;
  isSensitive: true; // ALL components in AVANT_DR_SNAPSHOT_V1 are sensitive
  frequency: string;
  format: string;
  data: Buffer | string;
}

export interface SnapshotInnerManifest {
  format_version: 'AVANT_DR_SNAPSHOT_V1';
  snapshot_id: string;
  sequence_id: number;
  created_at: string;
  project_id: string;
  backup_type: 'SYNTHETIC' | 'PRODUCTION';
  gfs_tier: 'daily' | 'weekly' | 'monthly';
  components: {
    name: string;
    plaintext_sha256: string;
    size_bytes: number;
  }[];
}

export interface AuthenticatedDrSnapshotEnvelope {
  format_version: 'AVANT_DR_SNAPSHOT_V1';
  magic: 'AVANT_DR_V1';
  snapshot_id: string;
  sequence_id: number;
  created_at: string;
  project_id: string;
  gfs_tier: 'daily' | 'weekly' | 'monthly';
  wrapped_dek: {
    algorithm: 'AES-256-GCM';
    iv_hex: string;
    auth_tag_hex: string;
    ciphertext_hex: string;
  };
  payload_iv_hex: string;
  payload_auth_tag_hex: string;
  payload_ciphertext_base64: string;
  ciphertext_sha256: string;
}

export interface RetentionPolicy {
  dailyRetentionCount: number;
  weeklyRetentionCount: number;
  monthlyRetentionCount: number;
}

export const DEFAULT_RETENTION_POLICY: RetentionPolicy = {
  dailyRetentionCount: 14,
  weeklyRetentionCount: 4,
  monthlyRetentionCount: 12,
};

export interface R2BucketLockPolicy {
  prefix: string;
  retentionDays: number;
}

export const R2_GFS_BUCKET_LOCK_POLICIES: Record<'daily' | 'weekly' | 'monthly', R2BucketLockPolicy> = {
  daily: { prefix: 'daily/', retentionDays: 14 },
  weekly: { prefix: 'weekly/', retentionDays: 35 },
  monthly: { prefix: 'monthly/', retentionDays: 370 },
};

export interface R2BucketInfrastructureConfig {
  bucketName: 'avant-disaster-recovery-vault';
  locationMode: 'Automatic';
  jurisdiction: 'default';
  jurisdictionGuarantee: 'NONE';
  storageClass: 'Standard';
  bucketPrivate: true;
  publicAccess: 'DISABLED';
  r2DevPublicAccess: 'DISABLED';
  customPublicDomain: 'NONE';
  lockPolicies: typeof R2_GFS_BUCKET_LOCK_POLICIES;
}

export const R2_CANONICAL_CONFIG: R2BucketInfrastructureConfig = {
  bucketName: 'avant-disaster-recovery-vault',
  locationMode: 'Automatic',
  jurisdiction: 'default',
  jurisdictionGuarantee: 'NONE',
  storageClass: 'Standard',
  bucketPrivate: true,
  publicAccess: 'DISABLED',
  r2DevPublicAccess: 'DISABLED',
  customPublicDomain: 'NONE',
  lockPolicies: R2_GFS_BUCKET_LOCK_POLICIES,
};

/** Single source of truth for R2 destination names (engine + DR allowlist). */
export const CANONICAL_ALLOWED_R2_BUCKETS = [
  'avant-disaster-recovery-vault',
  'synthetic-test-vault',
] as const;

export type CanonicalAllowedR2Bucket = (typeof CANONICAL_ALLOWED_R2_BUCKETS)[number];

export class BackupEngine {
  private kek: Buffer | null = null;
  private readonly magic = 'AVANT_DR_V1';
  private readonly allowedBuckets = new Set<string>(CANONICAL_ALLOWED_R2_BUCKETS);

  constructor(kekHexOrPassphrase?: string) {
    if (kekHexOrPassphrase) {
      this.setKek(kekHexOrPassphrase);
    }
  }

  public setKek(keyOrPass: string) {
    if (keyOrPass.length === 64 && /^[0-9a-fA-F]+$/.test(keyOrPass)) {
      this.kek = Buffer.from(keyOrPass, 'hex');
    } else {
      const salt = Buffer.from('AVANT_BACKUP_KEK_SALT_V1', 'utf8');
      this.kek = crypto.scryptSync(keyOrPass, salt, 32, { N: 16384, r: 8, p: 1 });
    }
  }

  /**
   * Generates a per-snapshot random 256-bit Data Encryption Key (DEK)
   * and wraps it with the Key Encryption Key (KEK) using AES-256-GCM.
   */
  public generateWrappedDek(): { dek: Buffer; wrappedDek: AuthenticatedDrSnapshotEnvelope['wrapped_dek'] } {
    if (!this.kek) {
      throw new Error('[FAIL_CLOSED] KEK (Key Encryption Key) not configured.');
    }

    const dek = crypto.randomBytes(32);
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.kek, iv);
    cipher.setAAD(Buffer.from('AVANT_DEK_WRAP_AAD_V1', 'utf8'));

    const ciphertext = Buffer.concat([cipher.update(dek), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return {
      dek,
      wrappedDek: {
        algorithm: 'AES-256-GCM',
        iv_hex: iv.toString('hex'),
        auth_tag_hex: authTag.toString('hex'),
        ciphertext_hex: ciphertext.toString('hex')
      }
    };
  }

  /**
   * Unwraps a per-snapshot DEK using the KEK.
   */
  public unwrapDek(wrappedDek: AuthenticatedDrSnapshotEnvelope['wrapped_dek']): Buffer {
    if (!this.kek) {
      throw new Error('[FAIL_CLOSED] KEK missing for unwrapping DEK.');
    }

    const iv = Buffer.from(wrappedDek.iv_hex, 'hex');
    const authTag = Buffer.from(wrappedDek.auth_tag_hex, 'hex');
    const ciphertext = Buffer.from(wrappedDek.ciphertext_hex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', this.kek, iv);
    decipher.setAAD(Buffer.from('AVANT_DEK_WRAP_AAD_V1', 'utf8'));
    decipher.setAuthTag(authTag);

    try {
      return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    } catch (err: any) {
      throw new Error(`[FAIL_CLOSED] DEK unwrap failed (invalid KEK or tampered wrapped DEK): ${err.message}`);
    }
  }

  public generateSyntheticBackupSet(): BackupSetItem[] {
    return [
      {
        name: 'database_public_data',
        isSensitive: true,
        frequency: 'DAILY',
        format: 'SQL_DUMP',
        data: Buffer.from('-- SYNTHETIC PUBLIC DATABASE DUMP WITH PII\nCREATE TABLE public.synthetic_users (id uuid, email text);\n', 'utf8')
      },
      {
        name: 'auth_sensitive_vault',
        isSensitive: true,
        frequency: 'DAILY',
        format: 'JSON',
        data: Buffer.from(JSON.stringify({
          users: [{ id: 'synthetic-user-1', email: 'user1@synthetic.test' }],
          identities: [{ id: 'ident-1', user_id: 'synthetic-user-1' }],
          mfa_factors: [{ id: 'factor-1', user_id: 'synthetic-user-1', factor_type: 'totp' }]
        }), 'utf8')
      },
      {
        name: 'storage_figures_archive',
        isSensitive: true,
        frequency: 'DAILY',
        format: 'AVANT_STORAGE_FIGURES_V1',
        data: Buffer.from(JSON.stringify({
          format: 'AVANT_STORAGE_FIGURES_V1',
          bucket_id: 'questao-figures',
          hash_source: 'DOWNLOADED_BYTES',
          plaintext_archive_on_disk: 0,
          objects: (() => {
            const bytes = Buffer.from('RIFF-SYNTHETIC-QUESTAO-FIGURE-BYTES', 'utf8');
            return [{
              storage_object_id: 'synthetic-questao-figure-1',
              bucket_id: 'questao-figures',
              object_name: '3352957/f1.webp',
              size: bytes.length,
              content_type: 'image/webp',
              byte_sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
              bytes_base64: bytes.toString('base64'),
            }];
          })(),
        }), 'utf8')
      },
      {
        name: 'recovery_metadata_ledger',
        isSensitive: true,
        frequency: 'DAILY',
        format: 'JSON',
        data: Buffer.from(JSON.stringify({
          baseline: 'avant-snapshot-2026-06-10',
          migration_count: 53,
          project_id: 'synthetic-avant-dev'
        }), 'utf8')
      }
    ];
  }

  /**
   * Resolves the canonical object key path based on GFS tier.
   */
  public resolveObjectKey(gfsTier: 'daily' | 'weekly' | 'monthly', filename: string): string {
    const policy = R2_GFS_BUCKET_LOCK_POLICIES[gfsTier];
    if (!policy) {
      throw new Error(`[FAIL_CLOSED] Unknown GFS tier: ${gfsTier}`);
    }
    return `${policy.prefix}${filename}`;
  }

  /**
   * Packages the entire AVANT_BACKUP_SET into an authenticated, encrypted AVANT_DR_SNAPSHOT_V1 envelope.
   * Both data and inner manifest are sealed within the authenticated ciphertext.
   */
  public createDrSnapshot(
    items: BackupSetItem[],
    options: {
      projectId?: string;
      sequenceId: number;
      createdAt?: string;
      gfsTier?: 'daily' | 'weekly' | 'monthly';
      customDek?: Buffer;
    }
  ): AuthenticatedDrSnapshotEnvelope {
    const projectId = options.projectId || 'synthetic-avant-dev';
    const createdAt = options.createdAt || new Date().toISOString();
    const gfsTier = options.gfsTier || 'daily';
    const snapshotId = `dr-${projectId}-${gfsTier}-${options.sequenceId}-${Date.now()}`;

    // Verify all items are treated as sensitive
    for (const item of items) {
      if (!item.isSensitive) {
        throw new Error(`[FAIL_CLOSED] Unencrypted item detected: ${item.name}. ALL backup components must be sensitive.`);
      }
    }

    // 1. Generate or use DEK & wrapped DEK
    let dek: Buffer;
    let wrappedDek: AuthenticatedDrSnapshotEnvelope['wrapped_dek'];

    if (options.customDek) {
      dek = options.customDek;
      const { wrappedDek: w } = this.generateWrappedDek();
      wrappedDek = w;
    } else {
      const generated = this.generateWrappedDek();
      dek = generated.dek;
      wrappedDek = generated.wrappedDek;
    }

    // 2. Build inner manifest
    const componentsMap: Record<string, string> = {};
    const innerManifest: SnapshotInnerManifest = {
      format_version: 'AVANT_DR_SNAPSHOT_V1',
      snapshot_id: snapshotId,
      sequence_id: options.sequenceId,
      created_at: createdAt,
      project_id: projectId,
      backup_type: projectId.includes('synthetic') ? 'SYNTHETIC' : 'PRODUCTION',
      gfs_tier: gfsTier,
      components: []
    };

    for (const item of items) {
      const plainBuf = Buffer.isBuffer(item.data) ? item.data : Buffer.from(item.data, 'utf8');
      const sha256 = crypto.createHash('sha256').update(plainBuf).digest('hex');
      innerManifest.components.push({
        name: item.name,
        plaintext_sha256: sha256,
        size_bytes: plainBuf.length
      });
      componentsMap[item.name] = plainBuf.toString('base64');
    }

    // 3. Serialize full payload (Inner Manifest + All Component Data)
    const rawPayload = JSON.stringify({
      manifest: innerManifest,
      components: componentsMap
    });
    const rawPayloadBuffer = Buffer.from(rawPayload, 'utf8');

    // 4. Encrypt full payload with per-snapshot DEK
    const payloadIv = crypto.randomBytes(12);
    const payloadCipher = crypto.createCipheriv('aes-256-gcm', dek, payloadIv);

    // Authenticated AAD binds snapshot identity, sequence, tier and timestamp to ciphertext
    const aadString = `${this.magic}:${snapshotId}:${options.sequenceId}:${gfsTier}:${createdAt}:${projectId}`;
    payloadCipher.setAAD(Buffer.from(aadString, 'utf8'));

    const ciphertextBuffer = Buffer.concat([payloadCipher.update(rawPayloadBuffer), payloadCipher.final()]);
    const payloadAuthTag = payloadCipher.getAuthTag();

    const ciphertextSha256 = crypto.createHash('sha256').update(ciphertextBuffer).digest('hex');

    return {
      format_version: 'AVANT_DR_SNAPSHOT_V1',
      magic: 'AVANT_DR_V1',
      snapshot_id: snapshotId,
      sequence_id: options.sequenceId,
      created_at: createdAt,
      project_id: projectId,
      gfs_tier: gfsTier,
      wrapped_dek: wrappedDek,
      payload_iv_hex: payloadIv.toString('hex'),
      payload_auth_tag_hex: payloadAuthTag.toString('hex'),
      payload_ciphertext_base64: ciphertextBuffer.toString('base64'),
      ciphertext_sha256: ciphertextSha256
    };
  }

  /**
   * Decrypts and authenticates an AVANT_DR_SNAPSHOT_V1 envelope.
   * Validates AAD, auth tags, wrapped DEK, inner manifest and component SHA-256 hashes.
   */
  public decryptAndVerifyDrSnapshot(envelope: AuthenticatedDrSnapshotEnvelope): {
    manifest: SnapshotInnerManifest;
    components: Map<string, Buffer>;
  } {
    if (envelope.magic !== this.magic) {
      throw new Error(`[FAIL_CLOSED] Invalid magic header in envelope: ${envelope.magic}`);
    }

    // 1. Unwrap DEK using KEK
    const dek = this.unwrapDek(envelope.wrapped_dek);

    // 2. Verify ciphertext hash
    const ciphertextBuffer = Buffer.from(envelope.payload_ciphertext_base64, 'base64');
    const calculatedSha = crypto.createHash('sha256').update(ciphertextBuffer).digest('hex');
    if (calculatedSha !== envelope.ciphertext_sha256) {
      throw new Error('[FAIL_CLOSED] Ciphertext SHA-256 hash mismatch.');
    }

    // 3. Decipher payload with DEK and authenticated AAD
    const payloadIv = Buffer.from(envelope.payload_iv_hex, 'hex');
    const payloadAuthTag = Buffer.from(envelope.payload_auth_tag_hex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', dek, payloadIv);
    const aadString = `${this.magic}:${envelope.snapshot_id}:${envelope.sequence_id}:${envelope.gfs_tier}:${envelope.created_at}:${envelope.project_id}`;
    decipher.setAAD(Buffer.from(aadString, 'utf8'));
    decipher.setAuthTag(payloadAuthTag);

    let rawPayloadBuffer: Buffer;
    try {
      rawPayloadBuffer = Buffer.concat([decipher.update(ciphertextBuffer), decipher.final()]);
    } catch (err: any) {
      throw new Error(`[FAIL_CLOSED] Payload authentication/decryption failed: ${err.message}`);
    }

    // 4. Parse inner manifest and components
    const payloadObj = JSON.parse(rawPayloadBuffer.toString('utf8'));
    const manifest: SnapshotInnerManifest = payloadObj.manifest;
    const componentsMap: Record<string, string> = payloadObj.components;

    // Verify inner manifest matches envelope headers
    if (manifest.snapshot_id !== envelope.snapshot_id || manifest.sequence_id !== envelope.sequence_id) {
      throw new Error('[FAIL_CLOSED] Inner manifest identity does not match envelope identity.');
    }

    const components = new Map<string, Buffer>();

    // 5. Verify individual component hashes
    for (const comp of manifest.components) {
      const b64 = componentsMap[comp.name];
      if (!b64) {
        throw new Error(`[FAIL_CLOSED] Missing component data for ${comp.name}`);
      }
      const plainBuf = Buffer.from(b64, 'base64');
      const sha256 = crypto.createHash('sha256').update(plainBuf).digest('hex');
      if (sha256 !== comp.plaintext_sha256) {
        throw new Error(`[FAIL_CLOSED] Plaintext SHA-256 mismatch for ${comp.name}`);
      }
      components.set(comp.name, plainBuf);
    }

    return { manifest, components };
  }

  /**
   * Anti-Rollback & Monotonic Replay Detection:
   * Validates that a new snapshot is strictly more recent than the recorded last known good snapshot.
   */
  public validateMonotonicSequence(
    newEnvelope: AuthenticatedDrSnapshotEnvelope,
    lastKnownGood: { sequence_id: number; created_at: string } | null
  ): boolean {
    if (!lastKnownGood) return true;

    const newTime = new Date(newEnvelope.created_at).getTime();
    const lastTime = new Date(lastKnownGood.created_at).getTime();

    if (newEnvelope.sequence_id <= lastKnownGood.sequence_id) {
      throw new Error(
        `[FAIL_CLOSED] Stale valid snapshot replay detected: sequence ${newEnvelope.sequence_id} <= ${lastKnownGood.sequence_id}`
      );
    }

    if (newTime <= lastTime) {
      throw new Error(
        `[FAIL_CLOSED] Stale valid snapshot replay detected: timestamp ${newEnvelope.created_at} <= ${lastKnownGood.created_at}`
      );
    }

    return true;
  }

  /**
   * Simulated Cloudflare R2 Object Upload with least-privilege guard,
   * allowlist validation, and mandatory remote readback.
   */
  public simulateR2VaultUpload(
    bucket: string,
    key: string,
    envelope: AuthenticatedDrSnapshotEnvelope,
    callerRole: 'CI_BACKUP_JOB' | 'ADMIN_OPERATOR',
    attemptedAction: 'PUT_OBJECT' | 'EDIT_BUCKET_CONFIG' | 'DELETE_BUCKET' | 'OVERWRITE_LOCKED_OBJECT' | 'DELETE_LOCKED_OBJECT'
  ): { status: 'SUCCESS' | 'BLOCKED'; readbackVerified: boolean } {
    // 1. Destination allowlist check
    if (!this.allowedBuckets.has(bucket)) {
      throw new Error(`[FAIL_CLOSED] Destination bucket ${bucket} is not in the authorized allowlist.`);
    }

    // 2. Least privilege enforcement: CI job cannot edit bucket config or delete bucket
    if (callerRole === 'CI_BACKUP_JOB' && attemptedAction !== 'PUT_OBJECT') {
      throw new Error(`[FAIL_CLOSED] CI token lacks permission for action: ${attemptedAction}`);
    }

    // 3. Bucket Lock enforcement: block overwrite and delete of locked object
    if (attemptedAction === 'OVERWRITE_LOCKED_OBJECT' || attemptedAction === 'DELETE_LOCKED_OBJECT') {
      throw new Error(`[FAIL_CLOSED] Cloudflare R2 Bucket Lock active: Object is immutable under GFS retention policy.`);
    }

    // 4. Simulate remote storage store
    const serialized = JSON.stringify(envelope);
    const remoteBuffer = Buffer.from(serialized, 'utf8');

    // 5. Mandatory Remote Readback Verification (HEAD/GET)
    const readbackEnvelope: AuthenticatedDrSnapshotEnvelope = JSON.parse(remoteBuffer.toString('utf8'));
    if (readbackEnvelope.ciphertext_sha256 !== envelope.ciphertext_sha256) {
      throw new Error('[FAIL_CLOSED] Remote readback verification failed: SHA-256 hash mismatch.');
    }

    // 6. Test decryptability from remote readback
    this.decryptAndVerifyDrSnapshot(readbackEnvelope);

    return { status: 'SUCCESS', readbackVerified: true };
  }

  public applyRetentionPolicy(
    backupTimestamps: string[],
    policy = DEFAULT_RETENTION_POLICY,
    now = new Date()
  ): { retained: string[]; pruned: string[] } {
    const dates = backupTimestamps
      .map(ts => ({ ts, date: new Date(ts) }))
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    const retained = new Set<string>();

    const dailyCount = Math.min(policy.dailyRetentionCount, dates.length);
    for (let i = 0; i < dailyCount; i++) {
      retained.add(dates[i].ts);
    }

    const weeklyMap = new Map<string, string>();
    for (const item of dates) {
      const year = item.date.getUTCFullYear();
      const weekNum = Math.ceil((item.date.getTime() - new Date(Date.UTC(year, 0, 1)).getTime()) / (7 * 24 * 3600 * 1000));
      const weekKey = `${year}-W${weekNum}`;
      if (!weeklyMap.has(weekKey) && weeklyMap.size < policy.weeklyRetentionCount) {
        weeklyMap.set(weekKey, item.ts);
        retained.add(item.ts);
      }
    }

    const monthlyMap = new Map<string, string>();
    for (const item of dates) {
      const monthKey = `${item.date.getUTCFullYear()}-${item.date.getUTCMonth() + 1}`;
      if (!monthlyMap.has(monthKey) && monthlyMap.size < policy.monthlyRetentionCount) {
        monthlyMap.set(monthKey, item.ts);
        retained.add(item.ts);
      }
    }

    const retainedList = dates.map(d => d.ts).filter(ts => retained.has(ts));
    const prunedList = dates.map(d => d.ts).filter(ts => !retained.has(ts));

    return { retained: retainedList, pruned: prunedList };
  }

  public checkFreshness(lastBackupIsoString: string, maxAgeHours = 26, now = new Date()): { isFresh: boolean; ageHours: number } {
    const lastTime = new Date(lastBackupIsoString).getTime();
    const currentTime = now.getTime();
    const ageMs = Math.max(0, currentTime - lastTime);
    const ageHours = ageMs / (1000 * 60 * 60);

    return {
      isFresh: ageHours <= maxAgeHours,
      ageHours: Number(ageHours.toFixed(2))
    };
  }
}

async function runCli() {
  const isSynthetic = process.argv.includes('--synthetic');
  if (isSynthetic) {
    console.log('[BACKUP_AUTOMATION] Executing hardened AVANT_DR_SNAPSHOT_V1 synthetic pipeline...');
    const engine = new BackupEngine('avant-synthetic-demo-kek-2026');
    const items = engine.generateSyntheticBackupSet();
    const envelope = engine.createDrSnapshot(items, { sequenceId: 101, gfsTier: 'daily' });
    
    console.log(`[BACKUP_AUTOMATION] Sealed envelope: ${envelope.snapshot_id}`);
    const verified = engine.decryptAndVerifyDrSnapshot(envelope);
    console.log(`[BACKUP_AUTOMATION] Envelope authentication: ${verified.manifest ? 'PASS' : 'FAIL'}`);
  }
}

if (process.argv[1] && process.argv[1].endsWith('backup-automation.ts')) {
  runCli().catch(err => {
    console.error(`[BACKUP_AUTOMATION_ERROR] ${err.message}`);
    process.exit(1);
  });
}
