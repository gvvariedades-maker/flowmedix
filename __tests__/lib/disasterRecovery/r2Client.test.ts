/**
 * @jest-environment node
 *
 * 7F.3B.0E required scenarios (18) → tests in this file:
 *  1 endpoint factory  2 region=auto          → 'factory produz endpoint…'
 *  3 bucket unauthorized                       → 'rejeita bucket não autorizado…'
 *  4 host inválido  18 endpoint fora allowlist → 'rejeita endpoint fora da allowlist…'
 *  5 object key inválida                       → 'object key inválida…'
 *  6 PUT ciphertext only  7 metadata sem secrets → 'PUT usa somente ciphertext…'
 *  8 HEAD length mismatch                      → 'HEAD content-length mismatch…'
 *  9 HEAD SHA metadata mismatch                → 'HEAD SHA metadata mismatch…'
 * 10 GET recomputa SHA  11 bytes adulterados
 *    12 truncado  13 objeto ausente            → 'GET recomputa SHA-256…'
 * 14 credentials ausentes                      → 'credenciais ausentes…'
 * 15 fake PUT/HEAD/GET  16 sem Delete/Admin    → 'fake client confirma apenas…'
 * 17 ETag ≠ SHA-256                            → 'ETag diferente não é tratado…'
 * R2_REQUIRED_SCENARIOS=18 COVERED=18 MISSING=0
 */
import {
  DeleteObjectCommand,
  ListBucketsCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { BackupEngine } from '@/scripts/backup-automation';
import {
  CANONICAL_PRODUCTION_ALLOWLIST,
  type DrBackupAllowlist,
} from '@/lib/disasterRecovery/allowlist';
import { CANONICAL_PRODUCTION_R2_BUCKET, SNAPSHOT_FORMAT } from '@/lib/disasterRecovery/constants';
import { DrBackupFailClosedError } from '@/lib/disasterRecovery/errors';
import {
  AvantR2ObjectStore,
  R2_ALLOWED_OPERATIONS,
  R2_BUCKET_ADMIN_CAPABILITY_IN_RUNTIME,
  R2_CLIENT_LIBRARY,
  R2_DELETE_CAPABILITY_IN_RUNTIME,
  R2_SDK_REGION,
  assertAllowedR2Command,
  assertR2HttpsEndpoint,
  buildR2Endpoint,
  createAvantR2ObjectStore,
  createR2EndpointConfig,
} from '@/lib/disasterRecovery/r2Client';
import { InMemoryR2CommandSender } from './inMemoryR2Sender';

const SYNTHETIC_ACCOUNT_ID = '0123456789abcdef0123456789abcdef';
const SYNTHETIC_HOST = `${SYNTHETIC_ACCOUNT_ID}.r2.cloudflarestorage.com`;

const TEST_ALLOWLIST: DrBackupAllowlist = {
  projectRefs: CANONICAL_PRODUCTION_ALLOWLIST.projectRefs,
  r2Buckets: [CANONICAL_PRODUCTION_R2_BUCKET],
  r2Hosts: [SYNTHETIC_HOST],
  managementApiHosts: CANONICAL_PRODUCTION_ALLOWLIST.managementApiHosts,
  allowedHttpMethods: CANONICAL_PRODUCTION_ALLOWLIST.allowedHttpMethods,
};

function expectFailClosed(fn: () => unknown, code: string): void {
  try {
    fn();
    throw new Error(`esperava ${code}`);
  } catch (error) {
    expect(error).toBeInstanceOf(DrBackupFailClosedError);
    expect((error as DrBackupFailClosedError).code).toBe(code);
  }
}

async function expectFailClosedAsync(fn: () => Promise<unknown>, code: string): Promise<void> {
  try {
    await fn();
    throw new Error(`esperava ${code}`);
  } catch (error) {
    expect(error).toBeInstanceOf(DrBackupFailClosedError);
    expect((error as DrBackupFailClosedError).code).toBe(code);
  }
}

function sealedEnvelope(engine = new BackupEngine('avant-synthetic-r2-adapter-kek-2026')) {
  const items = engine.generateSyntheticBackupSet();
  const envelope = engine.createDrSnapshot(items, {
    projectId: 'synthetic-avant-dev',
    sequenceId: 7,
    createdAt: '2026-08-29T15:00:00.000Z',
    gfsTier: 'daily',
  });
  return { engine, envelope };
}

function storeWithSender(sender: InMemoryR2CommandSender, engine?: BackupEngine): AvantR2ObjectStore {
  return createAvantR2ObjectStore({
    accountId: SYNTHETIC_ACCOUNT_ID,
    sender,
    allowlist: TEST_ALLOWLIST,
    engine,
  });
}

describe('R2 adapter (zero real network)', () => {
  it('factory produz endpoint R2 esperado e region auto', () => {
    const cfg = createR2EndpointConfig(SYNTHETIC_ACCOUNT_ID, TEST_ALLOWLIST);
    expect(cfg.endpoint).toBe(`https://${SYNTHETIC_HOST}`);
    expect(cfg.region).toBe('auto');
    expect(cfg.region).toBe(R2_SDK_REGION);
    expect(buildR2Endpoint(SYNTHETIC_ACCOUNT_ID)).toBe(cfg.endpoint);
    expect(R2_CLIENT_LIBRARY).toBe('@aws-sdk/client-s3');
  });

  it('rejeita endpoint fora da allowlist / host inválido / http / porta / query / userinfo antes de send', () => {
    const sender = new InMemoryR2CommandSender();
    expectFailClosed(
      () => assertR2HttpsEndpoint('https://s3.amazonaws.com', TEST_ALLOWLIST),
      'R2_HOST_NOT_ALLOWED',
    );
    expectFailClosed(
      () => assertR2HttpsEndpoint(`http://${SYNTHETIC_HOST}`, TEST_ALLOWLIST),
      'R2_ENDPOINT_INVALID',
    );
    expectFailClosed(
      () => assertR2HttpsEndpoint(`https://${SYNTHETIC_HOST}:8443`, TEST_ALLOWLIST),
      'R2_ENDPOINT_INVALID',
    );
    expectFailClosed(
      () => assertR2HttpsEndpoint(`https://${SYNTHETIC_HOST}/?x=1`, TEST_ALLOWLIST),
      'R2_ENDPOINT_INVALID',
    );
    expectFailClosed(
      () => assertR2HttpsEndpoint(`https://user:pass@${SYNTHETIC_HOST}`, TEST_ALLOWLIST),
      'R2_ENDPOINT_INVALID',
    );
    expectFailClosed(
      () => createR2EndpointConfig(SYNTHETIC_ACCOUNT_ID, CANONICAL_PRODUCTION_ALLOWLIST),
      'R2_HOST_NOT_ALLOWED',
    );
    expectFailClosed(
      () =>
        createAvantR2ObjectStore({
          accountId: 'not-a-valid-account-id',
          sender,
          allowlist: TEST_ALLOWLIST,
        }),
      'R2_ACCOUNT_ID_INVALID',
    );
    expect(sender.sentOps).toEqual([]);
  });

  it('rejeita bucket não autorizado antes de send', () => {
    const sender = new InMemoryR2CommandSender();
    expectFailClosed(
      () =>
        createAvantR2ObjectStore({
          accountId: SYNTHETIC_ACCOUNT_ID,
          sender,
          allowlist: TEST_ALLOWLIST,
          bucket: 'other-vault',
        }),
      'R2_BUCKET_NOT_ALLOWED',
    );
    expect(sender.sentOps).toEqual([]);
  });

  it('credenciais ausentes falham antes de rede', () => {
    const fetchSpy = jest.spyOn(globalThis, 'fetch');
    expectFailClosed(
      () =>
        createAvantR2ObjectStore({
          accountId: SYNTHETIC_ACCOUNT_ID,
          allowlist: TEST_ALLOWLIST,
        }),
      'R2_CREDENTIALS_ABSENT',
    );
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it('object key inválida é rejeitada', async () => {
    const { engine, envelope } = sealedEnvelope();
    const sender = new InMemoryR2CommandSender();
    const store = storeWithSender(sender, engine);
    const bad = { ...envelope, snapshot_id: '../escape' };
    await expectFailClosedAsync(() => store.putEncryptedSnapshot({ envelope: bad }), 'R2_SNAPSHOT_IDENTITY_INVALID');
    expect(sender.sentOps).toEqual([]);
  });

  it('PUT usa somente ciphertext e metadata sem secrets', async () => {
    const { engine, envelope } = sealedEnvelope();
    const sender = new InMemoryR2CommandSender();
    const store = storeWithSender(sender, engine);
    const result = await store.putEncryptedSnapshot({ envelope });

    expect(result.key).toBe(engine.resolveObjectKey('daily', `${envelope.snapshot_id}.avantdr`));
    expect(result.key.startsWith('daily/')).toBe(true);
    const stored = [...sender.objects.values()][0];
    expect(stored.body.equals(Buffer.from(envelope.payload_ciphertext_base64, 'base64'))).toBe(true);
    expect(stored.body.toString('utf8')).not.toContain('CREATE TABLE');
    expect(stored.body.toString('utf8')).not.toContain('synthetic-user-1');
    const metaBlob = JSON.stringify(stored.metadata);
    expect(metaBlob).not.toMatch(/wrapped_dek|AVANT_MASTER_KEK|postgresql:\/\//i);
    expect(stored.metadata.format).toBe(SNAPSHOT_FORMAT);
    expect(stored.metadata.ciphertext_sha256).toBe(envelope.ciphertext_sha256);
    expect(sender.sentOps).toEqual(['PUT']);
  });

  it('HEAD content-length mismatch rejeitado', async () => {
    const { engine, envelope } = sealedEnvelope();
    const sender = new InMemoryR2CommandSender({ headContentLengthOverride: 1 });
    const store = storeWithSender(sender, engine);
    await store.putEncryptedSnapshot({ envelope });
    await expectFailClosedAsync(() => store.headEncryptedSnapshot({ envelope }), 'R2_HEAD_LENGTH_MISMATCH');
  });

  it('HEAD SHA metadata mismatch rejeitado', async () => {
    const { engine, envelope } = sealedEnvelope();
    const sender = new InMemoryR2CommandSender({
      headMetadataOverride: { ciphertext_sha256: '0'.repeat(64) },
    });
    const store = storeWithSender(sender, engine);
    await store.putEncryptedSnapshot({ envelope });
    await expectFailClosedAsync(
      () => store.headEncryptedSnapshot({ envelope }),
      'R2_HEAD_SHA_METADATA_MISMATCH',
    );
  });

  it('GET recomputa SHA-256; bytes adulterados e body truncado falham; ausência falha fechado', async () => {
    const { engine, envelope } = sealedEnvelope();
    const missingSender = new InMemoryR2CommandSender();
    const missingStore = storeWithSender(missingSender, engine);
    await expectFailClosedAsync(() => missingStore.getEncryptedSnapshot({ envelope }), 'R2_OBJECT_NOT_FOUND');

    const tamper = new InMemoryR2CommandSender({
      getBodyTransform: (body) => {
        const copy = Buffer.from(body);
        copy[0] = copy[0] ^ 0xff;
        return copy;
      },
    });
    const tamperStore = storeWithSender(tamper, engine);
    await tamperStore.putEncryptedSnapshot({ envelope });
    await expectFailClosedAsync(() => tamperStore.getEncryptedSnapshot({ envelope }), 'R2_GET_HASH_MISMATCH');

    const trunc = new InMemoryR2CommandSender({
      getBodyTransform: (body) => body.subarray(0, Math.max(1, body.length - 8)),
    });
    const truncStore = storeWithSender(trunc, engine);
    await truncStore.putEncryptedSnapshot({ envelope });
    await expectFailClosedAsync(() => truncStore.getEncryptedSnapshot({ envelope }), 'R2_GET_BODY_TRUNCATED');
  });

  it('ETag diferente não é tratado como SHA-256', async () => {
    const { engine, envelope } = sealedEnvelope();
    const sender = new InMemoryR2CommandSender();
    const store = storeWithSender(sender, engine);
    const put = await store.putEncryptedSnapshot({ envelope });
    const head = await store.headEncryptedSnapshot({ envelope });
    const got = await store.getEncryptedSnapshot({ envelope });
    expect(put.etag).toBe('"synthetic-etag-not-a-sha256"');
    expect(head.etag).not.toBe(envelope.ciphertext_sha256);
    expect(got.sha256).toBe(envelope.ciphertext_sha256);
    expect(got.etag).not.toBe(got.sha256);
    expect(head.headOnlyIsFullIntegrityProof).toBe(false);
    expect(got.remoteReadbackFullBodyHashVerification).toBe(true);
  });

  it('fake client confirma apenas PUT/HEAD/GET; Delete/Admin não são expostos', () => {
    expect(R2_ALLOWED_OPERATIONS).toEqual(['PUT', 'HEAD', 'GET']);
    expect(R2_DELETE_CAPABILITY_IN_RUNTIME).toBe(false);
    expect(R2_BUCKET_ADMIN_CAPABILITY_IN_RUNTIME).toBe(false);
    expect(AvantR2ObjectStore.prototype).not.toHaveProperty('deleteEncryptedSnapshot');
    expect(AvantR2ObjectStore.prototype).not.toHaveProperty('deleteObject');
    expect(AvantR2ObjectStore.prototype).not.toHaveProperty('createBucket');
    expectFailClosed(() => assertAllowedR2Command(new DeleteObjectCommand({ Bucket: 'x', Key: 'y' })), 'R2_OPERATION_NOT_ALLOWED');
    expectFailClosed(() => assertAllowedR2Command(new ListBucketsCommand({})), 'R2_OPERATION_NOT_ALLOWED');
    const put = new PutObjectCommand({
      Bucket: CANONICAL_PRODUCTION_R2_BUCKET,
      Key: 'daily/ok.avantdr',
      Body: Buffer.from('x'),
    });
    expect(() => assertAllowedR2Command(put)).not.toThrow();
  });
});

describe('SYNTHETIC_R2_END_TO_END', () => {
  it('createDrSnapshot → PUT → HEAD → GET → SHA-256 → decryptAndVerify (sem rede)', async () => {
    const fetchSpy = jest.spyOn(globalThis, 'fetch');
    const engine = new BackupEngine('avant-synthetic-r2-e2e-kek-2026');
    const items = engine.generateSyntheticBackupSet();
    const envelope = engine.createDrSnapshot(items, {
      projectId: 'synthetic-avant-dev',
      sequenceId: 3,
      gfsTier: 'weekly',
    });

    const sender = new InMemoryR2CommandSender();
    const store = storeWithSender(sender, engine);
    await store.putEncryptedSnapshot({ envelope });
    const head = await store.headEncryptedSnapshot({ envelope });
    const got = await store.getEncryptedSnapshot({ envelope });
    const verified = engine.decryptAndVerifyDrSnapshot(envelope);

    expect(head.exists).toBe(true);
    expect(got.sha256).toBe(envelope.ciphertext_sha256);
    expect(verified.manifest.format_version).toBe('AVANT_DR_SNAPSHOT_V1');
    expect(verified.manifest.gfs_tier).toBe('weekly');
    expect(sender.sentOps).toEqual(['PUT', 'HEAD', 'GET']);
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
