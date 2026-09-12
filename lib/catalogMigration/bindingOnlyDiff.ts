/**
 * RC-004 binding-only — deep diff com allowlist de metadata comercial.
 * Arrays são comparados por conteúdo (não por referência).
 */

export const BINDING_ONLY_ALLOWED_EFFICACY_KEYS = new Set([
  'a4_reviewed',
  'a4_reviewer',
  'approved_content_fingerprint',
  'auto_approved_at',
]);

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

export function deepValueEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => deepValueEqual(v, b[i]));
  }
  if (!isPlainObject(a) || !isPlainObject(b)) return false;
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((k) => deepValueEqual(a[k], b[k]));
}

export function efficacyAllowlistViolations(
  preEc: Record<string, unknown>,
  postEc: Record<string, unknown>,
): string[] {
  const violations: string[] = [];
  for (const k of new Set([...Object.keys(preEc), ...Object.keys(postEc)])) {
    if (!BINDING_ONLY_ALLOWED_EFFICACY_KEYS.has(k) && preEc[k] !== postEc[k]) {
      violations.push(`efficacy_contract.${k} changed`);
    }
  }
  return violations;
}

/** Compara payloads ignorando blocos de aprovação comercial em meta. */
export function structuralEqualIgnoringApproval(
  pre: unknown,
  post: unknown,
  path = '',
): string[] {
  const violations: string[] = [];
  if (pre === post) return violations;
  if (typeof pre !== typeof post) {
    violations.push(`${path}: type changed`);
    return violations;
  }
  if (Array.isArray(pre) && Array.isArray(post)) {
    if (!deepValueEqual(pre, post)) violations.push(`${path}: value changed`);
    return violations;
  }
  if (!isPlainObject(pre) || !isPlainObject(post)) {
    if (pre !== post) violations.push(`${path}: value changed`);
    return violations;
  }

  const preKeys = new Set(Object.keys(pre));
  const postKeys = new Set(Object.keys(post));
  for (const k of preKeys) {
    if (!postKeys.has(k)) violations.push(`${path}.${k}: removed`);
  }
  for (const k of postKeys) {
    if (!preKeys.has(k)) violations.push(`${path}.${k}: added`);
  }

  for (const key of preKeys) {
    if (!postKeys.has(key)) continue;
    const p = path ? `${path}.${key}` : key;
    if (key === 'meta' && isPlainObject(pre.meta) && isPlainObject(post.meta)) {
      const preMeta = pre.meta as Record<string, unknown>;
      const postMeta = post.meta as Record<string, unknown>;
      for (const mk of new Set([...Object.keys(preMeta), ...Object.keys(postMeta)])) {
        if (mk === 'efficacy_contract' || mk === 'anchor_100_approval') continue;
        violations.push(
          ...structuralEqualIgnoringApproval(preMeta[mk], postMeta[mk], `${p}.${mk}`),
        );
      }
      continue;
    }
    violations.push(...structuralEqualIgnoringApproval(pre[key], post[key], p));
  }
  return violations;
}

export type BindingOnlyDiffResult = {
  ok: boolean;
  structuralViolations: string[];
  allowlistViolations: string[];
};

export function assertBindingOnlyDiffAllowlist(
  prePayload: unknown,
  postPayload: unknown,
): BindingOnlyDiffResult {
  const structuralViolations = structuralEqualIgnoringApproval(prePayload, postPayload);
  const preEc =
    (isPlainObject(prePayload) &&
      isPlainObject(prePayload.meta) &&
      isPlainObject((prePayload.meta as Record<string, unknown>).efficacy_contract) &&
      ((prePayload.meta as Record<string, unknown>).efficacy_contract as Record<string, unknown>)) ||
    {};
  const postEc =
    (isPlainObject(postPayload) &&
      isPlainObject(postPayload.meta) &&
      isPlainObject((postPayload.meta as Record<string, unknown>).efficacy_contract) &&
      ((postPayload.meta as Record<string, unknown>).efficacy_contract as Record<string, unknown>)) ||
    {};
  const allowlistViolations = efficacyAllowlistViolations(preEc, postEc);
  return {
    ok: structuralViolations.length === 0 && allowlistViolations.length === 0,
    structuralViolations,
    allowlistViolations,
  };
}
