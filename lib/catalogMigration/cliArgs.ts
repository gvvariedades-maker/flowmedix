export function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

export function parseArg(name: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit?.split('=').slice(1).join('=');
}

export function requireArg(name: string): string {
  const value = parseArg(name)?.trim();
  if (!value) {
    throw new Error(`Parâmetro obrigatório: --${name}=...`);
  }
  return value;
}

export function parseCsvArg(name: string): string[] | null {
  const raw = parseArg(name);
  if (!raw) return null;
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function parseLimitArg(defaultLimit = 500): number {
  const raw = parseArg('limit');
  if (!raw) return defaultLimit;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error('--limit deve ser um número positivo');
  }
  return Math.floor(n);
}
