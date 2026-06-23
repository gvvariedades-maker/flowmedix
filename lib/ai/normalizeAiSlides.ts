const VALID_BADGES = new Set(['hot', 'warn', 'ok', 'info']);

const BADGE_ALIASES: Record<string, 'hot' | 'warn' | 'ok' | 'info'> = {
  success: 'ok',
  error: 'warn',
  alert: 'warn',
  highlight: 'hot',
  danger: 'warn',
  warning: 'warn',
  info: 'info',
  ok: 'ok',
  hot: 'hot',
  warn: 'warn',
};

function normalizeBadge(raw: unknown): 'hot' | 'warn' | 'ok' | 'info' | undefined {
  if (typeof raw !== 'string') return undefined;
  const key = raw.trim().toLowerCase();
  if (VALID_BADGES.has(key)) return key as 'hot' | 'warn' | 'ok' | 'info';
  return BADGE_ALIASES[key];
}

/** Corrige badges inválidos em golden_rule.rows antes da validação Zod. */
export function normalizeAiSlides(slides: unknown[]): unknown[] {
  return slides.map((slide) => {
    if (!slide || typeof slide !== 'object') return slide;
    const s = slide as Record<string, unknown>;
    if (s.type !== 'golden_rule' || !Array.isArray(s.rows)) return slide;

    const rows = (s.rows as Record<string, unknown>[]).map((row) => {
      if (!row || typeof row !== 'object') return row;
      const badge = normalizeBadge(row.badge);
      if (badge) return { ...row, badge };
      const { badge: _removed, ...rest } = row;
      return rest;
    });

    return { ...s, rows };
  });
}
