/** Canonical off-site snapshot format. AES-256-GCM / KEK→DEK is owned by BackupEngine. */
export const SNAPSHOT_FORMAT = 'AVANT_DR_SNAPSHOT_V1' as const;

export type SnapshotFormat = typeof SNAPSHOT_FORMAT;

export const CANONICAL_CRYPTO_REPLACEMENT_ALLOWED = false;

export const REAL_R2_CLIENT_IMPLEMENTATION_FOUND = 'YES' as const;
export const REAL_R2_UPLOAD_IMPLEMENTED_IN_THIS_LOT = 'YES' as const;
export const STORAGE_OBJECT_BYTES_CAPTURE = 'NOT_PROVEN' as const;

/** New operational runner may only target the Management API read-only SQL path. */
export const PRODUCTION_SQL_ENDPOINT_ALLOWED_BY_NEW_RUNNER = 'READ_ONLY_ONLY' as const;

export const CANONICAL_PRODUCTION_PROJECT_REF = 'ozgouenqrofnvgrlgfwd' as const;

export const SUPABASE_MANAGEMENT_API_HOST = 'api.supabase.com' as const;

export const SQL_READ_ONLY_PATH_TEMPLATE = '/v1/projects/{ref}/database/query/read-only' as const;

/** Historical drill path — not authorized for the operational runner. */
export const SQL_WRITE_QUERY_PATH_TEMPLATE = '/v1/projects/{ref}/database/query' as const;

export const ALLOWED_MANAGEMENT_HTTP_METHODS = ['POST'] as const;

export const R2_S3_HOST_SUFFIX = '.r2.cloudflarestorage.com' as const;

/** `<account-id>.r2.cloudflarestorage.com` — Cloudflare account ids are 32 hex chars. */
export const R2_S3_HOST_PATTERN = /^[0-9a-f]{32}\.r2\.cloudflarestorage\.com$/;

/** Must remain a member of CANONICAL_ALLOWED_R2_BUCKETS in scripts/backup-automation.ts. */
export const CANONICAL_PRODUCTION_R2_BUCKET = 'avant-disaster-recovery-vault' as const;
