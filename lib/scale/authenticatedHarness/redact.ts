const SECRET_KEYS = new Set([
  'access_token',
  'refresh_token',
  'cookie_header',
  'supabase_anon_key',
  'authorization',
  'cookie',
]);

export function redactSecretsDeep<T>(value: T): T {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) {
    return value.map((item) => redactSecretsDeep(item)) as T;
  }
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (SECRET_KEYS.has(key.toLowerCase())) {
        out[key] = '<redacted>';
      } else if (typeof val === 'string' && (key === 'Cookie' || key === 'Authorization')) {
        out[key] = '<redacted>';
      } else {
        out[key] = redactSecretsDeep(val);
      }
    }
    return out as T;
  }
  return value;
}

export function assertPlanHasNoRawSecrets(serialized: string): void {
  const forbidden = [
    /Bearer eyJ/i,
    /sb-access-token=/i,
    /sb-refresh-token=/i,
    /"access_token"\s*:\s*"[^<]/i,
    /"cookie_header"\s*:\s*"[^<]/i,
  ];
  for (const pattern of forbidden) {
    if (pattern.test(serialized)) {
      throw new Error('Plano serializado contém credencial em texto claro');
    }
  }
}
