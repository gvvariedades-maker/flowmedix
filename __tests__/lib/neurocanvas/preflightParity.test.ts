import { existsSync, mkdirSync, mkdtempSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import {
  countQuestionJsonFilesUnder,
  evaluateCatalogPreflight,
} from '../../../scripts/preflight-neurocanvas-parity';

const TRACKED_ARTIFACT = 'artifacts/neurocanvas-catalog-audit.json';

function snapshotArtifact(): { exists: boolean; mtimeMs: number; size: number } {
  if (!existsSync(TRACKED_ARTIFACT)) {
    return { exists: false, mtimeMs: 0, size: 0 };
  }
  const { mtimeMs, size } = statSync(TRACKED_ARTIFACT);
  return { exists: true, mtimeMs, size };
}

function materializeMinimalCatalog(root: string): void {
  const questionPath = join(root, 'pacote', 'questions', 'questao.json');
  mkdirSync(join(root, 'pacote', 'questions'), { recursive: true });
  writeFileSync(questionPath, JSON.stringify({ meta: { banca: 'FIXTURE' } }), 'utf8');
}

describe('neurocanvas preflightParity (pure)', () => {
  it('diretório vazio → evaluateCatalogPreflight não ok', () => {
    const before = snapshotArtifact();
    const emptyRoot = mkdtempSync(join(tmpdir(), 'avant-preflight-empty-'));

    try {
      expect(countQuestionJsonFilesUnder(emptyRoot)).toBe(0);
      expect(evaluateCatalogPreflight(emptyRoot).ok).toBe(false);
    } finally {
      rmSync(emptyRoot, { recursive: true, force: true });
      const after = snapshotArtifact();
      expect(after).toEqual(before);
    }
  });

  it('pacote/questions/questao.json → evaluateCatalogPreflight ok', () => {
    const before = snapshotArtifact();
    const catalogRoot = mkdtempSync(join(tmpdir(), 'avant-preflight-valid-'));

    try {
      materializeMinimalCatalog(catalogRoot);
      expect(countQuestionJsonFilesUnder(catalogRoot)).toBe(1);
      expect(evaluateCatalogPreflight(catalogRoot)).toMatchObject({
        ok: true,
        questionFiles: 1,
        catalogRoot,
      });
    } finally {
      rmSync(catalogRoot, { recursive: true, force: true });
      const after = snapshotArtifact();
      expect(after).toEqual(before);
    }
  });
});
