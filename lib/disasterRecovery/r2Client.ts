import { createHash } from 'node:crypto';
import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  BackupEngine,
  type AuthenticatedDrSnapshotEnvelope,
} from '@/scripts/backup-automation';
import {
  assertAllowedR2Bucket,
  assertAllowedR2Host,
  CANONICAL_PRODUCTION_ALLOWLIST,
  type DrBackupAllowlist,
} from './allowlist';
import {
  CANONICAL_PRODUCTION_R2_BUCKET,
  R2_S3_HOST_PATTERN,
  SNAPSHOT_FORMAT,
} from './constants';
import { failClosed } from './errors';

export const R2_CLIENT_LIBRARY = '@aws-sdk/client-s3' as const;
export const R2_ALLOWED_OPERATIONS = ['PUT', 'HEAD', 'GET'] as const;
export const R2_DELETE_CAPABILITY_IN_RUNTIME = false;
export const R2_BUCKET_ADMIN_CAPABILITY_IN_RUNTIME = false;
export const ETAG_USED_AS_CRYPTOGRAPHIC_HASH = false;
export const HEAD_ONLY_IS_FULL_INTEGRITY_PROOF = false;
export const R2_SDK_REGION = 'auto' as const;

export const ACCOUNT_ID_PATTERN = /^[0-9a-f]{32}$/;
const SHA256_HEX = /^[a-f0-9]{64}$/;
const SNAPSHOT_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const OBJECT_FILENAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const GFS_OBJECT_KEY_PATTERN = /^(daily|weekly|monthly)\/[A-Za-z0-9][A-Za-z0-9._-]*$/;

const FORBIDDEN_METADATA_MARKERS = [
  'BEGIN PRIVATE KEY',
  'KEK',
  'DEK',
  'wrapped_dek',
  'auth_tag',
  'postgresql://',
  'postgres://',
  'SUPABASE_SERVICE_ROLE',
  'R2_SECRET_ACCESS_KEY',
  'AVANT_MASTER_KEK',
];

export type AllowedR2Command = PutObjectCommand | HeadObjectCommand | GetObjectCommand;

export interface S3CommandSender {
  send(command: AllowedR2Command): Promise<unknown>;
}

export type R2RuntimeCredentials = {
  accessKeyId: string;
  secretAccessKey: string;
};

export type R2ClientFactoryInput = {
  accountId: string;
  credentials?: R2RuntimeCredentials;
  sender?: S3CommandSender;
  allowlist?: DrBackupAllowlist;
  bucket?: string;
  engine?: BackupEngine;
};

export type R2EndpointConfig = {
  endpoint: string;
  region: typeof R2_SDK_REGION;
  host: string;
};

function commandOp(command: AllowedR2Command): 'PUT' | 'HEAD' | 'GET' | 'OTHER' {
  if (command instanceof PutObjectCommand) return 'PUT';
  if (command instanceof HeadObjectCommand) return 'HEAD';
  if (command instanceof GetObjectCommand) return 'GET';
  return 'OTHER';
}

export function assertAllowedR2Command(command: unknown): asserts command is AllowedR2Command {
  if (
    command instanceof PutObjectCommand ||
    command instanceof HeadObjectCommand ||
    command instanceof GetObjectCommand
  ) {
    return;
  }
  failClosed('R2_OPERATION_NOT_ALLOWED', 'somente PutObject, HeadObject e GetObject são permitidos');
}

export function buildR2Endpoint(accountId: string): string {
  const id = accountId.trim().toLowerCase();
  if (!ACCOUNT_ID_PATTERN.test(id)) {
    failClosed('R2_ACCOUNT_ID_INVALID', 'account id R2 inválido');
  }
  return `https://${id}.r2.cloudflarestorage.com`;
}

export function assertR2HttpsEndpoint(
  endpoint: string,
  allowlist: DrBackupAllowlist = CANONICAL_PRODUCTION_ALLOWLIST,
): { host: string } {
  let url: URL;
  try {
    url = new URL(endpoint);
  } catch {
    failClosed('R2_ENDPOINT_INVALID', 'endpoint R2 inválido');
  }

  if (url.protocol !== 'https:') {
    failClosed('R2_ENDPOINT_INVALID', 'endpoint R2 deve ser https');
  }
  if (url.username !== '' || url.password !== '') {
    failClosed('R2_ENDPOINT_INVALID', 'endpoint R2 não pode conter userinfo');
  }
  if (url.port !== '') {
    failClosed('R2_ENDPOINT_INVALID', 'endpoint R2 não pode usar porta customizada');
  }
  if (url.search !== '') {
    failClosed('R2_ENDPOINT_INVALID', 'endpoint R2 não pode conter query string');
  }
  if (url.hash !== '') {
    failClosed('R2_ENDPOINT_INVALID', 'endpoint R2 não pode conter fragmento');
  }
  if (url.pathname !== '/' && url.pathname !== '') {
    failClosed('R2_ENDPOINT_INVALID', 'endpoint R2 não pode conter path');
  }
  if (!R2_S3_HOST_PATTERN.test(url.hostname)) {
    failClosed('R2_HOST_NOT_ALLOWED', 'host R2 fora do padrão allowlist');
  }
  assertAllowedR2Host(url.hostname, allowlist);
  return { host: url.hostname };
}

export function createR2EndpointConfig(
  accountId: string,
  allowlist: DrBackupAllowlist = CANONICAL_PRODUCTION_ALLOWLIST,
): R2EndpointConfig {
  const endpoint = buildR2Endpoint(accountId);
  const { host } = assertR2HttpsEndpoint(endpoint, allowlist);
  return { endpoint, region: R2_SDK_REGION, host };
}

function assertSafeObjectFilename(filename: string): void {
  if (!filename || !OBJECT_FILENAME_PATTERN.test(filename)) {
    failClosed('R2_OBJECT_KEY_INVALID', 'filename de objeto inválido');
  }
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    failClosed('R2_OBJECT_KEY_INVALID', 'filename de objeto inválido');
  }
}

export function assertCanonicalGfsObjectKey(key: string): void {
  if (!key || key.startsWith('/') || key.includes('\\') || key.includes('..')) {
    failClosed('R2_OBJECT_KEY_INVALID', 'object key inválida');
  }
  if (/[\x00-\x1f\x7f]/.test(key)) {
    failClosed('R2_OBJECT_KEY_INVALID', 'object key contém caracteres de controle');
  }
  if (/^[a-z]+:\/\//i.test(key)) {
    failClosed('R2_OBJECT_KEY_INVALID', 'object key não pode ser URL');
  }
  if (!GFS_OBJECT_KEY_PATTERN.test(key)) {
    failClosed('R2_OBJECT_KEY_INVALID', 'object key fora do contrato GFS');
  }
}

function resolveCanonicalObjectKey(
  engine: BackupEngine,
  envelope: AuthenticatedDrSnapshotEnvelope,
): string {
  const filename = `${envelope.snapshot_id}.avantdr`;
  assertSafeObjectFilename(filename);
  const key = engine.resolveObjectKey(envelope.gfs_tier, filename);
  const expectedPrefix =
    envelope.gfs_tier === 'daily'
      ? 'daily/'
      : envelope.gfs_tier === 'weekly'
        ? 'weekly/'
        : 'monthly/';
  if (!key.startsWith(expectedPrefix) || key !== `${expectedPrefix}${filename}`) {
    failClosed('R2_OBJECT_KEY_INVALID', 'object key não derivada de resolveObjectKey');
  }
  assertCanonicalGfsObjectKey(key);
  return key;
}

function assertEnvelopeForR2(envelope: AuthenticatedDrSnapshotEnvelope): Buffer {
  if (envelope.format_version !== SNAPSHOT_FORMAT) {
    failClosed('SNAPSHOT_FORMAT_MISMATCH', 'envelope não é AVANT_DR_SNAPSHOT_V1');
  }
  if (!envelope.snapshot_id || !SNAPSHOT_ID_PATTERN.test(envelope.snapshot_id)) {
    failClosed('R2_SNAPSHOT_IDENTITY_INVALID', 'snapshot_id inválido');
  }
  if (!Number.isInteger(envelope.sequence_id) || envelope.sequence_id < 1) {
    failClosed('R2_SEQUENCE_INVALID', 'sequence_id inválido');
  }
  if (!SHA256_HEX.test(envelope.ciphertext_sha256)) {
    failClosed('R2_CIPHERTEXT_HASH_INVALID', 'ciphertext SHA-256 esperado inválido');
  }
  if (!envelope.payload_ciphertext_base64) {
    failClosed('R2_CIPHERTEXT_EMPTY', 'ciphertext vazio');
  }
  const ciphertext = Buffer.from(envelope.payload_ciphertext_base64, 'base64');
  if (ciphertext.length === 0) {
    failClosed('R2_CIPHERTEXT_EMPTY', 'ciphertext vazio');
  }
  const actual = createHash('sha256').update(ciphertext).digest('hex');
  if (actual !== envelope.ciphertext_sha256) {
    failClosed('R2_CIPHERTEXT_HASH_INVALID', 'SHA-256 local do ciphertext não confere');
  }
  return ciphertext;
}

function snapshotMetadata(envelope: AuthenticatedDrSnapshotEnvelope): Record<string, string> {
  const metadata = {
    format: SNAPSHOT_FORMAT,
    ciphertext_sha256: envelope.ciphertext_sha256,
    snapshot_id: envelope.snapshot_id,
    sequence_id: String(envelope.sequence_id),
  };
  const blob = JSON.stringify(metadata);
  for (const marker of FORBIDDEN_METADATA_MARKERS) {
    if (blob.includes(marker)) {
      failClosed('R2_METADATA_FORBIDDEN', 'metadata R2 contém material proibido');
    }
  }
  return metadata;
}

function isNotFound(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const rec = error as { name?: string; $metadata?: { httpStatusCode?: number } };
  return rec.name === 'NotFound' || rec.name === 'NoSuchKey' || rec.$metadata?.httpStatusCode === 404;
}

async function readS3Body(body: unknown): Promise<Buffer> {
  if (body == null) {
    failClosed('R2_GET_BODY_EMPTY', 'GET sem body');
  }
  if (Buffer.isBuffer(body)) {
    return body;
  }
  if (body instanceof Uint8Array) {
    return Buffer.from(body);
  }
  if (typeof body === 'string') {
    return Buffer.from(body, 'utf8');
  }
  if (typeof body === 'object' && 'transformToByteArray' in body) {
    const transform = (body as { transformToByteArray: () => Promise<Uint8Array> }).transformToByteArray;
    if (typeof transform === 'function') {
      return Buffer.from(await transform());
    }
  }
  if (typeof body === 'object' && Symbol.asyncIterator in body) {
    const chunks: Buffer[] = [];
    for await (const chunk of body as AsyncIterable<unknown>) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as Uint8Array));
    }
    return Buffer.concat(chunks);
  }
  failClosed('R2_GET_BODY_UNSUPPORTED', 'tipo de Body S3 não suportado');
}

export function createProductionS3CommandSender(client: S3Client): S3CommandSender {
  return {
    async send(command: AllowedR2Command) {
      assertAllowedR2Command(command);
      return client.send(command);
    },
  };
}

/**
 * Production S3Client is created only when credentials are present and no test sender is injected.
 * Tests must always pass `sender` so this path is never taken in unit tests.
 */
export function createR2S3Client(config: R2EndpointConfig, credentials: R2RuntimeCredentials): S3Client {
  if (!credentials.accessKeyId?.trim() || !credentials.secretAccessKey?.trim()) {
    failClosed('R2_CREDENTIALS_ABSENT', 'credenciais R2 ausentes');
  }
  return new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
    },
  });
}

export class AvantR2ObjectStore {
  private readonly sender: S3CommandSender;
  private readonly bucket: string;
  private readonly engine: BackupEngine;
  readonly endpointConfig: R2EndpointConfig;

  constructor(opts: {
    sender: S3CommandSender;
    bucket: string;
    endpointConfig: R2EndpointConfig;
    engine: BackupEngine;
  }) {
    this.sender = opts.sender;
    this.bucket = opts.bucket;
    this.endpointConfig = opts.endpointConfig;
    this.engine = opts.engine;
  }

  async putEncryptedSnapshot(input: {
    envelope: AuthenticatedDrSnapshotEnvelope;
  }): Promise<{ key: string; etag?: string; contentLength: number }> {
    const ciphertext = assertEnvelopeForR2(input.envelope);
    const key = resolveCanonicalObjectKey(this.engine, input.envelope);
    const metadata = snapshotMetadata(input.envelope);

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: ciphertext,
      ContentType: 'application/octet-stream',
      Metadata: metadata,
    });
    const output = (await this.sender.send(command)) as { ETag?: string };
    return {
      key,
      etag: output.ETag,
      contentLength: ciphertext.length,
    };
  }

  async headEncryptedSnapshot(input: {
    envelope: AuthenticatedDrSnapshotEnvelope;
  }): Promise<{
    exists: true;
    contentLength: number;
    etag?: string;
    metadata: Record<string, string>;
    headOnlyIsFullIntegrityProof: false;
  }> {
    const ciphertext = assertEnvelopeForR2(input.envelope);
    const key = resolveCanonicalObjectKey(this.engine, input.envelope);

    let output: {
      ContentLength?: number;
      ETag?: string;
      Metadata?: Record<string, string>;
    };
    try {
      output = (await this.sender.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: key }),
      )) as typeof output;
    } catch (error: unknown) {
      if (isNotFound(error)) {
        failClosed('R2_OBJECT_NOT_FOUND', 'objeto R2 ausente');
      }
      failClosed('R2_HEAD_FAILED', 'HEAD R2 falhou');
    }

    const contentLength = output.ContentLength ?? -1;
    if (contentLength !== ciphertext.length) {
      failClosed('R2_HEAD_LENGTH_MISMATCH', 'Content-Length remoto diverge do ciphertext local');
    }

    const meta = output.Metadata ?? {};
    const format = meta.format ?? meta.Format;
    const sha = meta.ciphertext_sha256 ?? meta['ciphertext_sha256'];
    const snapshotId = meta.snapshot_id ?? meta['snapshot_id'];
    const sequence = meta.sequence_id ?? meta['sequence_id'];

    if (format !== SNAPSHOT_FORMAT) {
      failClosed('R2_HEAD_METADATA_MISMATCH', 'metadata format divergente');
    }
    if (sha !== input.envelope.ciphertext_sha256) {
      failClosed('R2_HEAD_SHA_METADATA_MISMATCH', 'metadata SHA-256 divergente');
    }
    if (snapshotId !== input.envelope.snapshot_id) {
      failClosed('R2_HEAD_METADATA_MISMATCH', 'metadata snapshot_id divergente');
    }
    if (sequence !== String(input.envelope.sequence_id)) {
      failClosed('R2_HEAD_METADATA_MISMATCH', 'metadata sequence_id divergente');
    }

    return {
      exists: true,
      contentLength,
      etag: output.ETag,
      metadata: meta,
      headOnlyIsFullIntegrityProof: false,
    };
  }

  async getEncryptedSnapshot(input: {
    envelope: AuthenticatedDrSnapshotEnvelope;
  }): Promise<{
    ciphertext: Buffer;
    sha256: string;
    etag?: string;
    remoteReadbackFullBodyHashVerification: true;
  }> {
    const expected = assertEnvelopeForR2(input.envelope);
    const key = resolveCanonicalObjectKey(this.engine, input.envelope);

    let output: { Body?: unknown; ETag?: string; ContentLength?: number };
    try {
      output = (await this.sender.send(
        new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      )) as typeof output;
    } catch (error: unknown) {
      if (isNotFound(error)) {
        failClosed('R2_OBJECT_NOT_FOUND', 'objeto R2 ausente');
      }
      failClosed('R2_GET_FAILED', 'GET R2 falhou');
    }

    const ciphertext = await readS3Body(output.Body);
    if (ciphertext.length !== expected.length) {
      failClosed('R2_GET_BODY_TRUNCATED', 'body GET truncado ou tamanho divergente');
    }
    const sha256 = createHash('sha256').update(ciphertext).digest('hex');
    if (sha256 !== input.envelope.ciphertext_sha256) {
      failClosed('R2_GET_HASH_MISMATCH', 'SHA-256 dos bytes GET diverge do ciphertext local');
    }
    if (!ciphertext.equals(expected)) {
      failClosed('R2_GET_HASH_MISMATCH', 'bytes GET adulterados');
    }

    return {
      ciphertext,
      sha256,
      etag: output.ETag,
      remoteReadbackFullBodyHashVerification: true,
    };
  }
}

export function createAvantR2ObjectStore(input: R2ClientFactoryInput): AvantR2ObjectStore {
  const allowlist = input.allowlist ?? CANONICAL_PRODUCTION_ALLOWLIST;
  const endpointConfig = createR2EndpointConfig(input.accountId, allowlist);
  const bucket = input.bucket ?? CANONICAL_PRODUCTION_R2_BUCKET;
  assertAllowedR2Bucket(bucket, allowlist);

  const hasCreds = Boolean(input.credentials?.accessKeyId?.trim() && input.credentials?.secretAccessKey?.trim());
  if (!input.sender && !hasCreds) {
    failClosed('R2_CREDENTIALS_ABSENT', 'credenciais R2 ausentes');
  }

  const sender =
    input.sender ??
    createProductionS3CommandSender(createR2S3Client(endpointConfig, input.credentials as R2RuntimeCredentials));

  const engine = input.engine ?? new BackupEngine();
  return new AvantR2ObjectStore({ sender, bucket, endpointConfig, engine });
}

export function inspectAllowedR2Command(command: AllowedR2Command): 'PUT' | 'HEAD' | 'GET' {
  const op = commandOp(command);
  if (op === 'OTHER') {
    failClosed('R2_OPERATION_NOT_ALLOWED', 'comando S3 não permitido');
  }
  return op;
}
