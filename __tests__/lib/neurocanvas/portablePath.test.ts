import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import {
  isWindowsDrivePath,
  scanPortableArtifactText,
  toPortableRepoPath,
} from '@/lib/neurocanvas/portablePath';

describe('neurocanvas portablePath', () => {
  const repoRoot = resolve(__dirname, '../../..');

  it('converte path absoluto em relativo com separador /', () => {
    const abs = join(repoRoot, 'data/catalog-migration/lote/questions/slug.json');
    expect(toPortableRepoPath(abs, repoRoot)).toBe('data/catalog-migration/lote/questions/slug.json');
  });

  it('rejeita path que escapa do repo', () => {
    const outside = resolve(repoRoot, '..', 'outside.json');
    expect(() => toPortableRepoPath(outside, repoRoot)).toThrow(/escapa do repo/);
  });

  it('artifacts neurocanvas rastreados não contêm drive letter nem secrets', () => {
    const artifactDir = join(repoRoot, 'artifacts');
    const tracked = [
      'neurocanvas-blocker-samples-20.json',
      'neurocanvas-audit-report-data.json',
      'neurocanvas-resolver-audit-anchors.json',
    ];

    for (const file of tracked) {
      const full = join(artifactDir, file);
      let text: string;
      try {
        text = readFileSync(full, 'utf8');
      } catch {
        continue;
      }
      expect(isWindowsDrivePath(text)).toBe(false);
      expect(text).not.toMatch(/[A-Za-z]:\\/);
      const issues = scanPortableArtifactText(text);
      expect(issues).toEqual([]);
    }
  });
});
