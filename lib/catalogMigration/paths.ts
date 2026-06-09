import { resolve } from 'node:path';

export const CATALOG_MIGRATION_ROOT = resolve(process.cwd(), 'data/catalog-migration');

export function loteDir(lote: string): string {
  return resolve(CATALOG_MIGRATION_ROOT, lote);
}

export function loteQuestionsDir(lote: string): string {
  return resolve(loteDir(lote), 'questions');
}

export function loteManifestPath(lote: string): string {
  return resolve(loteDir(lote), 'manifest.json');
}

export function loteCatalogPath(lote: string): string {
  return resolve(loteDir(lote), 'catalog.json');
}

export function questionFilePath(lote: string, moduloSlug: string): string {
  return resolve(loteQuestionsDir(lote), `${moduloSlug}.json`);
}
