/**
 * Catálogo Língua Portuguesa — inventário de questões e helpers para pipeline de figuras.
 * @see docs/DECISAO_QUESTAO_FIGURES.md · docs/LINGUA_PORTUGUESA_GUIDELINES.md § Figuras
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { CATALOG_MIGRATION_ROOT } from '@/lib/catalogMigration/paths';

const SOURCE_DIR = resolve(process.cwd(), 'data/sources/lingua-portuguesa');

/** Pacotes handcraft PT (playbook lingua-portuguesa.json). */
export const LINGUA_PORTUGUESA_PACOTE_PREFIXES = [
  'lingua-portuguesa',
  'classes-de-palavras',
  'colocacao-pronominal',
  'termos-oracao',
  'concordancia-verbal-e-nominal',
  'oracoes-coordenadas-e-subordinadas',
  'pontuacao',
] as const;

export type PortuguesQuestionRef = {
  slug: string;
  lote: string;
  path: string;
  payload: unknown;
};

export function isLinguaPortuguesaLoteDir(dirName: string): boolean {
  return LINGUA_PORTUGUESA_PACOTE_PREFIXES.some(
    (prefix) => dirName === prefix || dirName.startsWith(`${prefix}-g`),
  );
}

/** tec_id numérico no final do slug (padrão caderno Tec). */
export function extractTecIdFromSlug(slug: string): string | null {
  const match = slug.match(/-(\d{5,})$/);
  return match ? match[1] : null;
}

export function findQuestionJsonPath(slug: string): string | null {
  const all = findAllQuestionJsonPaths(slug);
  return all[0] ?? null;
}

/** Mesmo slug pode existir em lingua-portuguesa-gNN e pontuacao-gNN (espelho). */
export function findAllQuestionJsonPaths(slug: string): string[] {
  const paths: string[] = [];
  for (const dir of readdirSync(CATALOG_MIGRATION_ROOT)) {
    const path = join(CATALOG_MIGRATION_ROOT, dir, 'questions', `${slug}.json`);
    if (existsSync(path)) paths.push(path);
  }
  return paths;
}

export function loadAllPortuguesQuestions(): PortuguesQuestionRef[] {
  const entries: PortuguesQuestionRef[] = [];
  for (const dirName of readdirSync(CATALOG_MIGRATION_ROOT)) {
    if (!isLinguaPortuguesaLoteDir(dirName)) continue;
    const questionsDir = join(CATALOG_MIGRATION_ROOT, dirName, 'questions');
    if (!existsSync(questionsDir)) continue;
    for (const file of readdirSync(questionsDir)) {
      if (!file.endsWith('.json')) continue;
      const slug = file.replace(/\.json$/, '');
      const path = join(questionsDir, file);
      const payload = JSON.parse(readFileSync(path, 'utf8'));
      entries.push({ slug, lote: dirName, path, payload });
    }
  }
  return entries;
}

export const LINGUA_PORTUGUESA_PDF_DEFAULT =
  'data/sources/lingua-portuguesa/portugues-caderno-2025-2026.pdf';

/** Todos os volumes do caderno PT (manifest.json). */
export function listPortuguesPdfPaths(): string[] {
  const manifestPath = join(SOURCE_DIR, 'manifest.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
    sources?: Array<{ file?: string }>;
  };
  return (manifest.sources ?? [])
    .map((s) => s.file)
    .filter((f): f is string => Boolean(f))
    .map((f) => join(SOURCE_DIR, f));
}
