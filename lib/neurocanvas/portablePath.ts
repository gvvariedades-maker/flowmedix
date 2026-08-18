import { isAbsolute, normalize, relative, resolve, sep } from 'node:path';

const WINDOWS_DRIVE_RE = /^[A-Za-z]:[\\/]/;
const UNIX_ABSOLUTE_RE = /^\/(?!\/)/;

export class PortablePathError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PortablePathError';
  }
}

/**
 * Converte path absoluto em path relativo ao repo, separador `/`, sem `..` escape.
 */
export function toPortableRepoPath(absolutePath: string, repoRoot: string): string {
  const abs = normalize(resolve(absolutePath));
  const root = normalize(resolve(repoRoot));

  if (!isAbsolute(abs)) {
    return normalizePortableSeparators(abs);
  }

  const rel = relative(root, abs);
  if (rel.startsWith(`..${sep}`) || rel === '..') {
    throw new PortablePathError(`Path escapa do repo: ${absolutePath}`);
  }

  return normalizePortableSeparators(rel);
}

export function normalizePortableSeparators(path: string): string {
  return path.replace(/\\/g, '/');
}

export function isWindowsDrivePath(value: string): boolean {
  return WINDOWS_DRIVE_RE.test(value);
}

export function isUnixAbsoluteLocalPath(value: string): boolean {
  return UNIX_ABSOLUTE_RE.test(value);
}

function looksLikePathString(value: string): boolean {
  if (isWindowsDrivePath(value)) return true;
  if (isUnixAbsoluteLocalPath(value)) return true;
  if (value.includes('catalog-migration/') && value.endsWith('.json')) return true;
  return false;
}

function portableizeValue(value: unknown, repoRoot: string): unknown {
  if (typeof value === 'string') {
    if (!looksLikePathString(value)) return value;
    if (isWindowsDrivePath(value) || isUnixAbsoluteLocalPath(value)) {
      return toPortableRepoPath(value, repoRoot);
    }
    return normalizePortableSeparators(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => portableizeValue(item, repoRoot));
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      out[key] = portableizeValue(child, repoRoot);
    }
    return out;
  }
  return value;
}

/** Serialização de artifacts: paths relativos, separador `/`, sem drive letter. */
export function portableizeAuditArtifact<T>(value: T, repoRoot: string): T {
  return portableizeValue(value, repoRoot) as T;
}

const SECRET_PATTERNS = [
  /sk_live_[A-Za-z0-9]+/,
  /sk_test_[A-Za-z0-9]+/,
  /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/,
  /SUPABASE_SERVICE_ROLE_KEY/,
  /password\s*[:=]/i,
];

export function scanPortableArtifactText(text: string): string[] {
  const issues: string[] = [];
  if (isWindowsDrivePath(text) || /[A-Za-z]:\\/.test(text)) {
    issues.push('windows_drive_path');
  }
  if (/\/home\/[^/\s]+/.test(text) || /\/Users\/[^/\s]+/.test(text)) {
    issues.push('unix_home_absolute');
  }
  for (const pattern of SECRET_PATTERNS) {
    if (pattern.test(text)) issues.push(`secret_pattern:${pattern.source}`);
  }
  return issues;
}
