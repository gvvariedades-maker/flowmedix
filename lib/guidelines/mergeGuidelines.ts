import type { GuidelineTable } from '@/lib/guidelines/types';

/** Une várias tabelas do mesmo subtópico para factcheck/IA. */
export function mergeGuidelineTables(tables: GuidelineTable[]): GuidelineTable | null {
  if (tables.length === 0) return null;
  if (tables.length === 1) return tables[0];

  const [first] = tables;
  return {
    id: tables.map((t) => t.id).join('+'),
    snapshot: first.snapshot,
    issuer: first.issuer,
    title: first.title,
    year: first.year,
    url: first.url,
    entries: tables.flatMap((t) => t.entries),
  };
}
