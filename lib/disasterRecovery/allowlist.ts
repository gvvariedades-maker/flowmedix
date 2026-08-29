import { CANONICAL_ALLOWED_R2_BUCKETS } from '@/scripts/backup-automation';
import {
  ALLOWED_MANAGEMENT_HTTP_METHODS,
  CANONICAL_PRODUCTION_PROJECT_REF,
  CANONICAL_PRODUCTION_R2_BUCKET,
  R2_S3_HOST_PATTERN,
  SQL_READ_ONLY_PATH_TEMPLATE,
  SQL_WRITE_QUERY_PATH_TEMPLATE,
  SUPABASE_MANAGEMENT_API_HOST,
} from './constants';
import { failClosed } from './errors';

export type DrBackupAllowlist = {
  projectRefs: readonly string[];
  r2Buckets: readonly string[];
  r2Hosts: readonly string[];
  managementApiHosts: readonly string[];
  allowedHttpMethods: readonly string[];
};

/**
 * Canonical production destinations. Hosts stay empty until a dedicated R2 client lot
 * records an account id. Project ref / bucket are explicit constants, not free input.
 */
export const CANONICAL_PRODUCTION_ALLOWLIST: DrBackupAllowlist = {
  projectRefs: [CANONICAL_PRODUCTION_PROJECT_REF],
  r2Buckets: [CANONICAL_PRODUCTION_R2_BUCKET],
  r2Hosts: [],
  managementApiHosts: [SUPABASE_MANAGEMENT_API_HOST],
  allowedHttpMethods: ALLOWED_MANAGEMENT_HTTP_METHODS,
};

export type ManagementApiRequest = {
  host: string;
  method: string;
  path: string;
  projectRef: string;
};

export type R2Target = {
  host: string;
  bucket: string;
};

function normalizeHost(host: string): string {
  return host.trim().toLowerCase().replace(/\.$/, '');
}

function normalizePath(path: string): string {
  const trimmed = path.trim();
  const withoutQuery = trimmed.split('?')[0] ?? trimmed;
  const withoutHash = withoutQuery.split('#')[0] ?? withoutQuery;
  if (!withoutHash.startsWith('/')) {
    return `/${withoutHash}`;
  }
  return withoutHash.replace(/\/+$/, '') || '/';
}

function sqlReadOnlyPathForRef(projectRef: string): string {
  return SQL_READ_ONLY_PATH_TEMPLATE.replace('{ref}', projectRef);
}

function sqlWritePathForRef(projectRef: string): string {
  return SQL_WRITE_QUERY_PATH_TEMPLATE.replace('{ref}', projectRef);
}

export function assertCanonicalEngineBucket(bucket: string): void {
  const name = bucket.trim();
  if (!(CANONICAL_ALLOWED_R2_BUCKETS as readonly string[]).includes(name)) {
    failClosed('R2_BUCKET_NOT_ALLOWED', 'bucket fora do conjunto canônico do BackupEngine');
  }
}

export function assertAllowedProjectRef(
  projectRef: string,
  allowlist: DrBackupAllowlist = CANONICAL_PRODUCTION_ALLOWLIST,
): void {
  const ref = projectRef.trim();
  if (!ref || !allowlist.projectRefs.includes(ref)) {
    failClosed('PROJECT_REF_NOT_ALLOWED', 'project ref não permitido');
  }
}

export function assertAllowedHttpMethod(
  method: string,
  allowlist: DrBackupAllowlist = CANONICAL_PRODUCTION_ALLOWLIST,
): void {
  const normalized = method.trim().toUpperCase();
  if (!(allowlist.allowedHttpMethods as readonly string[]).includes(normalized)) {
    failClosed('HTTP_METHOD_NOT_ALLOWED', 'método HTTP não permitido');
  }
}

export function assertAllowedManagementEndpoint(
  request: ManagementApiRequest,
  allowlist: DrBackupAllowlist = CANONICAL_PRODUCTION_ALLOWLIST,
): void {
  const host = normalizeHost(request.host);
  const path = normalizePath(request.path);
  const method = request.method.trim().toUpperCase();
  const projectRef = request.projectRef.trim();

  if (!allowlist.managementApiHosts.map(normalizeHost).includes(host)) {
    failClosed('MANAGEMENT_HOST_NOT_ALLOWED', 'host da Management API não permitido');
  }

  assertAllowedProjectRef(projectRef, allowlist);
  assertAllowedHttpMethod(method, allowlist);

  const writePath = normalizePath(sqlWritePathForRef(projectRef));
  if (path === writePath) {
    failClosed(
      'SQL_WRITE_ENDPOINT_NOT_ALLOWED',
      'endpoint SQL genérico não autorizado pelo runner operacional; use query/read-only',
    );
  }

  const readOnlyPath = normalizePath(sqlReadOnlyPathForRef(projectRef));
  if (path !== readOnlyPath) {
    failClosed('MANAGEMENT_ENDPOINT_NOT_ALLOWED', 'endpoint não permitido');
  }
}

export function assertAllowedR2Host(
  host: string,
  allowlist: DrBackupAllowlist = CANONICAL_PRODUCTION_ALLOWLIST,
): void {
  const normalized = normalizeHost(host);
  if (!R2_S3_HOST_PATTERN.test(normalized)) {
    failClosed('R2_HOST_NOT_ALLOWED', 'host R2 fora do padrão <account-id>.r2.cloudflarestorage.com');
  }
  const allowed = allowlist.r2Hosts.map(normalizeHost);
  if (!allowed.includes(normalized)) {
    failClosed('R2_HOST_NOT_ALLOWED', 'host R2 não permitido');
  }
}

export function assertAllowedR2Bucket(
  bucket: string,
  allowlist: DrBackupAllowlist = CANONICAL_PRODUCTION_ALLOWLIST,
): void {
  const name = bucket.trim();
  assertCanonicalEngineBucket(name);
  if (!allowlist.r2Buckets.includes(name)) {
    failClosed('R2_BUCKET_NOT_ALLOWED', 'bucket não permitido');
  }
}

export function assertAllowedR2Target(
  target: R2Target,
  allowlist: DrBackupAllowlist = CANONICAL_PRODUCTION_ALLOWLIST,
): void {
  assertAllowedR2Host(target.host, allowlist);
  assertAllowedR2Bucket(target.bucket, allowlist);
}
