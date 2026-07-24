import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Carrega fixture JSON do diretório local (determinístico; sem I/O de rede).
 */
export function loadEvidenceFixture<T>(filename: string): T {
  const path = join(__dirname, filename);
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}
