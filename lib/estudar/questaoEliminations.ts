const STORAGE_PREFIX = 'avant:questao-eliminadas:';

function storageKey(slug: string): string {
  return `${STORAGE_PREFIX}${slug}`;
}

/** Lê alternativas eliminadas da sessão (por slug da questão). */
export function readQuestaoEliminations(slug: string): Set<string> {
  if (typeof window === 'undefined' || !slug.trim()) return new Set();
  try {
    const raw = window.sessionStorage.getItem(storageKey(slug));
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === 'string' && id.length > 0));
  } catch {
    return new Set();
  }
}

/** Persiste eliminações na sessão; remove a chave quando o conjunto está vazio. */
export function writeQuestaoEliminations(slug: string, ids: Set<string>): void {
  if (typeof window === 'undefined' || !slug.trim()) return;
  try {
    const key = storageKey(slug);
    if (ids.size === 0) {
      window.sessionStorage.removeItem(key);
      return;
    }
    window.sessionStorage.setItem(key, JSON.stringify([...ids]));
  } catch {
    // quota ou modo privado — ignorar sem quebrar o player
  }
}

export function clearQuestaoEliminations(slug: string): void {
  writeQuestaoEliminations(slug, new Set());
}
