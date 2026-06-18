/**
 * Tabelas oficiais versionadas — única fonte para builders (não inventar número).
 */

export type GuidelineEntry = {
  id: string;
  label: string;
  value: string;
  detail?: string;
  sourceId: string;
};

export type GuidelineTable = {
  id: string;
  snapshot: string;
  issuer: string;
  title: string;
  year: number;
  url?: string;
  entries: GuidelineEntry[];
};
