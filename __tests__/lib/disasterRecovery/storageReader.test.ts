/**
 * @jest-environment node
 *
 * STORAGE adversarial (18) → este arquivo:
 *  1 objeto correto  2 zero-byte     → 'captura objeto correto…'
 *  3 byte alterado  6 SHA divergente  → 'byte alterado e SHA declarado…'
 *  4 truncado  5 tamanho divergente  → 'tamanho divergente e truncado…'
 *  7 ausente  8 bucket  11 download erro → 'objeto ausente, bucket diferente…'
 *  9 traversal  10 URL externa         → 'rejeita traversal…'
 * 12 duplicate name  13 duplicate id  17 stream → 'duplicate id/name…'
 * 14 metadata sem bytes  15 bytes sem metadata  16 write → 'metadata sem bytes…'
 * 18 restore adulterado               → 'bytes alterados no componente…'
 * TEST_STORAGE_NETWORK_CONNECTIONS = 0
 */
import { createHash } from 'node:crypto';
import { BackupEngine, type BackupSetItem } from '@/scripts/backup-automation';
import { CANONICAL_PRODUCTION_ALLOWLIST, type DrBackupAllowlist } from '@/lib/disasterRecovery/allowlist';
import {
  CANONICAL_PRODUCTION_PROJECT_REF,
  CANONICAL_PRODUCTION_R2_BUCKET,
} from '@/lib/disasterRecovery/constants';
import { DrBackupFailClosedError } from '@/lib/disasterRecovery/errors';
import { createAvantR2ObjectStore } from '@/lib/disasterRecovery/r2Client';
import {
  STORAGE_BYTE_HASH_SOURCE,
  STORAGE_FIGURES_COMPONENT_NAME,
  STORAGE_PRODUCTION_BYTES_CAPTURE,
  STORAGE_WRITE_CAPABILITY_IN_BACKUP_RUNTIME,
  assertSafeStorageObjectName,
  buildCanonicalPublicStorageUrl,
  captureStorageFiguresBytes,
  rejectStorageWrite,
  restoreStorageFiguresBytes,
  storageFiguresArchiveToBackupItem,
  type StorageObjectFetcher,
  type StorageObjectMetadata,
} from '@/lib/disasterRecovery/storageReader';
import { QUESTAO_FIGURES_BUCKET } from '@/lib/questaoFiguresStorage';
import { InMemoryR2CommandSender } from './inMemoryR2Sender';

const SYNTHETIC_ACCOUNT_ID = '0123456789abcdef0123456789abcdef';
const SYNTHETIC_HOST = `${SYNTHETIC_ACCOUNT_ID}.r2.cloudflarestorage.com`;
const R2_ALLOWLIST: DrBackupAllowlist = {
  ...CANONICAL_PRODUCTION_ALLOWLIST,
  r2Hosts: [SYNTHETIC_HOST],
  r2Buckets: [CANONICAL_PRODUCTION_R2_BUCKET],
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

class InMemoryStorageFetcher implements StorageObjectFetcher {
  constructor(
    private readonly objects: Map<string, Buffer>,
    private readonly opts: {
      failDownload?: boolean;
      interruptStream?: boolean;
      truncateTo?: number;
      streamChunks?: boolean;
    } = {},
  ) {}

  async download(bucket: string, objectName: string): Promise<Buffer | AsyncIterable<Uint8Array>> {
    if (this.opts.failDownload) {
      throw new Error('synthetic storage download error');
    }
    const stored = this.objects.get(`${bucket}\0${objectName}`);
    if (!stored) {
      throw new Error('missing');
    }
    const body = this.opts.truncateTo !== undefined ? stored.subarray(0, this.opts.truncateTo) : stored;
    if (this.opts.interruptStream) {
      return interruptStream(body);
    }
    if (this.opts.streamChunks) {
      return chunkStream(body);
    }
    return body;
  }
}

async function* chunkStream(body: Buffer): AsyncIterable<Uint8Array> {
  const mid = Math.max(1, Math.floor(body.length / 2));
  yield body.subarray(0, mid);
  if (body.length > mid) {
    yield body.subarray(mid);
  }
}

async function* interruptStream(body: Buffer): AsyncIterable<Uint8Array> {
  if (body.length > 0) {
    yield body.subarray(0, 1);
  }
  throw new Error('stream cut');
}

function meta(
  partial: Partial<StorageObjectMetadata> & Pick<StorageObjectMetadata, 'storage_object_id' | 'object_name'>,
): StorageObjectMetadata {
  return {
    bucket_id: QUESTAO_FIGURES_BUCKET,
    ...partial,
  };
}

describe('Storage object name / host', () => {
  it('rejeita traversal, URL externa, scheme e control/null', () => {
    expectFailClosed(() => assertSafeStorageObjectName('../secret.webp'), 'STORAGE_OBJECT_NAME_INVALID');
    expectFailClosed(() => assertSafeStorageObjectName('..\\secret.webp'), 'STORAGE_OBJECT_NAME_INVALID');
    expectFailClosed(() => assertSafeStorageObjectName('https://evil.example/x.webp'), 'STORAGE_OBJECT_NAME_INVALID');
    expectFailClosed(
      () => assertSafeStorageObjectName('http://ozgouenqrofnvgrlgfwd.supabase.co/x'),
      'STORAGE_OBJECT_NAME_INVALID',
    );
    expectFailClosed(() => assertSafeStorageObjectName('file:C:/windows/x.webp'), 'STORAGE_OBJECT_NAME_INVALID');
    expectFailClosed(() => assertSafeStorageObjectName('%2e%2e/x.webp'), 'STORAGE_OBJECT_NAME_INVALID');
    expectFailClosed(() => assertSafeStorageObjectName('a\0b.webp'), 'STORAGE_OBJECT_NAME_INVALID');
    expectFailClosed(() => assertSafeStorageObjectName('a\u0007b.webp'), 'STORAGE_OBJECT_NAME_INVALID');
  });

  it('host canônico deriva só do project ref', () => {
    const url = buildCanonicalPublicStorageUrl('3352957/f1.webp');
    expect(url).toBe(
      `https://${CANONICAL_PRODUCTION_PROJECT_REF}.supabase.co/storage/v1/object/public/${QUESTAO_FIGURES_BUCKET}/3352957/f1.webp`,
    );
    expect(url).not.toContain('evil');
  });
});

describe('Storage reader adversarial', () => {
  const sample = Buffer.from('RIFF-synthetic-webp-bytes', 'utf8');
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    fetchSpy = jest.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it('captura objeto correto e zero-byte permitido', async () => {
    const empty = Buffer.alloc(0);
    const fetcher = new InMemoryStorageFetcher(
      new Map([
        [`${QUESTAO_FIGURES_BUCKET}\0` + '3352957/f1.webp', sample],
        [`${QUESTAO_FIGURES_BUCKET}\0empty/f1.webp`, empty],
      ]),
    );
    const archive = await captureStorageFiguresBytes(
      [
        meta({
          storage_object_id: 'id-1',
          object_name: '3352957/f1.webp',
          size: sample.length,
          content_type: 'image/webp',
        }),
        meta({ storage_object_id: 'id-0', object_name: 'empty/f1.webp', size: 0 }),
      ],
      fetcher,
    );
    expect(archive.hash_source).toBe(STORAGE_BYTE_HASH_SOURCE);
    expect(archive.objects[0].byte_sha256).toBe(createHash('sha256').update(sample).digest('hex'));
    expect(archive.objects[1].size).toBe(0);
    expect(archive.objects[0].byte_sha256).not.toBe(createHash('sha256').update('3352957/f1.webp', 'utf8').digest('hex'));
    expect(STORAGE_PRODUCTION_BYTES_CAPTURE).toBe('NOT_PROVEN');
    expect(STORAGE_WRITE_CAPABILITY_IN_BACKUP_RUNTIME).toBe(false);

    const streamed = new InMemoryStorageFetcher(new Map([[`${QUESTAO_FIGURES_BUCKET}\0` + '3352957/f1.webp', sample]]), {
      streamChunks: true,
    });
    const streamedArchive = await captureStorageFiguresBytes(
      [meta({ storage_object_id: 'id-stream', object_name: '3352957/f1.webp', size: sample.length })],
      streamed,
    );
    expect(streamedArchive.objects[0].byte_sha256).toBe(createHash('sha256').update(sample).digest('hex'));
  });

  it('byte alterado e SHA declarado divergente falham', async () => {
    const originalHash = createHash('sha256').update(sample).digest('hex');
    const altered = Buffer.from(sample);
    altered[0] = altered[0] ^ 0xff;
    const fetcher = new InMemoryStorageFetcher(new Map([[`${QUESTAO_FIGURES_BUCKET}\0` + '3352957/f1.webp', altered]]));
    await expectFailClosedAsync(
      () =>
        captureStorageFiguresBytes(
          [
            meta({
              storage_object_id: 'id-1',
              object_name: '3352957/f1.webp',
              size: sample.length,
              expected_byte_sha256: originalHash,
            }),
          ],
          fetcher,
        ),
      'STORAGE_HASH_MISMATCH',
    );
    const okFetcher = new InMemoryStorageFetcher(new Map([[`${QUESTAO_FIGURES_BUCKET}\0` + '3352957/f1.webp', sample]]));
    await expectFailClosedAsync(
      () =>
        captureStorageFiguresBytes(
          [
            meta({
              storage_object_id: 'id-1',
              object_name: '3352957/f1.webp',
              size: sample.length,
              expected_byte_sha256: 'ab'.repeat(32),
            }),
          ],
          okFetcher,
        ),
      'STORAGE_HASH_MISMATCH',
    );
  });

  it('tamanho divergente e truncado falham', async () => {
    const fetcher = new InMemoryStorageFetcher(new Map([[`${QUESTAO_FIGURES_BUCKET}\0` + '3352957/f1.webp', sample]]));
    await expectFailClosedAsync(
      () =>
        captureStorageFiguresBytes(
          [meta({ storage_object_id: 'id-1', object_name: '3352957/f1.webp', size: sample.length + 4 })],
          fetcher,
        ),
      'STORAGE_SIZE_MISMATCH',
    );
    const trunc = new InMemoryStorageFetcher(new Map([[`${QUESTAO_FIGURES_BUCKET}\0` + '3352957/f1.webp', sample]]), {
      truncateTo: 3,
    });
    await expectFailClosedAsync(
      () =>
        captureStorageFiguresBytes(
          [meta({ storage_object_id: 'id-1', object_name: '3352957/f1.webp', size: sample.length })],
          trunc,
        ),
      'STORAGE_SIZE_MISMATCH',
    );
  });

  it('objeto ausente, bucket diferente e download com erro falham fechado', async () => {
    const emptyFetcher = new InMemoryStorageFetcher(new Map());
    await expectFailClosedAsync(
      () =>
        captureStorageFiguresBytes([meta({ storage_object_id: 'id-1', object_name: '3352957/f1.webp' })], emptyFetcher),
      'STORAGE_DOWNLOAD_FAILED',
    );
    const ok = new InMemoryStorageFetcher(new Map([[`${QUESTAO_FIGURES_BUCKET}\0x/f1.webp`, sample]]));
    await expectFailClosedAsync(
      () =>
        captureStorageFiguresBytes(
          [{ storage_object_id: 'id-1', bucket_id: 'other-bucket', object_name: 'x/f1.webp' }],
          ok,
        ),
      'STORAGE_BUCKET_NOT_ALLOWED',
    );
    const errFetcher = new InMemoryStorageFetcher(new Map([[`${QUESTAO_FIGURES_BUCKET}\0x/f1.webp`, sample]]), {
      failDownload: true,
    });
    await expectFailClosedAsync(
      () => captureStorageFiguresBytes([meta({ storage_object_id: 'id-1', object_name: 'x/f1.webp' })], errFetcher),
      'STORAGE_DOWNLOAD_FAILED',
    );
  });

  it('duplicate id/name e stream interrompido falham', async () => {
    const fetcher = new InMemoryStorageFetcher(new Map([[`${QUESTAO_FIGURES_BUCKET}\0x/f1.webp`, sample]]));
    await expectFailClosedAsync(
      () =>
        captureStorageFiguresBytes(
          [
            meta({ storage_object_id: 'dup', object_name: 'x/f1.webp' }),
            meta({ storage_object_id: 'dup', object_name: 'y/f1.webp' }),
          ],
          fetcher,
        ),
      'STORAGE_DUPLICATE_OBJECT_ID',
    );
    await expectFailClosedAsync(
      () =>
        captureStorageFiguresBytes(
          [
            meta({ storage_object_id: 'a', object_name: 'x/f1.webp' }),
            meta({ storage_object_id: 'b', object_name: 'x/f1.webp' }),
          ],
          fetcher,
        ),
      'STORAGE_DUPLICATE_OBJECT_NAME',
    );
    const interrupt = new InMemoryStorageFetcher(new Map([[`${QUESTAO_FIGURES_BUCKET}\0x/f1.webp`, sample]]), {
      interruptStream: true,
    });
    await expectFailClosedAsync(
      () => captureStorageFiguresBytes([meta({ storage_object_id: 'id-1', object_name: 'x/f1.webp' })], interrupt),
      'STORAGE_DOWNLOAD_STREAM_INTERRUPTED',
    );
  });

  it('metadata sem bytes e write recusado', () => {
    expect(STORAGE_WRITE_CAPABILITY_IN_BACKUP_RUNTIME).toBe(false);
    expectFailClosed(() => rejectStorageWrite(), 'STORAGE_WRITE_NOT_ALLOWED');
    expectFailClosed(
      () =>
        restoreStorageFiguresBytes(
          Buffer.from(
            JSON.stringify({
              format: 'AVANT_STORAGE_FIGURES_V1',
              bucket_id: QUESTAO_FIGURES_BUCKET,
              hash_source: 'DOWNLOADED_BYTES',
              plaintext_archive_on_disk: 0,
              objects: [
                {
                  storage_object_id: 'id-1',
                  bucket_id: QUESTAO_FIGURES_BUCKET,
                  object_name: 'x/f1.webp',
                  size: 1,
                  byte_sha256: '00',
                },
              ],
            }),
          ),
        ),
      'STORAGE_METADATA_WITHOUT_BYTES',
    );
    expectFailClosed(
      () =>
        restoreStorageFiguresBytes(
          Buffer.from(
            JSON.stringify({
              format: 'AVANT_STORAGE_FIGURES_V1',
              bucket_id: QUESTAO_FIGURES_BUCKET,
              hash_source: 'DOWNLOADED_BYTES',
              plaintext_archive_on_disk: 0,
              objects: [
                {
                  bytes_base64: Buffer.from('x').toString('base64'),
                  byte_sha256: createHash('sha256').update('x', 'utf8').digest('hex'),
                  size: 1,
                },
              ],
            }),
          ),
        ),
      'STORAGE_BYTES_WITHOUT_METADATA',
    );
  });
});

describe('SYNTHETIC_STORAGE_RESTORE + FULL_DR', () => {
  it('restore local recomputa SHA-256', async () => {
    const bytes = Buffer.from('synthetic-figure-bytes-v1', 'utf8');
    const fetcher = new InMemoryStorageFetcher(new Map([[`${QUESTAO_FIGURES_BUCKET}\0fig/f1.webp`, bytes]]));
    const archive = await captureStorageFiguresBytes(
      [meta({ storage_object_id: 'obj-1', object_name: 'fig/f1.webp', size: bytes.length, content_type: 'image/webp' })],
      fetcher,
    );
    const restored = restoreStorageFiguresBytes(Buffer.from(JSON.stringify(archive)));
    expect(restored).toHaveLength(1);
    expect(restored[0].byte_sha256).toBe(createHash('sha256').update(bytes).digest('hex'));
  });

  it('bytes alterados no componente falham no restore', async () => {
    const bytes = Buffer.from('synthetic-figure-bytes-v1', 'utf8');
    const fetcher = new InMemoryStorageFetcher(new Map([[`${QUESTAO_FIGURES_BUCKET}\0fig/f1.webp`, bytes]]));
    const archive = await captureStorageFiguresBytes(
      [meta({ storage_object_id: 'obj-1', object_name: 'fig/f1.webp', size: bytes.length })],
      fetcher,
    );
    archive.objects[0].bytes_base64 = Buffer.from('tampered').toString('base64');
    expectFailClosed(
      () => restoreStorageFiguresBytes(Buffer.from(JSON.stringify(archive))),
      'STORAGE_RESTORE_HASH_MISMATCH',
    );
    const orphan = await captureStorageFiguresBytes(
      [meta({ storage_object_id: 'obj-1', object_name: 'fig/f1.webp', size: bytes.length })],
      fetcher,
    );
    expectFailClosed(
      () => restoreStorageFiguresBytes(Buffer.from(JSON.stringify(orphan)), [{ storage_object_id: 'other-id' }]),
      'STORAGE_BYTES_WITHOUT_METADATA',
    );
  });

  it('synthetic DB/auth + fake figures → snapshot → fake R2 → decrypt → restore SHA', async () => {
    const fetchSpy = jest.spyOn(globalThis, 'fetch');
    const figure = Buffer.from('RIFF-SYNTHETIC-WEBP', 'utf8');
    const fetcher = new InMemoryStorageFetcher(new Map([[`${QUESTAO_FIGURES_BUCKET}\0` + '3352957/f1.webp', figure]]));
    const archive = await captureStorageFiguresBytes(
      [
        meta({
          storage_object_id: 'fig-1',
          object_name: '3352957/f1.webp',
          size: figure.length,
          content_type: 'image/webp',
        }),
      ],
      fetcher,
    );
    const storageItem = storageFiguresArchiveToBackupItem(archive);

    const engine = new BackupEngine('avant-synthetic-storage-dr-kek-2026');
    const base = engine.generateSyntheticBackupSet();
    const items: BackupSetItem[] = base.map((item) =>
      item.name === STORAGE_FIGURES_COMPONENT_NAME ? storageItem : item,
    );
    const envelope = engine.createDrSnapshot(items, {
      projectId: 'synthetic-avant-dev',
      sequenceId: 9,
      gfsTier: 'daily',
    });

    const sender = new InMemoryR2CommandSender();
    const store = createAvantR2ObjectStore({
      accountId: SYNTHETIC_ACCOUNT_ID,
      sender,
      allowlist: R2_ALLOWLIST,
      engine,
    });
    await store.putEncryptedSnapshot({ envelope });
    await store.headEncryptedSnapshot({ envelope });
    const got = await store.getEncryptedSnapshot({ envelope });
    expect(got.sha256).toBe(envelope.ciphertext_sha256);

    const verified = engine.decryptAndVerifyDrSnapshot(envelope);
    const storageComponent = verified.components.get(STORAGE_FIGURES_COMPONENT_NAME);
    expect(storageComponent).toBeDefined();
    const restored = restoreStorageFiguresBytes(storageComponent!);
    expect(restored[0].byte_sha256).toBe(createHash('sha256').update(figure).digest('hex'));
    expect(restored[0].bytes_base64).toBe(figure.toString('base64'));
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
