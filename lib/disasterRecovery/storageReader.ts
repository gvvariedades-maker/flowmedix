import { createHash } from 'node:crypto';
import { QUESTAO_FIGURES_BUCKET } from '@/lib/questaoFiguresStorage';
import type { BackupSetItem } from '@/scripts/backup-automation';
import { assertAllowedProjectRef } from './allowlist';
import { CANONICAL_PRODUCTION_PROJECT_REF } from './constants';
import { failClosed } from './errors';

export const STORAGE_FIGURES_COMPONENT_NAME = 'storage_figures_archive' as const;
export const STORAGE_FIGURES_ARCHIVE_FORMAT = 'AVANT_STORAGE_FIGURES_V1' as const;
export const STORAGE_WRITE_CAPABILITY_IN_BACKUP_RUNTIME = false;
export const STORAGE_BYTE_HASH_SOURCE = 'DOWNLOADED_BYTES' as const;
export const PLAINTEXT_STORAGE_ARCHIVE_ON_DISK = 0;
export const STORAGE_PRODUCTION_BYTES_CAPTURE = 'NOT_PROVEN' as const;

export const QUESTAO_FIGURES_BUCKET_VISIBILITY = 'PUBLIC' as const;
export const STORAGE_EXISTING_READ_POLICY = 'questao_figures_public_read' as const;
export const CURRENT_STORAGE_AUTH_MODEL = 'PUBLIC_READ_SERVICE_ROLE_WRITE' as const;
export const STORAGE_LEAST_PRIVILEGE_AUTHORITY = 'PASS' as const;

export type StorageObjectMetadata = {
  storage_object_id: string;
  bucket_id: string;
  object_name: string;
  size?: number;
  content_type?: string;
  /** Optional declared hash (DB/ETag must not be trusted). Compared to SHA-256 of downloaded bytes. */
  expected_byte_sha256?: string;
};

export type StorageObjectRecord = StorageObjectMetadata & {
  byte_sha256: string;
  bytes_base64: string;
};

export type StorageFiguresArchive = {
  format: typeof STORAGE_FIGURES_ARCHIVE_FORMAT;
  bucket_id: typeof QUESTAO_FIGURES_BUCKET;
  hash_source: typeof STORAGE_BYTE_HASH_SOURCE;
  plaintext_archive_on_disk: 0;
  objects: StorageObjectRecord[];
};

export type StorageObjectFetcher = {
  download(bucket: string, objectName: string): Promise<Buffer | AsyncIterable<Uint8Array>>;
};

const OBJECT_NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._/-]*$/;

function hasControlOrNull(value: string): boolean {
  return /[\x00-\x1f\x7f]/.test(value);
}

export function assertSafeStorageObjectName(objectName: string): void {
  if (!objectName || objectName.trim() !== objectName) {
    failClosed('STORAGE_OBJECT_NAME_INVALID', 'object name vazio ou com padding');
  }
  if (hasControlOrNull(objectName) || objectName.includes('\0')) {
    failClosed('STORAGE_OBJECT_NAME_INVALID', 'object name contém control/null');
  }
  if (objectName.includes('\\') || objectName.includes('..') || objectName.startsWith('/')) {
    failClosed('STORAGE_OBJECT_NAME_INVALID', 'object name com traversal ou path absoluto');
  }
  if (objectName.includes('//')) {
    failClosed('STORAGE_OBJECT_NAME_INVALID', 'object name malformado');
  }
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(objectName) || objectName.includes('://')) {
    failClosed('STORAGE_OBJECT_NAME_INVALID', 'object name não pode ser URL/scheme');
  }
  let decoded = objectName;
  try {
    decoded = decodeURIComponent(objectName);
  } catch {
    failClosed('STORAGE_OBJECT_NAME_INVALID', 'object name com encoding malformado');
  }
  if (decoded.includes('..') || decoded.includes('\\') || decoded.includes('\0')) {
    failClosed('STORAGE_OBJECT_NAME_INVALID', 'object name com encoding de traversal');
  }
  if (!OBJECT_NAME_PATTERN.test(objectName)) {
    failClosed('STORAGE_OBJECT_NAME_INVALID', 'object name fora do padrão canônico');
  }
}

export function canonicalStoragePublicOrigin(projectRef: string = CANONICAL_PRODUCTION_PROJECT_REF): string {
  assertAllowedProjectRef(projectRef);
  return `https://${projectRef}.supabase.co`;
}

/** Future real GET only. Tests never call this. Host is not taken from object_name. */
export function buildCanonicalPublicStorageUrl(
  objectName: string,
  projectRef: string = CANONICAL_PRODUCTION_PROJECT_REF,
  bucket: string = QUESTAO_FIGURES_BUCKET,
): string {
  assertSafeStorageObjectName(objectName);
  if (bucket !== QUESTAO_FIGURES_BUCKET) {
    failClosed('STORAGE_BUCKET_NOT_ALLOWED', 'bucket Storage não autorizado');
  }
  const origin = canonicalStoragePublicOrigin(projectRef);
  return `${origin}/storage/v1/object/public/${bucket}/${objectName}`;
}

export function rejectStorageWrite(): never {
  failClosed('STORAGE_WRITE_NOT_ALLOWED', 'runtime de backup não possui operação de escrita Storage');
}

async function readOneObjectBytesHashed(
  body: Buffer | AsyncIterable<Uint8Array>,
): Promise<{ bytes: Buffer; byte_sha256: string }> {
  const hash = createHash('sha256');
  const consume = (chunk: Buffer): void => {
    hash.update(chunk);
  };

  if (Buffer.isBuffer(body)) {
    consume(body);
    return { bytes: body, byte_sha256: hash.digest('hex') };
  }

  const chunks: Buffer[] = [];
  try {
    for await (const chunk of body) {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      consume(buf);
      chunks.push(buf);
    }
  } catch (error: unknown) {
    failClosed(
      'STORAGE_DOWNLOAD_STREAM_INTERRUPTED',
      error instanceof Error ? error.message : 'stream Storage interrompido',
    );
  }
  return { bytes: Buffer.concat(chunks), byte_sha256: hash.digest('hex') };
}

function sha256Hex(bytes: Buffer): string {
  return createHash('sha256').update(bytes).digest('hex');
}

const SYNTHETIC_FIGURE_OBJECT_NAME = '3352957/f1.webp';
const SYNTHETIC_FIGURE_BYTES = Buffer.from('RIFF-SYNTHETIC-QUESTAO-FIGURE-BYTES', 'utf8');

/** In-memory fake only. Never opens sockets or files of Production Storage. */
export async function captureSyntheticQuestaoFiguresForBackup(): Promise<BackupSetItem> {
  const fetcher: StorageObjectFetcher = {
    async download(bucket, objectName) {
      if (bucket !== QUESTAO_FIGURES_BUCKET || objectName !== SYNTHETIC_FIGURE_OBJECT_NAME) {
        throw new Error('synthetic storage object missing');
      }
      return SYNTHETIC_FIGURE_BYTES;
    },
  };
  const archive = await captureStorageFiguresBytes(
    [
      {
        storage_object_id: 'synthetic-questao-figure-1',
        bucket_id: QUESTAO_FIGURES_BUCKET,
        object_name: SYNTHETIC_FIGURE_OBJECT_NAME,
        size: SYNTHETIC_FIGURE_BYTES.length,
        content_type: 'image/webp',
        expected_byte_sha256: sha256Hex(SYNTHETIC_FIGURE_BYTES),
      },
    ],
    fetcher,
  );
  return storageFiguresArchiveToBackupItem(archive);
}

export async function captureStorageFiguresBytes(
  metadataList: StorageObjectMetadata[],
  fetcher: StorageObjectFetcher,
): Promise<StorageFiguresArchive> {
  const seenIds = new Set<string>();
  const seenNames = new Set<string>();
  const objects: StorageObjectRecord[] = [];

  for (const meta of metadataList) {
    if (!meta.storage_object_id?.trim()) {
      failClosed('STORAGE_OBJECT_ID_INVALID', 'storage_object_id ausente');
    }
    if (seenIds.has(meta.storage_object_id)) {
      failClosed('STORAGE_DUPLICATE_OBJECT_ID', 'storage_object_id duplicado');
    }
    seenIds.add(meta.storage_object_id);

    if (meta.bucket_id !== QUESTAO_FIGURES_BUCKET) {
      failClosed('STORAGE_BUCKET_NOT_ALLOWED', 'bucket Storage não autorizado');
    }
    assertSafeStorageObjectName(meta.object_name);
    if (seenNames.has(meta.object_name)) {
      failClosed('STORAGE_DUPLICATE_OBJECT_NAME', 'object_name duplicado');
    }
    seenNames.add(meta.object_name);

    let raw: Buffer | AsyncIterable<Uint8Array>;
    try {
      raw = await fetcher.download(meta.bucket_id, meta.object_name);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error) {
        throw error;
      }
      failClosed(
        'STORAGE_DOWNLOAD_FAILED',
        error instanceof Error ? error.message : 'download Storage falhou',
      );
    }

    const { bytes, byte_sha256 } = await readOneObjectBytesHashed(raw);
    if (meta.size !== undefined && meta.size !== bytes.length) {
      failClosed('STORAGE_SIZE_MISMATCH', 'tamanho declarado diverge dos bytes recebidos');
    }
    if (meta.expected_byte_sha256 && meta.expected_byte_sha256 !== byte_sha256) {
      failClosed('STORAGE_HASH_MISMATCH', 'SHA-256 dos bytes baixados diverge do hash declarado');
    }
    objects.push({
      storage_object_id: meta.storage_object_id,
      bucket_id: meta.bucket_id,
      object_name: meta.object_name,
      size: bytes.length,
      content_type: meta.content_type,
      byte_sha256,
      bytes_base64: bytes.toString('base64'),
    });
  }

  return {
    format: STORAGE_FIGURES_ARCHIVE_FORMAT,
    bucket_id: QUESTAO_FIGURES_BUCKET,
    hash_source: STORAGE_BYTE_HASH_SOURCE,
    plaintext_archive_on_disk: 0,
    objects,
  };
}

export function storageFiguresArchiveToBackupItem(archive: StorageFiguresArchive): BackupSetItem {
  if (archive.format !== STORAGE_FIGURES_ARCHIVE_FORMAT) {
    failClosed('STORAGE_ARCHIVE_FORMAT_INVALID', 'arquivo Storage não é AVANT_STORAGE_FIGURES_V1');
  }
  return {
    name: STORAGE_FIGURES_COMPONENT_NAME,
    isSensitive: true,
    frequency: 'DAILY',
    format: STORAGE_FIGURES_ARCHIVE_FORMAT,
    data: Buffer.from(JSON.stringify(archive), 'utf8'),
  };
}

export function parseStorageFiguresArchive(component: Buffer): StorageFiguresArchive {
  let parsed: StorageFiguresArchive;
  try {
    parsed = JSON.parse(component.toString('utf8')) as StorageFiguresArchive;
  } catch {
    failClosed('STORAGE_ARCHIVE_FORMAT_INVALID', 'componente Storage não é JSON');
  }
  if (parsed.format !== STORAGE_FIGURES_ARCHIVE_FORMAT || parsed.bucket_id !== QUESTAO_FIGURES_BUCKET) {
    failClosed('STORAGE_ARCHIVE_FORMAT_INVALID', 'manifesto Storage inválido');
  }
  if (!Array.isArray(parsed.objects)) {
    failClosed('STORAGE_ARCHIVE_FORMAT_INVALID', 'objects ausente');
  }
  return parsed;
}

export function restoreStorageFiguresBytes(
  component: Buffer,
  expectedMetadata?: Pick<StorageObjectMetadata, 'storage_object_id'>[],
): StorageObjectRecord[] {
  const archive = parseStorageFiguresArchive(component);
  const restored: StorageObjectRecord[] = [];
  for (const obj of archive.objects) {
    if (typeof obj.bytes_base64 !== 'string') {
      failClosed('STORAGE_METADATA_WITHOUT_BYTES', 'metadata sem bytes');
    }
    if (!obj.storage_object_id?.trim() || !obj.object_name || !obj.bucket_id) {
      failClosed('STORAGE_BYTES_WITHOUT_METADATA', 'bytes sem metadata correspondente');
    }
    assertSafeStorageObjectName(obj.object_name);
    const bytes = Buffer.from(obj.bytes_base64, 'base64');
    const actual = sha256Hex(bytes);
    if (actual !== obj.byte_sha256) {
      failClosed('STORAGE_RESTORE_HASH_MISMATCH', 'SHA-256 dos bytes restaurados diverge');
    }
    if (obj.size !== bytes.length) {
      failClosed('STORAGE_SIZE_MISMATCH', 'tamanho restaurado diverge');
    }
    restored.push({ ...obj, size: bytes.length, byte_sha256: actual });
  }

  if (expectedMetadata) {
    const expectedIds = new Set(expectedMetadata.map((row) => row.storage_object_id));
    for (const obj of restored) {
      if (!expectedIds.has(obj.storage_object_id)) {
        failClosed('STORAGE_BYTES_WITHOUT_METADATA', 'bytes sem metadata correspondente');
      }
    }
    for (const row of expectedMetadata) {
      if (!restored.some((obj) => obj.storage_object_id === row.storage_object_id)) {
        failClosed('STORAGE_METADATA_WITHOUT_BYTES', 'metadata sem bytes');
      }
    }
  }

  return restored;
}

export function assertStorageArchiveIntegrity(archive: StorageFiguresArchive): void {
  const ids = new Set<string>();
  const names = new Set<string>();
  for (const obj of archive.objects) {
    if (ids.has(obj.storage_object_id)) {
      failClosed('STORAGE_DUPLICATE_OBJECT_ID', 'storage_object_id duplicado no restore');
    }
    ids.add(obj.storage_object_id);
    if (names.has(obj.object_name)) {
      failClosed('STORAGE_DUPLICATE_OBJECT_NAME', 'object_name duplicado no restore');
    }
    names.add(obj.object_name);
    const bytes = Buffer.from(obj.bytes_base64, 'base64');
    if (sha256Hex(bytes) !== obj.byte_sha256) {
      failClosed('STORAGE_RESTORE_HASH_MISMATCH', 'componente Storage adulterado');
    }
  }
}
